---
layout: post
title: "Cohort — HTB Writeup"
box_name: Cohort
box_icon: /assets/images/boxes/cohort.png
os: Linux
difficulty: Easy
points: 20
retired: "2026-08-03"
tags: [ssrf, marimo, packagekit]
---

>`Cohort` is a simple machine focusing on enumeration and using CVE's to priv escalate 


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


There is also a portal page that allows us to submit a public url and it would pull the data from the file we uploaded. I hosted a normal csv from my machine and caputured the output in burp. I noticed that the site sent a POST request to a `/api/validate/` endpoint which returned back if it was sucessful and the content. The hints and description leaned towards SSRF so I used a list of localhost varients to brute force check if its reachable using burp suite. I found `http://0` was able to bypass the filter. I then began to enumerate to see if I could access any files and what ports were open on the internal side. 


## User
I found a few ports open, port 80 revealed to me a subdomain for a marimo notebook application being hosted on internal port 8888 and publically accessible on the subdomain ``. It was locked behind a Authentication token but after some reasearch I found a CVE that allows RCE without any authentication using websockets. Using the CVE i was able to reach user.

<div class="flag">user.txt captured</div>
```flag
marimo@cohort:~$ cat user.txt
```

# Root
To reach root I checked the packages that were installed using 

```console
dpkg -l
```
I found a package kit CVE that allowed RCE which gave me root

<div class="flag">root.txt captured</div>
```flag
root@cohort:~$ cat root.txt
```

