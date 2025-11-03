import React from 'react';
import { View, ScrollView } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { TaskCard } from '../../components/TaskCard';

export default function PeopleScreen() {
  return (
    <View style={ flex: 1 }>
      <AppBar />
      <ScrollView contentContainerStyle={ padding: 16 }>
        <TaskCard title="People example task" />
      </ScrollView>
    </View>
  );
}
