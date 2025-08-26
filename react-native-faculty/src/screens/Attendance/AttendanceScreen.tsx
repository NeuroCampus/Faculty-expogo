import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert, Switch } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAssignments, getStudentsForClass, takeAttendance } from '../../api/faculty';
// CameraView may be undefined on some SDK versions; guard its usage
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function AttendanceScreen() {
  const { data, isLoading } = useQuery({ queryKey:['assignments'], queryFn: async () => { const r = await getAssignments(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const assignments = data?.data || [];
  const [selected, setSelected] = useState<any | null>(null);
  const [students, setStudents] = useState<{ id: number; name: string; usn: string; present: boolean }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [mode, setMode] = useState<'manual' | 'camera'>('manual');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoadingStudents(true);
      const r = await getStudentsForClass({ branch_id: selected.branch_id, semester_id: selected.semester_id, section_id: selected.section_id, subject_id: selected.subject_id });
      if (r.ok && r.data?.data) {
        setStudents(r.data.data.map((s:any) => ({ ...s, present: true })));
      }
      setLoadingStudents(false);
    })();
  }, [selected]);

  const submit = async () => {
    if (!selected) return;
    const payload = {
      branch_id: String(selected.branch_id),
      semester_id: String(selected.semester_id),
      section_id: String(selected.section_id),
      subject_id: String(selected.subject_id),
      attendance: students.map(s => ({ student_id: String(s.id), status: s.present }))
    };
    Alert.alert('Confirm', 'Submit attendance?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'destructive', onPress: async () => {
        const res = await takeAttendance(payload);
        if (!res.ok) Alert.alert('Error', res.error || 'Failed'); else Alert.alert('Saved', 'Attendance submitted');
      }}
    ]);
  };

  if (!selected) {
    return (
      <View style={{ flex:1, padding:16 }}>
        <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Take Attendance</Text>
        {isLoading && <ActivityIndicator />}
        <FlatList data={assignments} keyExtractor={(i)=>String(i.subject_id)+i.section_id} renderItem={({ item }) => (
          <TouchableOpacity onPress={()=> setSelected(item)} style={{ padding:14, backgroundColor:'#fff', borderRadius:10, marginBottom:10, borderWidth:1, borderColor:'#e5e7eb' }}>
            <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.subject_name}</Text>
            <Text style={{ color:'#555' }}>{item.branch} • Sem {item.semester} • {item.section}</Text>
          </TouchableOpacity>
        )} />
        {!isLoading && !assignments.length && <Text>No assignments found.</Text>}
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontFamily:'Inter-SemiBold', marginBottom:8 }}>{selected.subject_name} • {selected.branch} • Sem {selected.semester} • {selected.section}</Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <TouchableOpacity onPress={()=> setMode('manual')} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor: mode==='manual'?'#2563eb':'#e5e7eb' }}>
          <Text style={{ color: mode==='manual'?'#fff':'#111827' }}>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async()=> { if (!permission?.granted) await requestPermission(); setMode('camera'); }} style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor: mode==='camera'?'#2563eb':'#e5e7eb' }}>
          <Text style={{ color: mode==='camera'?'#fff':'#111827' }}>AI Camera</Text>
        </TouchableOpacity>
      </View>

  {mode === 'manual' ? (
        <View style={{ flex:1 }}>
          {loadingStudents ? <ActivityIndicator /> : (
            <FlatList
              data={students}
              keyExtractor={(s)=>String(s.id)}
              renderItem={({ item, index }) => (
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderColor:'#f1f5f9' }}>
                  <View>
                    <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.name}</Text>
                    <Text style={{ color:'#64748b' }}>{item.usn}</Text>
                  </View>
                  <Switch value={item.present} onValueChange={(v)=> setStudents(prev => prev.map((s,i)=> i===index? { ...s, present: v }: s))} />
                </View>
              )}
            />
          )}
          <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
            <TouchableOpacity onPress={()=> setStudents(prev => prev.map(s=> ({ ...s, present:true })))} style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:8 }}>
              <Text>Mark All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> setStudents(prev => prev.map(s=> ({ ...s, present:false })))} style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:8 }}>
              <Text>Mark All Absent</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={submit} style={{ backgroundColor:'#16a34a', padding:14, borderRadius:10, alignItems:'center', marginTop:12 }}>
            <Text style={{ color:'#fff', fontFamily:'Inter-SemiBold' }}>Submit Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setSelected(null)} style={{ padding:12, alignItems:'center', marginTop:4 }}>
            <Text style={{ color:'#2563eb' }}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex:1 }}>
          {CameraView ? (
            <View style={{ height:320, overflow:'hidden', borderRadius:12, marginBottom:12, borderWidth:1, borderColor:'#e5e7eb' }}>
              <CameraView style={{ flex:1 }} facing="front" />
            </View>
          ) : (
            <View style={{ height:120, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, marginBottom:12 }}>
              <Text style={{ color:'#64748b' }}>Camera module unavailable (fallback)</Text>
            </View>
          )}
          <Text style={{ color:'#64748b', marginBottom:12 }}>Recognition stub: mark randomly selected students present.</Text>
          <TouchableOpacity onPress={()=> {
            setStudents(prev => prev.map((s, i) => ({ ...s, present: i % 2 === 0 })));
            Alert.alert('AI Attendance', 'Recognized faces and updated presence (stub).');
          }} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:10, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontFamily:'Inter-SemiBold' }}>Run Recognition</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
