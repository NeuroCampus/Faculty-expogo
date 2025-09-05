import React, { useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecordsList, getAttendanceRecordDetails } from '../../api/faculty';

export default function AttendanceRecordsScreen() {
  const { data, isLoading } = useQuery({ queryKey:['attendance-records'], queryFn: async () => { const r = await getAttendanceRecordsList(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const records = data?.data || [];
  const [selected, setSelected] = useState<any | null>(null);
  const [details, setDetails] = useState<{present:any[]; absent:any[]}|null>(null);
  const [loadingDetails,setLoadingDetails] = useState(false);
  const open = async (rec:any) => {
    setSelected(rec); setDetails(null); setLoadingDetails(true);
    const r = await getAttendanceRecordDetails(rec.id);
    setLoadingDetails(false);
    if(r.ok) setDetails(r.data?.data || null);
  };
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'System', marginBottom:12 }}>Attendance Records</Text>
      {isLoading ? <ActivityIndicator /> : selected ? (
        <ScrollView style={{ flex:1 }}>
          <TouchableOpacity onPress={()=> { setSelected(null); setDetails(null);} }><Text style={{ color:'#2563eb', marginBottom:8 }}>← Back</Text></TouchableOpacity>
          <Text style={{ fontFamily:'System', marginBottom:8 }}>{selected.date} • {selected.subject} • {selected.section}</Text>
          {loadingDetails && <ActivityIndicator />}
          {details && (
            <View style={{ flexDirection:'row', gap:20 }}>
              <View style={{ flex:1 }}>
                <Text style={{ fontFamily:'System' }}>Present</Text>
                {details.present.map((p:any,i:number)=>(<Text key={i}>{p.name} ({p.usn})</Text>))}
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontFamily:'System' }}>Absent</Text>
                {details.absent.map((a:any,i:number)=>(<Text key={i}>{a.name} ({a.usn})</Text>))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList data={records} keyExtractor={(r:any)=>String(r.id)} renderItem={({ item }) => (
          <TouchableOpacity onPress={()=>open(item)} style={{ backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8, borderWidth:1, borderColor:'#e5e7eb' }}>
            <Text style={{ fontFamily:'System' }}>{item.date} • {item.subject}</Text>
            <Text style={{ color:'#555' }}>{item.section} • {item.branch}</Text>
          </TouchableOpacity>
        )} />
      )}
    </View>
  );
}
