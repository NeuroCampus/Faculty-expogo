import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAttendanceRecordsList, getAttendanceRecordDetails } from '@api/faculty';
import { useQuery } from '@tanstack/react-query';

export default function AttendanceRecordsScreen() {
  const { data, isLoading } = useQuery({ queryKey:['attendance-records'], queryFn: async () => { const r = await getAttendanceRecordsList(); if(!r.ok) throw new Error(r.error); return r.data?.data||[]; }});
  const [selected, setSelected] = useState<any|null>(null);
  const [detail, setDetail] = useState<{ present:any[]; absent:any[] }|null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  async function loadDetails(id:number) {
    setLoadingDetail(true); setDetail(null); setSelected(id);
    const r = await getAttendanceRecordDetails(id);
    if (r.ok && r.data?.success) setDetail(r.data.data); else setDetail({ present:[], absent:[] });
    setLoadingDetail(false);
  }
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Attendance Records</Text>
      {isLoading? <ActivityIndicator /> : <FlatList data={data} keyExtractor={r=>String(r.id)} renderItem={({ item }) => (
        <TouchableOpacity onPress={()=>loadDetails(item.id)} style={{ backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.date} • {item.subject}</Text>
          <Text style={{ color:'#555' }}>{item.section} • {item.branch}</Text>
        </TouchableOpacity>
      )} />}
      {selected && <View style={{ marginTop:12, backgroundColor:'#f1f5f9', padding:12, borderRadius:8 }}>
        <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:4 }}>Details</Text>
        {loadingDetail? <ActivityIndicator /> : detail && (
          <View style={{ flexDirection:'row' }}>
            <View style={{ flex:1, marginRight:12 }}>
              <Text style={{ fontFamily:'Inter-SemiBold' }}>Present</Text>
              {detail.present.map(p=> <Text key={p.usn}>{p.name} ({p.usn})</Text>)}
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:'Inter-SemiBold' }}>Absent</Text>
              {detail.absent.map(a=> <Text key={a.usn}>{a.name} ({a.usn})</Text>)}
            </View>
          </View>
        )}
      </View>}
    </View>
  );
}
