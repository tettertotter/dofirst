# Pro PR Checklist (Gate to Merge)

- [ ] iOS, Android, and Web screenshots (or short recordings) of the feature
- [ ] CHANGELOG entry with timestamp and what changed
- [ ] Log lines show request IDs and key decisions (quota, schedule)
- [ ] No service role on clients; RLS verified for reads
- [ ] Rate limiting added/validated for new write endpoints
- [ ] Unit tests pass for parser/nagging/recurrence where touched
