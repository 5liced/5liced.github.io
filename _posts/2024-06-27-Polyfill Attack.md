---
title: "Polyfill Supply Chain Attack"
date: 2024-06-27
categories: [News]
tags: [News,]
---

#### Roly Poly Attack?

Polyfill is a very popular javascript library that allows old browseres to use functions that modern browsers have. Over 100,000 sites use this library and have been impacted by it including JSTOR and Intuit among the big names.

#### So What happened?

In Feburary 2024 the `polyfill.io` domain was purchased by a Chinese Company Funnull. This already put many security researchers on edge because having a foreign organization with no repuation handle a library as such was suspicious. The original developer already warned that he had no influence or control over the domain being sold and to remove `polyfill.io` from their sites.

After a few months Funnull changed the CNAME to `polyfill.io.bsclink.cn` which essentially forced all sites that have `cdn.polyfill.io` scripts to directly pull from Funnulls website. Developers further investigated and noticed that they are maliciously redirecting users phishing sites such as fake Sports Betting sites. There was many different malware/attack vectors noticed and some of the code also had reverse engineering protections. Another interesting behavior was that it only activated for mobile users during specific times of the day. This was most likely an attempt to be discrete from security researchers which didn't pan out well for them.

