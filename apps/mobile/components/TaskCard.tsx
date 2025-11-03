import React from 'react';
import { View, Text } from 'react-native';
import { Card, Button, Badge } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function TaskCard({ title, tags = []}:{ title:string; tags?:string[] }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        <View>
          <Text style={{ fontWeight: '600' }}>{title}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
            {tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Button variant="secondary">+10m</Button>
          <Button>Done</Button>
        </View>
      </View>
    </Card>
  );
}
