import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { spacing } from '@todaypool/design-system';
import { QuickAddSheet } from './QuickAddSheet';

export function AppBar() {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '700' }}>TodayPool</Text>
        <Pressable accessibilityRole="button" onPress={() => setOpen(true)}>
          <Text>+ Add</Text>
        </Pressable>
      </View>
      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </View>
  );
}
