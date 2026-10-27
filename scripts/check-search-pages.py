"""Check crawlability and local links for the marketing URLs in the sitemap."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote, urljoin
import xml.etree.ElementTree as ET
import json

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags=[]; self.title=''; self.h1=0; self.meta={}; self.canonical=[]; self.links=[]; self.assets=[]; self.schemas=[]; self.schema=False; self.buffer=''
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append(tag)
        if tag=='h1': self.h1+=1
        if tag=='meta': self.meta.setdefault(a.get('name',a.get('property')),[]).append(a.get('content',''))
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a['href'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ['img','script'] and a.get('src'): self.assets.append(a['src'])
        if tag=='link' and a.get('rel') in ['stylesheet','icon']: self.assets.append(a['href'])
        if tag=='script' and a.get('type')=='application/ld+json': self.schema=True;self.buffer=''
    def handle_endtag(self, tag):
        if tag=='script' and self.schema:
            self.schemas.append(json.loads(self.buffer));self.schema=False
        if self.tags and self.tags[-1]==tag:self.tags.pop()
    def handle_data(self, data):
        if self.tags and self.tags[-1]=='title':self.title+=data
        if self.schema:self.buffer+=data

urls=[node.text for node in ET.parse(ROOT/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
titles=set();descriptions=set();pages={}
for url in urls:
    path=urlparse(url).path
    local=ROOT/(path.strip('/')+'/index.html' if path!='/' else 'index.html')
    page=Page(local.read_text());pages[path]=page
    assert page.title and page.title not in titles,(path,'missing/duplicate title')
    titles.add(page.title)
    description=page.meta.get('description',[''])[0]
    assert description and description not in descriptions,(path,'missing/duplicate description')
    descriptions.add(description)
    assert page.h1==1,(path,'H1 count',page.h1)
    assert page.canonical==[url],(path,'canonical',page.canonical)
    assert not any('noindex' in value for value in page.meta.get('robots',[])),(path,'noindex')
    assert len(page.meta.get('og:image',[]))==1,(path,'OG image count')
    assert page.schemas,(path,'missing structured data')
    for target in page.links+page.assets+page.meta.get('og:image',[]):
        parsed=urlparse(urljoin(url,target))
        if parsed.netloc!='studiovangeene.nl':continue
        candidate=ROOT/unquote(parsed.path.lstrip('/'))
        if parsed.path.endswith('/'):candidate=candidate/'index.html'
        assert candidate.is_file(),(path,'missing target',target)
    print(path,': metadata, structured data and local links OK')
reachable={'/'}
for _ in pages:
    for path in list(reachable):
        reachable.update(urlparse(urljoin('https://studiovangeene.nl'+path,link)).path for link in pages.get(path,Page('')).links if urlparse(urljoin('https://studiovangeene.nl'+path,link)).netloc=='studiovangeene.nl')
assert set(pages).issubset(reachable),'orphaned pages'
assert 'Sitemap: https://studiovangeene.nl/sitemap.xml' in (ROOT/'robots.txt').read_text()
config=json.loads((ROOT/'scripts/indexnow.json').read_text())
assert config['urlList']==urls
assert (ROOT/(config['key']+'.txt')).read_text().strip()==config['key']
print('PASS:',len(urls),'crawlable URLs; sitemap, IndexNow and navigation consistent')
