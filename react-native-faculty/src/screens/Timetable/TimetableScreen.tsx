import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getTimetable } from '@api/faculty';
import { useQuery } from '@tanstack/react-query';

export default function TimetableScreen() {
  const { data, isLoading } = useQuery({ queryKey:['timetable'], queryFn: async () => { const r = await getTimetable(); if(!r.ok) throw new Error(r.error); return r.data?.data||[]; }});
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Timetable</Text>
      {isLoading? <ActivityIndicator /> : <FlatList data={data} keyExtractor={(i,idx)=>String(idx)} renderItem={({ item }) => (
        <View style={{ backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.day} {item.start_time}-{item.end_time}</Text>
          <Text>{item.subject} • {item.section} • {item.room}</Text>
        </View>
      )} />}
    </View>
  );
}
