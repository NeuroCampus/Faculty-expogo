import React from 'react';
import { View, Text, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useQueries } from '@tanstack/react-query';
import { getDashboard, getAssignments, getProctorStudents } from '../../api/faculty';
import { usePushRegistration } from '../../services/notifications/usePushRegistration';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

// Simple colored bar for performance metrics
function MetricBar({ value, color }: { value: number; color: string }) {
  const pct = isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <View style={{ height:8, backgroundColor:'#e2e8f0', borderRadius:4, overflow:'hidden', marginTop:4 }}>
      <View style={{ width:`${pct}%`, backgroundColor:color, flex:1 }} />
    </View>
  );
}

export default function DashboardScreen() {
  usePushRegistration();
  const navigation: any = useNavigation();
  React.useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate('Notification Center');
    });
    return () => sub.remove();
  }, [navigation]);

  const dashboardQ = useQuery({ queryKey:['dashboard'], queryFn: async () => { const r = await getDashboard(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const assignmentsQ = useQuery({ queryKey:['assignments'], queryFn: async () => { const r = await getAssignments(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const proctorQ = useQuery({ queryKey:['proctor-students'], queryFn: async () => { const r = await getProctorStudents(); if(!r.ok) throw new Error(r.error); return r.data; } });

  const refreshing = dashboardQ.isFetching || assignmentsQ.isFetching || proctorQ.isFetching;
  const overview = dashboardQ.data?.data;
  const subjects = assignmentsQ.data?.data || [];
  const proctorStudents = proctorQ.data?.data || [];

  // Prepare stats similar to web version
  const topStats = [
    { label:'Assigned Subjects', value: subjects.length, bg:'#eff6ff', accent:'#2563eb' },
    { label:'Proctor Students', value: proctorStudents.length, bg:'#f0fdf4', accent:'#059669' },
    { label:'Today Classes', value: overview?.today_classes?.length || 0, bg:'#fefce8', accent:'#ca8a04' },
    { label:'Attendance %', value: overview?.attendance_snapshot ?? '--', bg:'#f1f5f9', accent:'#475569' }
  ];

  // Performance data (attendance & marks if available)
  const attendanceData = proctorStudents.map((s:any) => ({ name:s.name, attendance: s.attendance ?? 0 }));
  const marksData = proctorStudents.map((s:any) => {
    if (Array.isArray(s.marks) && s.marks.length) {
      const avg = s.marks.reduce((sum:number,m:any)=> sum + (m.mark||0),0)/s.marks.length;
      return { name:s.name, avg: Number(avg.toFixed(1)) };
    }
    return { name:s.name, avg:0 };
  });

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, paddingBottom:32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=> { dashboardQ.refetch(); assignmentsQ.refetch(); proctorQ.refetch(); }} />}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Dashboard Overview</Text>

      {/* Top Stats */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:12 }}>
        {topStats.map((s,i)=>(
          <View key={i} style={{ width:'48%', marginRight: i%2===0? '4%':0, marginBottom:12, backgroundColor:s.bg, padding:12, borderRadius:12 }}>
            <Text style={{ fontSize:12, color:'#475569' }}>{s.label}</Text>
            <Text style={{ fontFamily:'Inter-SemiBold', fontSize:20, color:s.accent, marginTop:4 }}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Today Classes & Attendance Snapshot */}
      <View style={{ gap:12, marginBottom:20 }}>
        <View style={{ backgroundColor:'#eef2ff', padding:14, borderRadius:14 }}>
          <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:6 }}>Today Classes</Text>
          {overview?.today_classes?.length ? overview.today_classes.map((c:any,i:number)=> (
            <Text key={i} style={{ fontSize:12, marginTop:4 }}>{c.subject} • {c.section} • {c.start_time}-{c.end_time}</Text>
          )): <Text style={{ fontSize:12 }}>No classes.</Text>}
        </View>
        <View style={{ backgroundColor:'#f0fdf4', padding:14, borderRadius:14 }}>
          <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:6 }}>Attendance Snapshot</Text>
          <Text style={{ fontSize:32, fontFamily:'Inter-SemiBold', color:'#065f46' }}>{overview?.attendance_snapshot ?? '--'}%</Text>
        </View>
      </View>

      {/* Assigned Subjects */}
      <View style={{ backgroundColor:'#fff', padding:14, borderRadius:16, marginBottom:20, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold', fontSize:16 }}>Assigned Subjects</Text>
          <TouchableOpacity onPress={()=> navigation.navigate('Timetable')}><Text style={{ color:'#2563eb', fontSize:12 }}>View All</Text></TouchableOpacity>
        </View>
        {subjects.length ? subjects.slice(0,6).map((s:any,i:number)=>(
          <View key={i} style={{ paddingVertical:8, borderBottomWidth: i===subjects.slice(0,6).length-1?0:1, borderBottomColor:'#e2e8f0' }}>
            <Text style={{ fontFamily:'Inter-SemiBold', fontSize:14 }}>{s.subject_name} <Text style={{ color:'#64748b' }}>({s.subject_code})</Text></Text>
            <Text style={{ fontSize:11, color:'#475569', marginTop:2 }}>{s.branch} • Sem {s.semester} • Sec {s.section}</Text>
          </View>
        )): <Text style={{ fontSize:12, color:'#64748b' }}>No subjects assigned.</Text>}
      </View>

      {/* Quick Actions */}
      <View style={{ backgroundColor:'#fff', padding:14, borderRadius:16, marginBottom:20, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 }}>
        <Text style={{ fontFamily:'Inter-SemiBold', fontSize:16, marginBottom:12 }}>Quick Actions</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          {[
            { label:'Take Attendance', to:'Attendance', color:'#2563eb' },
            { label:'Upload Marks', to:'Upload Marks', color:'#0f766e' },
            { label:'Mentoring', to:'Proctor', color:'#7c3aed' },
            { label:'Reports', to:'Reports', color:'#d97706' },
            { label:'Leaves', to:'Manage Student Leave', color:'#db2777' },
            { label:'Statistics', to:'Generate Statistics', color:'#0d9488' },
            { label:'Notifications', to:'Notification Center', color:'#1d4ed8' },
            { label:'Announcements', to:'Announcements', color:'#f59e0b' },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={()=> navigation.navigate(a.to)} style={{ width:'48%', marginRight: a.label.endsWith('e')? '4%': (Math.random()<0?'4%':0), marginBottom:12, backgroundColor:'#f1f5f9', padding:12, borderRadius:12 }}>
              <Text style={{ fontSize:12, color:'#475569' }}>{a.label}</Text>
              <View style={{ height:4, backgroundColor:a.color, marginTop:8, borderRadius:2 }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Performance Trends */}
      <View style={{ backgroundColor:'#fff', padding:14, borderRadius:16, marginBottom:28, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 }}>
        <Text style={{ fontFamily:'Inter-SemiBold', fontSize:16, marginBottom:12 }}>Performance Trends</Text>
        <Text style={{ fontFamily:'Inter-SemiBold', fontSize:13, marginBottom:6 }}>Attendance (%)</Text>
        {attendanceData.length ? attendanceData.slice(0,8).map((d,i)=>(
          <View key={i} style={{ marginBottom:8 }}>
            <Text numberOfLines={1} style={{ fontSize:11, color:'#475569' }}>{d.name}</Text>
            <MetricBar value={d.attendance} color='#2563eb' />
          </View>
        )): <Text style={{ fontSize:12, color:'#64748b' }}>No attendance data.</Text>}
        <Text style={{ fontFamily:'Inter-SemiBold', fontSize:13, marginVertical:6 }}>Average Marks</Text>
        {marksData.length ? marksData.slice(0,8).map((d,i)=>(
          <View key={i} style={{ marginBottom:8 }}>
            <Text numberOfLines={1} style={{ fontSize:11, color:'#475569' }}>{d.name}</Text>
            <MetricBar value={d.avg} color='#7c3aed' />
          </View>
        )): <Text style={{ fontSize:12, color:'#64748b' }}>No marks data.</Text>}
      </View>

      {(dashboardQ.isLoading || assignmentsQ.isLoading || proctorQ.isLoading) && (
        <ActivityIndicator />
      )}
    </ScrollView>
  );
}
