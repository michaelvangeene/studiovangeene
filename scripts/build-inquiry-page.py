"""Build the project enquiry page with public, allowlisted entry context."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
projects = json.loads((ROOT / 'projects.json').read_text())
sources = {p['slug']: {'label': p['title'], 'kind': p.get('kind', '')} for p in projects}
for slug, label, kind in [
    ('bouwkundig-tekenaar-utrecht', 'Bouwkundig tekenwerk', 'verbouwing'),
    ('vergunningtekeningen', 'Vergunningtekeningen', 'vergunning'),
    ('dakopbouw', 'Dakopbouw', 'dakopbouw'),
    ('interieurontwerp', 'Interieurontwerp', 'interieur'),
    ('tekenaar', 'Tekenwerk uitbesteden', 'technisch'),
]:
    sources[slug] = {'label': label, 'kind': kind}
sources['rozengracht-interieur'] = {'label': 'Rozengracht – interieur, Amsterdam', 'kind': 'interieur'}
for slug in ['paltzerweg-64', 'koopvaardersplantsoen-87', 'rozengracht']:
    if slug in sources:
        sources['projecten/' + slug] = sources[slug]

schema = {'@context': 'https://schema.org', '@type': 'ContactPage',
          'name': 'Bespreek je project | Studio van Geene',
          'url': 'https://studiovangeene.nl/project-bespreken/', 'inLanguage': 'nl-NL',
          'about': {'@type': 'ProfessionalService', 'name': 'Studio van Geene',
                    'url': 'https://studiovangeene.nl/', 'email': 'michael@studiovangeene.nl'}}
page = '''<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bespreek je verbouwing, interieur of tekenwerk | Studio van Geene</title>
<meta name="description" content="Vertel Michael over je verbouwing, interieur of bouwkundig tekenwerk. Deel je locatie, wensen en planning en bespreek een passend voorstel voor jouw project.">
<link rel="canonical" href="https://studiovangeene.nl/project-bespreken/"><meta name="robots" content="index,follow">
<meta property="og:title" content="Bespreek je project | Studio van Geene"><meta property="og:description" content="Van verbouwplan tot technische uitwerking. Vertel kort wat je wilt laten maken."><meta property="og:type" content="website"><meta property="og:url" content="https://studiovangeene.nl/project-bespreken/"><meta property="og:image" content="https://studiovangeene.nl/images/paltzerweg-64-detail.webp">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/pages.css?v=20261030">
<script type="application/ld+json">SCHEMA_JSON</script></head><body>
<a class="skip" href="#inhoud">Naar inhoud</a>
<header class="site-header"><nav class="wrap" aria-label="Hoofdnavigatie"><a class="brand" href="/">STUDIO VAN GEENE</a><div><a href="/bouwkundig-tekenaar-utrecht/">Verbouwen</a><a href="/interieurontwerp/">Interieur</a><a href="/tekenaar/">Technisch tekenwerk</a></div></nav></header>
<main class="wrap inquiry" id="inhoud"><p class="eyebrow">Direct contact met Michael</p><h1>Vertel over je project.</h1><p class="intro">Een verbouwing, een interieur of extra tekenkracht? Met een paar gegevens kan ik gericht met je meedenken over de aanpak, planning en prijs.</p>
<div class="inquiry-grid"><form id="project-brief" class="brief-form">
<p id="entry-context" class="entry-context" hidden></p>
<label for="name">Naam / bedrijf<input id="name" name="name" autocomplete="name" required maxlength="120" placeholder="Hoe heet je?"></label>
<label for="service">Waar kan ik bij helpen?<select id="service" name="service"><option value="">Kies een onderwerp (optioneel)</option><option value="verbouwing">Verbouwing / nieuwe indeling</option><option value="vergunning">Vergunningtekeningen</option><option value="dakopbouw">Dakopbouw / dakkapel / uitbouw</option><option value="interieur">Interieur woning / horeca</option><option value="technisch">BIM / werktekeningen / details</option><option value="overleg">Ik wil eerst overleggen</option></select></label>
<label for="place">Waar ligt het project?<input id="place" name="place" required maxlength="160" autocomplete="address-level2" placeholder="Plaats of postcode"></label>
<label for="description">Wat wil je veranderen of laten uitwerken?<textarea id="description" name="description" required maxlength="1600" rows="5" placeholder="Vertel kort over je plan en welke tekeningen of foto's je al hebt."></textarea></label>
<label for="timing">Gewenste planning <span class="optional">(optioneel)</span><input id="timing" name="timing" maxlength="160" placeholder="Bijvoorbeeld: komend voorjaar, of nog aan het oriënteren"></label>
<label for="discovery">Hoe heb je de studio gevonden? <span class="optional">(optioneel)</span><select id="discovery" name="discovery"><option value="">Kies een bron</option><option>Google</option><option>Bing / DuckDuckGo</option><option>ChatGPT / andere AI-assistent</option><option>Instagram / LinkedIn</option><option>Via iemand anders</option><option>Werkspot</option><option>Anders</option></select></label>
<p class="brief-note">Je opent een concept in WhatsApp of je mailapp. Voeg daar eventueel foto's en tekeningen toe en verstuur het bericht zelf.</p>
<div class="actions"><button class="button" type="submit" name="channel" value="whatsapp">Open in WhatsApp ↗</button><button class="button button-secondary" type="submit" name="channel" value="email">Open in e-mail ↗</button></div><p id="brief-status" role="status" aria-live="polite"></p>
<noscript><p>Gebruik de directe contactlinks om je project te bespreken.</p></noscript></form>
<aside class="inquiry-aside"><p class="eyebrow">Van idee naar afspraken</p><h2>Een helder vertrekpunt.</h2><ol><li><strong>Deel je plan.</strong><br>Ook als je nog geen tekeningen hebt.</li><li><strong>We bespreken wat nodig is.</strong><br>Ontwerp, aanvraag of technische uitwerking.</li><li><strong>Een passend voorstel.</strong><br>Werkzaamheden, prijs en planning vooraf afgestemd.</li></ol><p>Vanuit Utrecht, voor projecten in Utrecht, Amsterdam en omgeving. Technisch tekenwerk voor aannemers en ontwerpbureaus kan ook op afstand.</p><p><a href="mailto:michael@studiovangeene.nl">michael@studiovangeene.nl</a><br><a href="tel:+31626130070">06 2613 0070</a><br><a href="https://wa.me/31626130070">Direct naar WhatsApp ↗</a></p><p class="brief-note">Dit formulier bewaart je ingevulde gegevens niet op de website.</p></aside></div>
</main><footer class="wrap"><nav aria-label="Meer over de studio"><a href="/">Bekijk het portfolio</a><a href="/vergunningtekeningen/">Vergunningtekeningen</a><a href="/interieurontwerp/">Interieurontwerp</a></nav></footer>
<script id="inquiry-sources" type="application/json">SOURCES_JSON</script><script defer src="/project-inquiry.js?v=20261030-1"></script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"53a09125f96e42c1adb8ea5bbb56404a"}'></script><script defer src="/site-analytics.js?v=20261030-1" data-endpoint="https://studiovangeene-events.studiovangeene.workers.dev/collect"></script>
</body></html>'''
page = page.replace('SCHEMA_JSON', json.dumps(schema, ensure_ascii=False).replace('</', '<\\/'))
page = page.replace('SOURCES_JSON', json.dumps(sources, ensure_ascii=False).replace('</', '<\\/'))
directory = ROOT / 'project-bespreken'
directory.mkdir(exist_ok=True)
(directory / 'index.html').write_text(page)
print('Built project enquiry page')
