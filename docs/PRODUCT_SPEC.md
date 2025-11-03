# Product Spec

## Goal
Help a busy owner decide what to do today by centralizing tasks and allowing trusted people to propose up to N items for today. Make capture effortless and review calm.

## Users and roles
- Owner: the person whose pool it is.
- Spouse: sees everything.
- Colleague: sees work-visibility tasks and can see other colleagues' contributions.
- Guest: can add tasks but sees only their own contributions unless shared.

## Core objects
- Task: title, description, priority 1..5, tags, status, visibility, optional due date.
- Tag: 'personal' and 'work' are core. Others optional.
- Proposal: proposed_by suggests a task for a specific date for the owner to accept, decline, or move.
- Today limits: per proposer daily cap.

## Capture
- Quick Add: Big microphone, one field, partial allowed.
- Email-to-task: Send to alias to create tasks. Subject becomes title, body becomes description.
- Mobile dictation uses OS features.

## Today flow
- Pending proposals grouped by proposer with remaining slots badges.
- One-tap Accept, Decline, or Move (date picker).
- Accepted tasks form the Today list.

## Visibility
- owner_only, household, work, public (future).
- Spouse sees everything. Colleagues only see work and can see each other.

## Notifications
- Daily email summary at a fixed time.
- Optional push notifications later.
