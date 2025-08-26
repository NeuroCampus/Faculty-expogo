import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getLeaveRequests, approveLeaveRequest, denyLeaveRequest } from '../../api/faculty';

interface Item { id: string; branch: string; start_date: string; end_date: string; reason: string; status: string; }

export default function ManageStudentLeaveScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { ok, data } = await getLeaveRequests();
      if (ok && data?.data) setItems(data.data as any);
      setLoading(false);
    })();
  }, []);

  const act = async (id: string, action: 'approve' | 'deny') => {
    const r = action==='approve' ? await approveLeaveRequest(id) : await denyLeaveRequest(id);
    if (r.ok) setItems(prev => prev.map(i => i.id===id? { ...i, status: action==='approve'? 'APPROVED' : 'DENIED' } : i));
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:12 }}>Manage Student Leaves</Text>
      <FlatList
        refreshing={loading}
        onRefresh={() => {}}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding:12, borderWidth:1, borderColor:'#eee', borderRadius:10, marginBottom:10 }}>
            <Text style={{ fontWeight:'600' }}>{item.branch}</Text>
            <Text style={{ color:'#555' }}>{item.start_date} → {item.end_date}</Text>
            <Text style={{ color:'#444', marginTop:4 }}>{item.reason}</Text>
            <View style={{ flexDirection:'row', gap:10, marginTop:10 }}>
              <TouchableOpacity onPress={()=> act(item.id, 'approve')} style={{ backgroundColor:'#16a34a', padding:10, borderRadius:8 }}>
                <Text style={{ color:'#fff' }}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> act(item.id, 'deny')} style={{ backgroundColor:'#dc2626', padding:10, borderRadius:8 }}>
                <Text style={{ color:'#fff' }}>Deny</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color:'#666' }}>No leave requests.</Text>}
      />
    </View>
  );
}


