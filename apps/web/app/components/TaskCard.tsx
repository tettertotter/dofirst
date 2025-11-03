'use client';
import React from 'react';
import { Card, Badge, Button } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function TaskCard({ title, tags = [], onSnooze, onDone }:{ title:string; tags?:string[]; onSnooze?:()=>void; onDone?:()=>void }) {
  const taskId = React.useId();
  const titleId = `task-title-${taskId}`;

  return (
    <Card role="article" aria-labelledby={titleId}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <div>
          <h3 id={titleId} style={{ fontWeight: 600, margin: 0, fontSize: '1rem' }}>{title}</h3>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: spacing.xs, marginTop: spacing.xs }}>
              {tags.map(t => <Badge key={t}>{t}</Badge>)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing.xs }}>
          {onSnooze && (
            <Button
              variant="secondary"
              onClick={onSnooze}
              aria-label={`Snooze task: ${title}`}
            >
              +10m
            </Button>
          )}
          {onDone && (
            <Button
              onClick={onDone}
              aria-label={`Mark task as done: ${title}`}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
