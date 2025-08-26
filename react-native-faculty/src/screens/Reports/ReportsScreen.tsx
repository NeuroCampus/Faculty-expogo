import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAttendanceReport, getMarksReport } from '@api/faculty';

export default function ReportsScreen() {
  const [loadingA, setLoadingA] = useState(false);
  const [loadingM, setLoadingM] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [marksSummary, setMarksSummary] = useState<any>(null);

  async function loadAttendance() {
    setLoadingA(true);
    const r = await getAttendanceReport({});
    if (r.ok && r.data?.data) setAttendanceSummary(r.data.data); else setAttendanceSummary({ error: r.error || 'Failed' });
    setLoadingA(false);
  }
  async function loadMarks() {
    setLoadingM(true);
    const r = await getMarksReport({});
    if (r.ok && r.data?.data) setMarksSummary(r.data.data); else setMarksSummary({ error: r.error || 'Failed' });
    setLoadingM(false);
  }
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:16 }}>Reports</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:12 }}>
        <TouchableOpacity onPress={loadAttendance} style={{ backgroundColor:'#1d4ed8', padding:12, borderRadius:10, marginRight:12, marginBottom:12 }}>
          <Text style={{ color:'#fff' }}>{loadingA? 'Loading...':'Attendance Report'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={loadMarks} style={{ backgroundColor:'#0f766e', padding:12, borderRadius:10, marginBottom:12 }}>
          <Text style={{ color:'#fff' }}>{loadingM? 'Loading...':'Marks Report'}</Text>
        </TouchableOpacity>
      </View>
      {loadingA && <ActivityIndicator style={{ marginTop:12 }} />}
      {attendanceSummary && !loadingA && (
        <View style={{ backgroundColor:'#f1f5f9', padding:12, borderRadius:10, marginTop:12 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>Attendance Summary</Text>
          <Text style={{ fontSize:12, color:'#475569' }}>{JSON.stringify(attendanceSummary).slice(0,240)}</Text>
        </View>
      )}
      {loadingM && <ActivityIndicator style={{ marginTop:12 }} />}
      {marksSummary && !loadingM && (
        <View style={{ backgroundColor:'#f1f5f9', padding:12, borderRadius:10, marginTop:12 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>Marks Summary</Text>
          <Text style={{ fontSize:12, color:'#475569' }}>{JSON.stringify(marksSummary).slice(0,240)}</Text>
        </View>
      )}
    </View>
  );
}
