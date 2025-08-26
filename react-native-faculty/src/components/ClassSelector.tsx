import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAssignments, FacultyAssignment } from '@api/faculty';

interface Props { value: { branch_id?: number; semester_id?: number; section_id?: number; subject_id?: number }; onChange: (partial: Partial<Props['value']>) => void; }

export const ClassSelector: React.FC<Props> = ({ value, onChange }) => {
  const { data, isLoading } = useQuery({ queryKey:['assignments'], queryFn: async () => { const r = await getAssignments(); if(!r.ok) throw new Error(r.error); return r.data?.data || []; }});
  const assignments: FacultyAssignment[] = data || [];
  const branches = Array.from(new Map(assignments.map(a=>[a.branch_id,{ id:a.branch_id, name:a.branch }])).values());
  const semesters = value.branch_id ? Array.from(new Map(assignments.filter(a=>a.branch_id===value.branch_id).map(a=>[a.semester_id,{ id:a.semester_id, name:a.semester }])).values()):[];
  const sections = value.semester_id? Array.from(new Map(assignments.filter(a=>a.branch_id===value.branch_id&&a.semester_id===value.semester_id).map(a=>[a.section_id,{ id:a.section_id, name:a.section }])).values()):[];
  const subjects = value.section_id? Array.from(new Map(assignments.filter(a=>a.branch_id===value.branch_id&&a.semester_id===value.semester_id&&a.section_id===value.section_id).map(a=>[a.subject_id,{ id:a.subject_id, name:a.subject_name }])).values()):[];
  if (isLoading) return <ActivityIndicator />;
  const Btn = ({label, selected}:{label:string; selected?:boolean}) => <View style={{ paddingVertical:6, paddingHorizontal:12, backgroundColor:selected?'#2563eb':'#e2e8f0', borderRadius:20, marginRight:8, marginBottom:8 }}><Text style={{ color:selected?'#fff':'#111', fontSize:12 }}>{label}</Text></View>;
  return (
    <View style={{ marginBottom:12 }}>
      <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:4 }}>Branch</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
        {branches.map(b=> <TouchableOpacity key={b.id} onPress={()=>onChange({ branch_id:b.id, semester_id:undefined, section_id:undefined, subject_id:undefined })}><Btn label={b.name} selected={value.branch_id===b.id} /></TouchableOpacity>)}
      </View>
      {semesters.length>0 && <>
        <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:4, marginTop:8 }}>Semester</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>{semesters.map(s=> <TouchableOpacity key={s.id} onPress={()=>onChange({ semester_id:s.id, section_id:undefined, subject_id:undefined })}><Btn label={String(s.name)} selected={value.semester_id===s.id} /></TouchableOpacity>)}</View>
      </>}
      {sections.length>0 && <>
        <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:4, marginTop:8 }}>Section</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>{sections.map(s=> <TouchableOpacity key={s.id} onPress={()=>onChange({ section_id:s.id, subject_id:undefined })}><Btn label={s.name} selected={value.section_id===s.id} /></TouchableOpacity>)}</View>
      </>}
      {subjects.length>0 && <>
        <Text style={{ fontFamily:'Inter-SemiBold', marginBottom:4, marginTop:8 }}>Subject</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>{subjects.map(s=> <TouchableOpacity key={s.id} onPress={()=>onChange({ subject_id:s.id })}><Btn label={s.name} selected={value.subject_id===s.id} /></TouchableOpacity>)}</View>
      </>}
    </View>
  );
};
