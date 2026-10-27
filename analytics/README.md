# Portfolio interaction measurement

The portfolio sends anonymous interaction counts to `https://studiovangeene-events.studiovangeene.workers.dev/collect`. Existing Cloudflare Web Analytics remains separate and unchanged.

Events: `page_view` (one per page load), `project_view` (active card visible for 1.5 seconds, once per project per page load including carousel clones), `contact_click` (WhatsApp/email/phone link activation; not proof of a sent message), `segment_select` (project filter selection).

No cookies or visitor IDs. The client sends only the event name, public project slug, selected segment and contact channel. No full URLs, query parameters, referrers, destination addresses or message text are sent. The collector stores only aggregate totals per calendar day in Europe/Amsterdam in an EU-jurisdiction D1 database. It does not store individual events, IPs, user agents or request logs. Aggregate counts remain until deliberately removed; there is no automatic expiry.

Do Not Track and Global Privacy Control disable this extra measurement; `?analytics=off` disables it for the current page. Ad blockers may suppress requests. Browser requests must originate from either portfolio hostname. Non-browser clients can spoof origins, so counts are indicative. No read endpoint is publicly exposed; use the authenticated Cloudflare D1 API or dashboard.

Cloudflare account: `3d8cd66b8f8173ccfb6ab7dca994cfc7`; D1 database: `905320be-df99-43cc-b46c-e2db63db361b` (`studiovangeene-analytics`). These identifiers are not credentials. Worker configuration is in wrangler.jsonc; schema is in schema.sql. Worker invocation logging is disabled. The deployment uses no secrets. Keep the script tag in index.html before the closing body tag.

Example reporting query:

```sql
SELECT event, project, segment, channel, SUM(total) AS total
FROM daily_events
WHERE day >= date('now', '-28 days')
GROUP BY event, project, segment, channel
ORDER BY total DESC;
```

Run checks with `node --test analytics/analytics.test.mjs`. Deployment requires updating the module and D1 binding through the Cloudflare API (or Wrangler), publishing the source through the existing GitHub Pages workflow, and verifying live POST collection with an installation-test project. Remove only that test row after verification.
