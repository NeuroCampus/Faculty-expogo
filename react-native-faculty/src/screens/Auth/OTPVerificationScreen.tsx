import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function OTPVerificationScreen() {
  const { verifying, verifyOtp, userIdForOtp } = useAuth() as any;
  const [otp, setOtp] = useState('');

  const onVerify = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-6 digit code.');
      return;
    }
    const res = await verifyOtp(otp);
    if (!res?.success) {
      Alert.alert('Verification failed', res?.message || 'Please try again');
    }
  };

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'600', marginBottom:8 }}>OTP Verification</Text>
      <Text style={{ color:'#555', marginBottom:20 }}>We sent an OTP to your registered contact. Enter it to continue.</Text>
      <Text style={{ color:'#666', marginBottom:8 }}>User ID: {userIdForOtp || '-'} </Text>
      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, paddingHorizontal:12, paddingVertical:10, marginBottom:16 }}
      />
      <TouchableOpacity onPress={onVerify} disabled={verifying} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:10, opacity: verifying ? 0.7 : 1 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>{verifying ? 'Verifying…' : 'Verify OTP'}</Text>
      </TouchableOpacity>
    </View>
  );
}


