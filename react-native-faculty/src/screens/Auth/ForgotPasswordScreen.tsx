import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { forgotPassword } from '../../api/auth';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  async function submit() {
    setLoading(true); setMsg(null);
    const r:any = await forgotPassword({ email });
    setMsg(r.message|| (r.success? 'Email sent':'Failed'));
    setLoading(false);
  }
  return (
    <View style={{ flex:1, padding:24, justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontFamily:'System', marginBottom:16 }}>Forgot Password</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder='Email' autoCapitalize='none' style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:12 }} />
      {msg && <Text style={{ marginBottom:8 }}>{msg}</Text>}
      <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:8, alignItems:'center' }}>
        {loading? <ActivityIndicator color='#fff' /> : <Text style={{ color:'#fff' }}>Send OTP</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigation.goBack()} style={{ marginTop:16 }}><Text style={{ color:'#2563eb' }}>Back to Login</Text></TouchableOpacity>
    </View>
  );
}
