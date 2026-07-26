---
layout: post
title: "SmartHire — HTB Writeup"
box_name: SmartHire
box_icon: /assets/images/boxes/smarthire.png
os: Linux
difficulty: Medium
points: 20
retired: "2026-07-25"
tags: [mflow, python, sudol, ]
---

>`SmartHire` was a medium machine involving a CVE abusing a python deserialization and reaching root by a sudo -l weakness


## Recon

Starting with the basic nmap and looking around

```console
nmap -p- -vvv --min-rate 10000 <MACHINE_IP>
```

| Port  | Service |
| ------------- | ------------- |
| 22  | ssh  |
| 80  | http  |


Http on port `80` tells us there is a website being hosted, after adding the ip to our /etc/hosts file we see:


The webpage allows me to sign up an account and upload/test a model but there isn't much we can do after that on the site. Further enumeration reveals a subdomain
`models.smarthire.htb`

## Foothold

The subdomain reveals a page hosting `MFlow 2.14.1` which is vulnerable to a RCE using `CVE-2024-37054`. I am able to pop a shell as `svcweb` which is also the correct user for the flag.

<div class="flag">user.txt captured</div>
```flag
svcweb@smarthire:~$ cat user.txt
```

## Root

After exploring the account I discover that we are able to run a python program as root.

```
svcweb@smarthire:~$ sudo -l
Matching Defaults entries for svcweb on smarthire:
    env_reset,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User svcweb may run the following commands on smarthire:
    (root) NOPASSWD: /usr/bin/python3.10 /opt/tools/mlflow_ctl/mlflowctl.py *
```
The program goes through the plugins directory and runs code on each plugin found. I was able to create a malicious plugin that runs my own python code retrieving the root flag since I am able to run the program as root.

<div class="flag">root.txt captured</div>
```flag
svcweb@smarthire:~$ cat root.txt
```

