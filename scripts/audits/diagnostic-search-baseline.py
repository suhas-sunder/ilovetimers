"""Recompute supplied exports; no network or inferred Query+Page joins."""
import csv, datetime as dt, hashlib, io, json, pathlib, zipfile
from collections import defaultdict
from urllib.parse import urlparse
root=pathlib.Path(__file__).resolve().parents[2]
downloads=pathlib.Path.home()/'Downloads'
gsc=downloads/'ilovetimers.com-Performance-on-Search-2026-11-12.zip'
bing=downloads/'ilovetimers.com_SearchPerformanceOverview_All_11_13_2026.csv'
with zipfile.ZipFile(gsc) as z:
    tables={n:list(csv.DictReader(io.StringIO(z.read(n).decode('utf-8-sig')))) for n in z.namelist() if n.endswith('.csv')}
with bing.open(encoding='utf-8-sig',newline='') as f: b=list(csv.DictReader(f))
def total(rows):
    return {'rows':len(rows),'clicks':sum(int(r['Clicks']) for r in rows),'impressions':sum(int(r['Impressions']) for r in rows)}
def windows(rows,fmt):
    dated=[(dt.datetime.strptime(r['Date'],fmt).date(),r) for r in rows]
    end=max(d for d,r in dated)
    recent=[r for d,r in dated if end-d<dt.timedelta(days=28)]
    previous=[r for d,r in dated if dt.timedelta(days=28)<=end-d<dt.timedelta(days=56)]
    a,c=total(recent),total(previous)
    return {'start':str(min(d for d,r in dated)),'end':str(end),'total':total(rows),'latest28':a,'prior28':c,'clickChangePercent':100*(a['clicks']/c['clicks']-1)}
pages=defaultdict(lambda:{'clicks':0,'impressions':0,'urls':[]})
for r in tables['Pages.csv']:
    p=urlparse(r['Top pages']).path.rstrip('/') or '/'
    pages[p]['clicks']+=int(r['Clicks']);pages[p]['impressions']+=int(r['Impressions']);pages[p]['urls'].append(r['Top pages'])
report={'sourceHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [gsc,bing]},'google':windows(tables['Chart.csv'],'%Y-%m-%d'),'bing':windows(b,'%m/%d/%Y %I:%M:%S %p'),'tableTotals':{n:total(rows) for n,rows in tables.items() if rows and 'Clicks' in rows[0]},'normalizedPageCount':len(pages),'dualVariants':sum(len(p['urls'])>1 for p in pages.values()),'pages':dict(sorted(pages.items(),key=lambda kv:-kv[1]['clicks'])),'countries':tables['Countries.csv'],'devices':tables['Devices.csv'],'limits':['Queries is capped at 1000 rows; no Query+Page join supplied.','No Bing landing-page/query/device/country split supplied.','Page and property denominators differ; do not sum or conflate.','These exports do not measure revenue, sessions, retention, or current field CWV.']}
full_urls=defaultdict(list)
for row in tables['Pages.csv']:
    full_urls[row['Top pages'].rstrip('/')].append(row['Top pages'])
report['fullUrlSlashNormalizedCount']=len(full_urls)
report['fullUrlDualSlashVariants']=sum(len(v)>1 for v in full_urls.values())
report['normalizationNote']='normalizedPageCount/dualVariants group pathname across schemes/hosts; fullUrl fields retain scheme and host and only remove terminal slash. Historical baseline uses the latter.'
output=root/'ai-issues/evidence/2026-W46/raw-search-recalculation.json'
output.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['google','bing','tableTotals','normalizedPageCount','dualVariants']},indent=2))
