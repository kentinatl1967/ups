---
name: UPS-scaper
description: scraping data from ups tracking page
---

## Argument
$awb = 44869075

## Overview
The goal is to collect tracking information from UPS

## instruction
1. Go to URL https://www.aircargo.ups.com/en-US/Tracking?awbPrefix=406&awbNumber=
2. attach the value of $awb to the end of the url
3. execute the url
4. use the IATA CIMP FSA specification to get status information base on status type, ignore Released status. 
Flight number could also contain date, and two city codes.
