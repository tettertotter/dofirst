# Acceptance Tests (Hands-on)

1) **Capture speed**
   - From app cold start, measure time to first keypress < 1.5 s.
   - Add “Take meds @today 9pm !1 #personal” → appears in Pool in < 300 ms.

2) **Nagging reliability**
   - Create reminder due in 1 min with default cadence.
   - Confirm notification at due; then every 10 min for first hour (as configured).

3) **Quick postpone**
   - Tap +10m → due shifts by 10 min; schedule updated immediately.
   - Long-press custom → Snooze Wheel opens; set 8:30 PM; confirm schedule.

4) **Recurrence**
   - Create daily at 7 AM; complete today; next instance appears tomorrow 7 AM.

5) **Today proposals**
   - Wife proposes 3 items; colleague proposes 2; third colleague proposal fails with quota message.
   - Owner accepts one, declines one, moves one to tomorrow.

6) **Email inbound**
   - Send email “Pick up dry cleaning #personal @today 6pm !3” to inbound address.
   - Task created within seconds with parsed tags/priority/date.

7) **Quiet hours**
   - Set quiet hours 22:00–07:00; create due at 22:15 → no audible ping; badge increments; catch-up at 07:00.
