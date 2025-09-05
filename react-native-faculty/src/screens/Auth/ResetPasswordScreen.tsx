import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { resetPassword } from '../../api/auth';

export default function ResetPasswordScreen({ navigation }: any) {
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  async function submit() {
    setLoading(true); setMsg(null);
    const r:any = await resetPassword({ user_id:userId, otp, new_password:pass, confirm_password:confirm });
    setMsg(r.message|| (r.success? 'Password reset':'Failed'));
    setLoading(false);
  }
  return (
    <View style={{ flex:1, padding:24, justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontFamily:'System', marginBottom:16 }}>Reset Password</Text>
      <TextInput value={userId} onChangeText={setUserId} placeholder='User ID' style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:8 }} />
      <TextInput value={otp} onChangeText={setOtp} placeholder='OTP' style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:8 }} />
      <TextInput value={pass} onChangeText={setPass} placeholder='New Password' secureTextEntry style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:8 }} />
      <TextInput value={confirm} onChangeText={setConfirm} placeholder='Confirm Password' secureTextEntry style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:12 }} />
      {msg && <Text style={{ marginBottom:8 }}>{msg}</Text>}
      <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:8, alignItems:'center' }}>
        {loading? <ActivityIndicator color='#fff' /> : <Text style={{ color:'#fff' }}>Reset</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigation.goBack()} style={{ marginTop:16 }}><Text style={{ color:'#2563eb' }}>Back</Text></TouchableOpacity>
    </View>
  );
}
