import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ClassSelector } from '../../components/ClassSelector';
import { getStudentsForClass, uploadInternalMarks, getInternalMarks } from '@api/faculty';
import { useQueryClient } from '@tanstack/react-query';

export default function UploadMarksScreen() {
  const [sel, setSel] = useState<{ branch_id?: number; semester_id?: number; section_id?: number; subject_id?: number; test_number?: number }>({});
  const [students, setStudents] = useState<{ id:number; name:string; usn:string; mark:string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const tests = [1,2,3,4];

  async function loadStudents() {
    if (!sel.branch_id || !sel.semester_id || !sel.section_id || !sel.subject_id || !sel.test_number) return;
    setLoading(true);
    const roster = await getStudentsForClass({ branch_id: sel.branch_id, semester_id: sel.semester_id, section_id: sel.section_id, subject_id: sel.subject_id });
    if(!roster.ok){ Alert.alert('Error', roster.error||'Roster fetch failed'); setLoading(false); return; }
    const existing = await getInternalMarks({ branch_id: sel.branch_id, semester_id: sel.semester_id, section_id: sel.section_id, subject_id: sel.subject_id, test_number: sel.test_number });
    const markMap: Record<string,string> = {};
    if (existing.ok) (existing.data?.data||[]).forEach(st => { if(st.mark !== '' && st.mark != null) markMap[String(st.id)] = String(st.mark); });
    setStudents((roster.data?.data||[]).map((s:any)=> ({ id:s.id, name:s.name, usn:s.usn, mark: markMap[String(s.id)] || '' })));
    setLoading(false);
  }
  async function submit() {
    if (!sel.branch_id || !sel.semester_id || !sel.section_id || !sel.subject_id || !sel.test_number) return;
    setSaving(true);
    const payload = { branch_id:String(sel.branch_id), semester_id:String(sel.semester_id), section_id:String(sel.section_id), subject_id:String(sel.subject_id), test_number: sel.test_number, marks: students.map(s=>({ student_id:String(s.id), mark:Number(s.mark||0) })) };
    const r = await uploadInternalMarks(payload);
    if (r.ok && r.data?.success) { Alert.alert('Success','Marks uploaded'); qc.invalidateQueries({ queryKey:['internal-marks', sel] }); } else Alert.alert('Error', r.error||r.data?.message||'Failed');
    setSaving(false);
  }
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Upload Internal Marks</Text>
      <ClassSelector value={sel} onChange={p=>setSel(v=>({ ...v, ...p }))} />
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginVertical:8 }}>
        {tests.map(t => (
          <TouchableOpacity key={t} onPress={()=> setSel(s=> ({ ...s, test_number:t }))} style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:20, backgroundColor: sel.test_number===t? '#2563eb':'#e5e7eb', marginRight:8, marginBottom:8 }}>
            <Text style={{ color: sel.test_number===t? '#fff':'#111', fontSize:12 }}>Test {t}</Text>
          </TouchableOpacity>
        ))}
      </View>
  <TouchableOpacity onPress={loadStudents} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8, marginBottom:12 }}><Text style={{ color:'#fff', textAlign:'center' }}>Load Students / Refresh</Text></TouchableOpacity>
      {loading && <ActivityIndicator />}
      <FlatList data={students} keyExtractor={s=>String(s.id)} renderItem={({ item, index }) => (
        <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
          <View style={{ flex:1 }}><Text style={{ fontFamily:'Inter-SemiBold' }}>{item.name}</Text><Text style={{ color:'#555' }}>{item.usn}</Text></View>
          <TextInput value={item.mark} onChangeText={t=> setStudents(st=> st.map((x,i)=> i===index? { ...x, mark:t.replace(/[^0-9]/g,'') }:x))} placeholder="Mark" keyboardType='numeric' style={{ width:70, borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:6 }} />
        </View>
      )} />
      {students.length>0 && <TouchableOpacity disabled={saving} onPress={submit} style={{ backgroundColor:'#0f766e', padding:14, borderRadius:8, marginTop:12 }}><Text style={{ textAlign:'center', color:'#fff' }}>{saving? 'Saving...':'Submit Marks'}</Text></TouchableOpacity>}
    </View>
  );
}
