# Bing / DuckDuckGo review — 27 oktober 2026

## Bevindingen en wijzigingen

| Bevinding in de broncode | Uitgevoerde verbetering |
| --- | --- |
| Homepage had alleen de titel “Studio van Geene” en een merknaam als H1. | Beschrijvende titel, consistente deeltekst en een zichtbare introductie over ontwerp en tekenwerk vanuit Utrecht. |
| De bestaande /tekenaar/-pagina richtte zich al op aannemers en ontwerpbureaus. | Die positionering behouden en gekoppeld aan de nieuwe diensten- en projectpagina's. |
| Geen robots.txt of XML-sitemap aanwezig. | robots.txt met sitemapverwijzing; sitemap met acht canonieke marketing-URL's. |
| Het portfolio had wel beschrijvingen en alt-teksten, maar projecten stonden alleen als kaarten op de homepage. | Drie eigen, statische projectpagina's voor Paltzerweg 64, Koopvaardersplantsoen 87 en Rozengracht. Links vanuit de betreffende kaarten en dienstenpagina's. |
| Geen afzonderlijke inhoud per dienst voor particulieren. | Drie gerichte pagina's: bouwkundig tekenaar Utrecht, vergunningtekeningen en dakopbouw. Geen reeks vrijwel identieke plaatsnaam-pagina's. |
| OG-image verwees tweemaal naar een ontbrekend og-image.jpg. | Eén verwijzing naar een bestaand projectbeeld; unieke deelgegevens op nieuwe pagina's. |
| Dakopbouwbeeld werd als een grote externe PNG gebruikt. | Lokale WebP op maximaal 1600 pixels breed voor de homepage en nieuwe pagina's. |
| Prototypepagina's /beta/ en /beta2/ hadden al noindex,nofollow. | Behouden; niet in de sitemap opgenomen. De afzonderlijke HDZ- en mandalatools zijn ongemoeid gelaten. |
| Geen IndexNow-inrichting aanwezig. | Verificatiebestand en indieningsbestand in scripts/indexnow.json. Eenmalig indienen na succesvolle publicatie en verificatie van het live bestand. |

Elke nieuwe pagina heeft zichtbare inhoud in de HTML, een eigen titel en beschrijving, een zelfverwijzende canonical, één H1, beschrijvende beeldtekst en passende JSON-LD. Samenwerkingen en projectfase zijn benoemd. Er worden geen registratie als architect, vergunningverlening, uitvoeringsresultaten, prijzen of certificeringen geclaimd die niet in de bestaande projectinformatie staan.

## Validatie

- `python scripts/build-search-pages.py` bouwt de zes pagina's opnieuw op uit de handmatig geschreven inhoud.
- `python scripts/check-search-pages.py` controleert metadata, JSON-LD, lokale links en beelden, sitemap, onderlinge bereikbaarheid en het IndexNow-verificatiebestand.
- `node --test analytics/analytics.test.mjs` controleert dat de bestaande anonieme interactiemeting intact blijft.
- Browsercontrole van homepage en dienstenpagina: inhoud, navigatie en vormgeving. De extra dagtellingen blijven anoniem. Cloudflare Web Analytics kan de nieuwe URL's afzonderlijk meten.

## Meetgrenzen en vervolgstappen

Dit is een inhoudelijke en technische audit van de website, geen geauthenticeerde Bing-rangschikkingsrapportage. De aangesloten GSC Wizard-koppeling is geblokkeerd door een verlopen proefperiode; Bing Webmaster Tools-verificatie en zoekwoordposities zijn daarom niet vastgesteld. Een openbare site:-zoekopdracht vormt op zichzelf geen bewijs dat een pagina wel of niet in Bing staat.

IndexNow bevestigt alleen ontvangst (200) of ontvangst met nog lopende sleutelverificatie (202); dit is geen bewijs van indexering of een hogere positie. Dien een gewijzigde URL pas in nadat de nieuwe inhoud live staat. Dien de URL's uit scripts/indexnow.json niet periodiek ongewijzigd opnieuw in.

Openstaande verbeteringen buiten de broncode: verifieer de website in Bing Webmaster Tools, bekijk de URL-inspectie en koppel de sitemap. Verzamel relevante verwijzingen van samenwerkingspartners bij echte gezamenlijke projecten. Controleer na het opnieuw crawlen welke zoekvragen en pagina's vertoningen en aanvragen opleveren; gebruik die gegevens om inhoud gericht uit te breiden.

## Officiële bronnen

- https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a
- https://duckduckgo.com/duckduckgo-help-pages/results/sources
- https://www.indexnow.org/documentation
- https://www.indexnow.org/faq
