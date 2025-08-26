import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { applyLeave, getLeaveRequests } from '@api/faculty';

export default function LeaveScreen() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const load = async () => {
    setLoading(true);
    const r = await getLeaveRequests();
    if (r.ok) setList(r.data?.data||[]); else Alert.alert('Error', r.error||'Failed');
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  async function submit() {
    if (!start||!end||!reason) return;
    const r = await applyLeave({ branch_ids:[], start_date:start, end_date:end, reason });
    if (r.ok && r.data?.success) { Alert.alert('Submitted','Leave request'); setStart(''); setEnd(''); setReason(''); load(); } else Alert.alert('Error', r.error||r.data?.message||'Failed');
  }
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Leave Requests</Text>
      <View style={{ backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:16 }}>
        <TextInput placeholder='Start Date (YYYY-MM-DD)' value={start} onChangeText={setStart} style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
        <TextInput placeholder='End Date (YYYY-MM-DD)' value={end} onChangeText={setEnd} style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
        <TextInput placeholder='Reason' value={reason} onChangeText={setReason} multiline style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, minHeight:70, marginBottom:8 }} />
        <TouchableOpacity onPress={submit} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8 }}><Text style={{ color:'#fff', textAlign:'center' }}>Apply</Text></TouchableOpacity>
      </View>
      {loading? <ActivityIndicator /> : <FlatList data={list} keyExtractor={i=>i.id} renderItem={({ item }) => (
        <View style={{ backgroundColor:'#f1f5f9', padding:12, borderRadius:8, marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.start_date} → {item.end_date}</Text>
          <Text>{item.reason}</Text>
          <Text style={{ color:item.status==='APPROVED'?'green': item.status==='REJECTED'?'red':'#d97706' }}>{item.status}</Text>
        </View>
      )} />}
    </View>
  );
}
