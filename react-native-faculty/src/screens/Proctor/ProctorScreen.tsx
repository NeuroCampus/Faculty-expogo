import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getProctorStudents } from '../../api/faculty';

export default function ProctorScreen() {
  const { data, isLoading } = useQuery({ queryKey:['proctor-students'], queryFn: async () => { const r = await getProctorStudents(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const students = data?.data || [];
  const navigation: any = useNavigation();
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Proctor Students</Text>
      {isLoading ? <ActivityIndicator /> : <FlatList data={students} keyExtractor={(s:any)=>s.usn} renderItem={({ item }) => (
        <TouchableOpacity onPress={()=> navigation.navigate('Proctor Student Detail', { student: item })} style={{ backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.name}</Text>
          <Text style={{ color:'#555' }}>{item.usn}</Text>
          <Text style={{ color:'#2563eb' }}>Attendance: {item.attendance ?? '--'}%</Text>
        </TouchableOpacity>
      )} />}
    </View>
  );
}
