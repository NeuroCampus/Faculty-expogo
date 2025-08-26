import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getExams, getExamDetail, getExamResults, recordExamResult, bulkRecordExamResults, Exam, ExamResult } from '@api/faculty';

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[] | null>(null);

  async function load() {
    setLoading(true);
    const r = await getExams();
    if (r.ok && r.data?.data) setExams(r.data.data); else setExams([]);
    setLoading(false);
  }
  useEffect(()=> { load(); }, []);

  async function openExam(e: Exam) {
    setActiveExam(e);
    const rr = await getExamResults(e.id);
    if (rr.ok && rr.data?.data) setResults(rr.data.data); else setResults([]);
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      {!activeExam && (
        <>
          <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Exams</Text>
          {loading && <ActivityIndicator />}
          <FlatList data={exams} keyExtractor={i=> String(i.id)} renderItem={({ item }) => (
            <TouchableOpacity onPress={()=> openExam(item)} style={{ padding:14, backgroundColor:'#f1f5f9', borderRadius:12, marginBottom:10 }}>
              <Text style={{ fontFamily:'Inter-SemiBold', fontSize:16 }}>{item.name}</Text>
              <Text style={{ color:'#64748b', marginTop:4 }}>{item.date || 'No date'}</Text>
              <Text style={{ color:'#0f172a', marginTop:6, fontSize:12 }}>{item.results_recorded || 0} results</Text>
            </TouchableOpacity>
          )} />
        </>
      )}
      {activeExam && (
        <View style={{ flex:1 }}>
          <TouchableOpacity onPress={()=> { setActiveExam(null); setResults(null); }} style={{ marginBottom:12 }}><Text style={{ color:'#2563eb' }}>◀ Back</Text></TouchableOpacity>
          <Text style={{ fontSize:20, fontFamily:'Inter-SemiBold' }}>{activeExam.name}</Text>
          <Text style={{ color:'#475569', marginTop:4 }}>{activeExam.date || 'No date.'}</Text>
          <Text style={{ marginTop:16, fontFamily:'Inter-SemiBold' }}>Results</Text>
          {!results && <ActivityIndicator style={{ marginTop:12 }} />}
          {results && <FlatList data={results} keyExtractor={r=> String(r.id)} renderItem={({ item }) => (
            <View style={{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#e2e8f0' }}>
              <Text style={{ fontFamily:'Inter-SemiBold' }}>{item.student}</Text>
              <Text style={{ color:'#64748b', fontSize:12 }}>Mark: {item.mark}/{item.max_mark}</Text>
            </View>
          )} />}
        </View>
      )}
    </View>
  );
}
