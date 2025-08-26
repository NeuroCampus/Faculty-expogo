import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getProctorStudents, getSentNotifications, createTargetedAnnouncement } from '../../api/faculty';

export default function AnnouncementsScreen() {
  const qc = useQueryClient();
  const { data: receivedData, isLoading: loadingReceived } = useQuery({ queryKey:['notifications'], queryFn: async () => { const r = await getNotifications(); if(!r.ok) throw new Error(r.error); return r.data?.data||[]; } });
  const { data: sentData, isLoading: loadingSent } = useQuery({ queryKey:['sent-notifications'], queryFn: async () => { const r = await getSentNotifications(); if(!r.ok) throw new Error(r.error); return r.data?.data||[]; } });
  const { data: proctorData, isLoading: loadingProctor } = useQuery({ queryKey:['proctor-students'], queryFn: async () => { const r = await getProctorStudents(); if(!r.ok) throw new Error(r.error); return r.data?.data||[]; } });
  // Ensure we always have an array to avoid runtime 'forEach is not a function' if API shape changes
  const proctorStudents: any[] = Array.isArray(proctorData) ? proctorData : [];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [success, setSuccess] = useState<string|undefined>();
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(()=>{ if(selectAll) setSelected(proctorStudents.map((s:any)=> s.usn)); else setSelected([]); },[selectAll, proctorStudents.length]);
  function toggle(usn:string){ setSelected(cur=> cur.includes(usn)? cur.filter(u=>u!==usn): [...cur, usn]); }
  const groupedClasses = useMemo(()=>{ const map: Record<string,{ branch_id:any; semester_id:any; section_id:any; usns:string[] }> = {}; (proctorStudents||[]).forEach((s:any)=>{ const b = s.branch_id||s.branch; const sem = s.semester_id||s.semester; const sec = s.section_id||s.section; if(b&&sem&&sec){ const key = `${b}-${sem}-${sec}`; if(!map[key]) map[key]={ branch_id:b, semester_id:sem, section_id:sec, usns:[] }; map[key].usns.push(s.usn);} }); return Object.values(map); },[proctorStudents]);
  async function send(){
    if(!title||!content){ setError('Title & content required'); return; }
    const list:any[] = proctorStudents as any[];
    const targets = selectAll? groupedClasses : (()=>{ const selStudents = list.filter(s=> selected.includes(s.usn)); const m: Record<string,{ branch_id:any; semester_id:any; section_id:any; usns:string[] }>={}; selStudents.forEach(s=>{ const b = (s as any).branch_id||s.branch; const sem = (s as any).semester_id||s.semester; const sec = (s as any).section_id||s.section; if(b&&sem&&sec){ const k=`${b}-${sem}-${sec}`; if(!m[k]) m[k]={ branch_id:b, semester_id:sem, section_id:sec, usns:[] }; m[k].usns.push(s.usn);} }); return Object.values(m); })();
    if(!targets.length){ setError('No target students'); return; }
    setSending(true); setError(undefined); setSuccess(undefined);
    for(const t of targets){ const res = await createTargetedAnnouncement({ branch_id:String(t.branch_id), semester_id:String(t.semester_id), section_id:String(t.section_id), target:'student', title, content, student_usns:t.usns }); if(!res.ok || !res.data?.success){ setError(res.error||res.data?.message||'Failed'); setSending(false); return; } }
    setSending(false); setTitle(''); setContent(''); setSelectAll(false); setSuccess('Notification sent'); qc.invalidateQueries({ queryKey:['sent-notifications'] }); }
  return (
    <ScrollView style={{ flex:1, padding:16 }} contentContainerStyle={{ paddingBottom:40 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Announcements</Text>
      <View style={{ backgroundColor:'#fff', padding:12, borderRadius:10, marginBottom:20 }}>
        <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:8 }}>Send Notification</Text>
        <TextInput placeholder='Title' value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
        <TextInput placeholder='Message' value={content} onChangeText={setContent} multiline style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, minHeight:80, marginBottom:8 }} />
        <TouchableOpacity onPress={()=> setSelectAll(s=>!s)} style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
          <View style={{ width:20, height:20, borderRadius:4, borderWidth:1, borderColor:'#2563eb', backgroundColor: selectAll? '#2563eb':'transparent', marginRight:8 }} />
          <Text>Select All Proctor Students</Text>
        </TouchableOpacity>
        {!selectAll && (
          <View style={{ maxHeight:140, borderWidth:1, borderColor:'#eee', borderRadius:6, padding:6 }}>
            {loadingProctor? <ActivityIndicator /> : proctorStudents.map((s:any)=> (
              <TouchableOpacity key={s.usn} onPress={()=>toggle(s.usn)} style={{ flexDirection:'row', alignItems:'center', marginBottom:4 }}>
                <View style={{ width:18, height:18, borderRadius:4, borderWidth:1, borderColor:'#2563eb', backgroundColor:selected.includes(s.usn)? '#2563eb':'transparent', marginRight:6 }} />
                <Text style={{ fontSize:12 }}>{s.name} ({s.usn})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {error && <Text style={{ color:'red', marginBottom:4 }}>{error}</Text>}
        {success && <Text style={{ color:'green', marginBottom:4 }}>{success}</Text>}
        <TouchableOpacity onPress={send} disabled={sending} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8, alignItems:'center', marginTop:4 }}>
          {sending? <ActivityIndicator color='#fff' /> : <Text style={{ color:'#fff', fontFamily:'Inter-SemiBold' }}>Send</Text>}
        </TouchableOpacity>
      </View>
      <Text style={{ fontFamily:'Inter-SemiBold', fontSize:18, marginBottom:6 }}>Received</Text>
      {loadingReceived? <ActivityIndicator /> : (receivedData||[]).map((n:any)=> (
        <View key={n.id} style={{ backgroundColor:'#f1f5f9', padding:12, borderRadius:10, marginBottom:8 }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{n.title}</Text>
          <Text>{n.message||n.content}</Text>
        </View>
      ))}
      <Text style={{ fontFamily:'Inter-SemiBold', fontSize:18, marginVertical:10 }}>Sent</Text>
      {loadingSent? <ActivityIndicator /> : (sentData||[]).map((n:any)=> (
        <View key={n.id} style={{ backgroundColor:'#fff', padding:12, borderRadius:10, marginBottom:8, borderWidth:1, borderColor:'#e5e7eb' }}>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{n.title}</Text>
          <Text>{n.message||n.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
