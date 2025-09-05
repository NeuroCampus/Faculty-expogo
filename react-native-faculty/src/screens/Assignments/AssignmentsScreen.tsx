import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { getAssignmentTasks, getAssignmentDetail, getAssignmentSubmissions, gradeAssignment, AssignmentTask, AssignmentSubmission } from '@api/faculty';

export default function AssignmentsScreen() {
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<AssignmentTask | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    const r = await getAssignmentTasks();
    if (r.success && r.data?.data) setTasks(r.data.data); else setTasks([]);
    setLoading(false);
  }
  useEffect(()=> { load(); }, []);

  async function openTask(t: AssignmentTask) {
    setActiveTask(t);
    const subs = await getAssignmentSubmissions(t.id);
    if (subs.success && subs.data?.data) setSubmissions(subs.data.data); else setSubmissions([]);
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      {!activeTask && (
        <>
          <Text style={{ fontSize:22, fontFamily:'System', marginBottom:12 }}>Assignments</Text>
          {loading && <ActivityIndicator />}
          <FlatList data={tasks} keyExtractor={i=> String(i.id)} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=> { setRefreshing(true); load().finally(()=> setRefreshing(false)); }} />} renderItem={({ item }) => (
            <TouchableOpacity onPress={()=> openTask(item)} style={{ padding:14, backgroundColor:'#f1f5f9', borderRadius:12, marginBottom:10 }}>
              <Text style={{ fontFamily:'System', fontSize:16 }}>{item.title}</Text>
              {item.due_date && <Text style={{ color:'#64748b', marginTop:4 }}>Due: {item.due_date}</Text>}
              <Text style={{ color:'#0f172a', marginTop:6, fontSize:12 }}>{item.total_submissions || 0} submissions</Text>
            </TouchableOpacity>
          )} />
        </>
      )}
      {activeTask && (
        <View style={{ flex:1 }}>
          <TouchableOpacity onPress={()=> { setActiveTask(null); setSubmissions(null); }} style={{ marginBottom:12 }}><Text style={{ color:'#2563eb' }}>◀ Back</Text></TouchableOpacity>
          <Text style={{ fontSize:20, fontFamily:'System' }}>{activeTask.title}</Text>
          <Text style={{ color:'#475569', marginTop:4 }}>{activeTask.description || 'No description.'}</Text>
          <Text style={{ color:'#64748b', marginTop:4, fontSize:12 }}>Due: {activeTask.due_date || '—'}</Text>
          <Text style={{ marginTop:16, fontFamily:'System' }}>Submissions</Text>
          {!submissions && <ActivityIndicator style={{ marginTop:12 }} />}
          {submissions && <FlatList data={submissions} keyExtractor={s=> String(s.id)} renderItem={({ item }) => (
            <View style={{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#e2e8f0' }}>
              <Text style={{ fontFamily:'System' }}>{item.student}</Text>
              <Text style={{ color:'#64748b', fontSize:12 }}>{item.submitted_at}</Text>
              <Text style={{ color:item.grade? '#0f766e':'#dc2626', marginTop:4 }}>Grade: {item.grade || 'Pending'}</Text>
            </View>
          )} />}
        </View>
      )}
    </View>
  );
}
