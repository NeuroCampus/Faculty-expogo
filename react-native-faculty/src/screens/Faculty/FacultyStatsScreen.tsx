import React from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../api/faculty';

export default function FacultyStatsScreen() {
  const { data } = useQuery({ queryKey:['faculty-stats'], queryFn: async ()=> {
    const r = await getDashboard();
    if (!r.ok) throw new Error(r.error);
    return r.data;
  }});
  const stats = data?.data || {};
  const attendancePct = Number(stats.attendance_snapshot ?? 0);
  const leavesPending = Number(stats.leaves_pending ?? 0);
  const classesToday = stats.today_classes?.length ?? 0;

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:12 }}>Faculty Stats</Text>
      <View style={{ flexDirection:'row', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <View style={{ padding:14, borderWidth:1, borderColor:'#eee', borderRadius:10, width:'48%' }}>
          <Text style={{ color:'#666' }}>Classes Today</Text>
          <Text style={{ fontSize:22, fontWeight:'700' }}>{classesToday}</Text>
        </View>
        <View style={{ padding:14, borderWidth:1, borderColor:'#eee', borderRadius:10, width:'48%' }}>
          <Text style={{ color:'#666' }}>Pending Leaves</Text>
          <Text style={{ fontSize:22, fontWeight:'700' }}>{leavesPending}</Text>
        </View>
      </View>
      <View style={{ padding:16, borderWidth:1, borderColor:'#eee', borderRadius:12 }}>
        <Text style={{ fontWeight:'700', marginBottom:8 }}>Attendance Snapshot</Text>
        <View style={{ height:16, backgroundColor:'#e5e7eb', borderRadius:999, overflow:'hidden' }}>
          <View style={{ width: `${Math.max(0, Math.min(100, attendancePct))}%`, backgroundColor:'#16a34a', flex:1 }} />
        </View>
        <Text style={{ marginTop:6, color:'#444' }}>{attendancePct}%</Text>
      </View>
    </View>
  );
}


