'use client';
import React from 'react';
import { Card, Badge, Button } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function TaskCard({ title, tags = [], onSnooze, onDone }:{ title:string; tags?:string[]; onSnooze?:()=>void; onDone?:()=>void }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ display: 'flex', gap: spacing.xs, marginTop: spacing.xs }}>
            {tags.map(t => <Badge key={t}>{t}</Badge>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: spacing.xs }}>
          <Button variant="secondary" onClick={onSnooze}>+10m</Button>
          <Button onClick={onDone}>Done</Button>
        </div>
      </div>
    </Card>
  );
}
