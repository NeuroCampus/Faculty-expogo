import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function ProctorStudentDetailScreen({ route }: any){
  const { student } = route.params || {};
  if(!student) return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><Text>No student data</Text></View>;
  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'System', marginBottom:8 }}>{student.name}</Text>
      <Text style={{ marginBottom:8 }}>{student.usn}</Text>
      <Text style={{ fontFamily:'System', marginTop:12 }}>Attendance</Text>
      <Text>{student.attendance ?? '--'}%</Text>
      <Text style={{ fontFamily:'System', marginTop:12 }}>Marks</Text>
      {(student.marks||[]).map((m:any, idx:number)=>(<Text key={idx} style={{ fontSize:12 }}>{m.subject} T{m.test_number}: {m.mark}/{m.max_mark}</Text>))}
      <Text style={{ fontFamily:'System', marginTop:12 }}>Latest Leave</Text>
      {student.latest_leave_request? <Text style={{ fontSize:12 }}>{student.latest_leave_request.start_date} → {student.latest_leave_request.end_date} ({student.latest_leave_request.status})</Text> : <Text style={{ fontSize:12 }}>None</Text>}
      <Text style={{ fontFamily:'System', marginTop:12 }}>Certificates</Text>
      {(student.certificates||[]).map((c:any,i:number)=>(<Text key={i} style={{ fontSize:12 }}>{c.title}</Text>))}
    </ScrollView>
  );
}


