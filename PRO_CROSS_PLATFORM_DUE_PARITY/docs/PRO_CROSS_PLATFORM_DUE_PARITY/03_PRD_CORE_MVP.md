# PRD — Core MVP

## Users
- Owner: controls Today and accepts proposals.
- Partner: sees all, can propose up to N/day (default 3).
- Colleague: sees only work-contributor items, can propose up to 2/day.

## Jobs to be done
- Capture in < 2s; defer in 1 tap; never forget; decide Today with trusted input.

## Functional requirements
1) Quick Add (launch-first) with dictation; partial submission allowed.
2) Natural date parsing: “today 5pm”, “in 10m/2h/3d”, weekdays (“fri 9a”).
3) Auto-snooze: persistent until acted; cadence defaults and per-task override.
4) Quick postpone chips: +10m / +1h / Tonight / Tomorrow AM + custom “Snooze Wheel”.
5) Core recurrence: daily, weekdays, weekly, monthly(date), yearly.
6) Today proposals & quotas; accept/decline/move.
7) Email-to-task; inline parsing for #tags, !priority, @date.
8) Cross-platform notifications: iOS, Android, Web Push all wired.
9) Quiet hours and catch-up alert.
10) Accessibility: dynamic type, VoiceOver/TalkBack.

## Non-functional
- Cold start ≤ 1.5s; interaction latency < 100ms; sync within seconds.
- Offline capture with reconciliation.
