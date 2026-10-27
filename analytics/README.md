# Portfolio interaction measurement

Prepared for activation on studiovangeene.nl. No changes are live until the collector is deployed and the script tag below is added to index.html, before </body>.

```html
<script src="/site-analytics.js?v=1" data-endpoint="https://studiovangeene-events.studiovangeene.workers.dev/collect" defer></script>
```

The endpoint above is the planned address, not an existing deployment. Creating the account's workers.dev subdomain requires user approval following automatic review rejection on 2026-10-27. Do not enable the browser script before the endpoint has been verified.

Deploy worker.mjs as the module for `studiovangeene-events`, compatibility date 2026-10-27, binding `{ "type": "analytics_engine", "name": "EVENTS", "dataset": "studiovangeene_interactions" }`. Disable invocation logs to avoid storing request metadata. Enable the script's workers.dev endpoint only after the account subdomain is approved.

Events: page_view (one per page load), project_view (active card visible for 1.5 seconds, once per project per page load including carousel clones), contact_click (WhatsApp/email/phone link activation; not proof of a sent message), segment_select (project filter selection).

No cookies or visitor IDs. Only event name, public project slug, selected segment, contact channel and schema version are stored, with the platform timestamp. The client sends no full URL, query parameters, referrer, destination addresses or message text. The server does not write IP or user agent to the dataset. Do Not Track and Global Privacy Control disable this extra measurement; `?analytics=off` disables it for the current page. Cloudflare Web Analytics remains separate and unchanged. Ad blockers may suppress requests. The public collector accepts only the two portfolio origins, but non-browser clients can spoof origins; counts are indicative.

Analytics Engine retains events for three months. SQL reads use the authenticated Cloudflare account API, not a public dashboard. Example, with sample weighting:

```sql
SELECT blob1 AS event, blob2 AS project, blob3 AS segment, blob4 AS channel,
       SUM(_sample_interval * double1) AS total
FROM studiovangeene_interactions
WHERE timestamp >= NOW() - INTERVAL '28' DAY
GROUP BY event, project, segment, channel
ORDER BY total DESC
FORMAT JSON
```

Run checks with `node --test analytics/analytics.test.mjs`. After approval, deploy the collector, verify POST acceptance and private SQL storage using a marked test project, enable the script, publish through the existing GitHub Pages workflow and verify collection from the live site. Exclude the marked test project from reports.
