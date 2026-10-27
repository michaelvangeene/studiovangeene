CREATE TABLE IF NOT EXISTS daily_events (
 day TEXT NOT NULL, event TEXT NOT NULL, project TEXT NOT NULL DEFAULT '',
 segment TEXT NOT NULL, channel TEXT NOT NULL DEFAULT '', total INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY (day, event, project, segment, channel)
) WITHOUT ROWID;
