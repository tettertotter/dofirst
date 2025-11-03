# Security Model

- Row Level Security enabled for every user table.
- Membership defines read access. Visibility gates task reads.
- Only owners can change memberships, tag sets, limits, and aliases.
- Submissions allow members to add tasks quickly without leaking data.
- Proposals visible to owner, proposer, and colleagues for work tasks only.
- Service role keys used only in server contexts (edge function, seeds).
