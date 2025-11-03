# Competitive Analysis — Due (What to match, what to beat)

## What Due nails (must match)
- **Persistent nagging**: auto snooze repeats at set intervals (1/5/10/15/30/60m) until acted upon. (source: Due homepage, Mac help, URL scheme docs)
- **Fast capture**: natural date parsing; quick postpone via presets; simple, calm UI. (source: Natural Date Parsing docs, App Store listing)
- **Powerful recurring**: daily → yearly, and easy modification of only this occurrence vs pattern. (source: Recurrence docs)

## Where we win
- **Platforms**: Android + Web parity and sync; Due is Apple-only.
- **Collaboration**: “Today” proposals & quotas; Due is single-user.
- **Email ingestion**: create from email with inline parsing.

## Implications
- Treat **Web** as a first-class client (Push + service worker). 
- Implement **Android exact alarms** with a fallback strategy.
- Provide **identical snooze actions** on all platforms: Done / +10m / +1h / Tomorrow AM.
