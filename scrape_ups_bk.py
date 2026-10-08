"""Scrape UPS Air Cargo tracking for an AWB (prefix 406) -> test/406-<awb>.json
Usage: python scrape_ups.py [awb]   (default 44869075)
"""
import re, json, html, sys, urllib.request

awb = sys.argv[1] if len(sys.argv) > 1 else "44869075"
url = f"https://www.aircargo.ups.com/en-US/Tracking?awbPrefix=406&awbNumber={awb}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36"})
src = urllib.request.urlopen(req).read().decode("utf-8")

def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

tbody = re.search(r'id="TrackDataTable">.*?<tbody>(.*?)</tbody>', src, re.S).group(1)
events = []
for row in re.findall(r"<tr>(.*?)</tr>", tbody, re.S):
    c = [clean(x) for x in re.findall(r"<td>(.*?)</td>", row, re.S)]
    events.append({"status": c[0], "flight": c[2].split(" ")[0] if c[2] else None,
                   "pieces": int(c[3]) if c[3].isdigit() else c[3], "eventDateTime": c[4]})

out = f"test/406-{awb}.json"
json.dump(events, open(out, "w", encoding="utf-8"), indent=2)
print(f"{len(events)} events -> {out}")
