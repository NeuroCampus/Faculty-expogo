import React, { useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAssignments, getInternalMarks, uploadInternalMarks } from '../../api/faculty';
import * as DocumentPicker from 'expo-document-picker';
import { z } from 'zod';

interface EditableStudent { id: string; name: string; mark: string }

export default function MarksScreen() {
  const { data, isLoading } = useQuery({ queryKey:['assignments'], queryFn: async () => { const r = await getAssignments(); if(!r.ok) throw new Error(r.error); return r.data; } });
  const assignments = data?.data || [];
  const [selected, setSelected] = useState<any | null>(null);
  const [students, setStudents] = useState<EditableStudent[]>([]);
  const [test, setTest] = useState<number>(1);

  const pick = async (a: any) => {
    setSelected(a);
    const r = await getInternalMarks({ branch_id:a.branch_id, semester_id:a.semester_id, section_id:a.section_id, subject_id:a.subject_id, test_number:test });
    if (r.ok && r.data?.data) setStudents(r.data.data.map((s:any)=> ({ id:String(s.id), name:s.name, mark: s.mark === '' ? '' : String(s.mark) })));
  };

  React.useEffect(() => {
    (async () => {
      if (!selected) return;
      const r = await getInternalMarks({ branch_id:selected.branch_id, semester_id:selected.semester_id, section_id:selected.section_id, subject_id:selected.subject_id, test_number:test });
      if (r.ok && r.data?.data) setStudents(r.data.data.map((s:any)=> ({ id:String(s.id), name:s.name, mark: s.mark === '' ? '' : String(s.mark) })));
    })();
  }, [test]);

  const save = async () => {
    if (!selected) return;
    const markSchema = z.object({ student_id: z.string().min(1), mark: z.number().min(0) });
    const marks = students.map(s => ({ student_id: s.id, mark: Number(s.mark || 0) }));
    for (const m of marks) {
      const r = markSchema.safeParse(m);
      if (!r.success) { Alert.alert('Validation', 'Check marks input'); return; }
    }
    const res = await uploadInternalMarks({ branch_id:String(selected.branch_id), semester_id:String(selected.semester_id), section_id:String(selected.section_id), subject_id:String(selected.subject_id), test_number:test, marks });
    if (!res.ok) Alert.alert('Error', res.error || 'Failed'); else Alert.alert('Saved', 'Marks uploaded');
  };

  const importCsv = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'application/vnd.ms-excel'] });
    if (res.canceled || !res.assets?.length) return;
    const file = res.assets[0];
    // Basic parse: expect lines of "id,mark"
    try {
      const text = await (await fetch(file.uri)).text();
      const rows = text.split(/\r?\n/).filter(Boolean);
      const map = new Map<string, string>();
      rows.forEach(line => { const [id, mark] = line.split(','); if (id) map.set(id.trim(), (mark||'').trim()); });
      setStudents(prev => prev.map(s => ({ ...s, mark: map.get(s.id) ?? s.mark })));
      Alert.alert('CSV', 'Imported into current list');
    } catch (e) {
      Alert.alert('CSV', 'Failed to parse file');
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Upload Marks</Text>
      {isLoading && <ActivityIndicator />}
      {!selected ? (
        <FlatList data={assignments} keyExtractor={(i)=>String(i.subject_id)+i.section_id} renderItem={({ item }) => (
          <TouchableOpacity onPress={()=>pick(item)} style={{ padding:14, backgroundColor:'#fff', borderRadius:10, marginBottom:10, borderWidth:1, borderColor:'#e5e7eb' }}>
            <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.subject_name}</Text>
            <Text style={{ color:'#555' }}>{item.branch} • Sem {item.semester} • {item.section}</Text>
          </TouchableOpacity>
        )} />
      ) : (
        <View style={{ flex:1 }}>
          <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:8 }}>{selected.subject_name} ({selected.section})</Text>
          <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
            {[1,2,3,4].map(n => (
              <TouchableOpacity key={n} onPress={()=> setTest(n)} style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor: test===n? '#2563eb':'#e5e7eb' }}>
                <Text style={{ color: test===n?'#fff':'#111827' }}>{n<=3? `IA${n}` : 'SEE'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={importCsv} style={{ marginLeft:'auto', paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#0ea5e9' }}>
              <Text style={{ color:'#fff' }}>Import CSV</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={students} keyExtractor={s=>s.id} renderItem={({ item, index }) => (
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
              <Text style={{ width:120 }}>{item.name}</Text>
              <TextInput value={item.mark} onChangeText={v=> setStudents(prev => prev.map((s,i)=> i===index? { ...s, mark: v.replace(/[^0-9]/g,'') }: s))} keyboardType='numeric' placeholder='Mark' style={{ borderWidth:1, borderColor:'#ccc', padding:8, borderRadius:6, flex:1 }} />
            </View>
          )} />
          <TouchableOpacity onPress={save} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:8, alignItems:'center', marginTop:8 }}>
            <Text style={{ color:'#fff', fontFamily:'Inter-SemiBold' }}>Save Marks</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setSelected(null)} style={{ padding:12, alignItems:'center', marginTop:4 }}>
            <Text style={{ color:'#2563eb' }}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
