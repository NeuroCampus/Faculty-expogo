import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { getProfile, manageProfile } from '@api/faculty';
import * as ImagePicker from 'expo-image-picker';
import { z } from 'zod';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  useEffect(()=>{ (async ()=>{ const r = await getProfile(); if (r.ok) setProfile(r.data?.data); setLoading(false); })(); },[]);
  if (loading) return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><ActivityIndicator /></View>;
  if (!profile) return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><Text>No profile</Text></View>;
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'Inter-SemiBold', marginBottom:12 }}>Profile</Text>
      {avatar ? (
        <Image source={{ uri: avatar }} style={{ width:96, height:96, borderRadius:48, marginBottom:8 }} />
      ) : null}
      {!editing ? (
        <>
          <Text style={{ fontFamily:'Inter-SemiBold' }}>{profile.first_name} {profile.last_name}</Text>
          <Text>{profile.email}</Text>
          <Text style={{ marginTop:8 }}>Username: {profile.username}</Text>
          <TouchableOpacity onPress={()=> { setEditing(true); setFirstName(profile.first_name||''); setLastName(profile.last_name||''); setEmail(profile.email||''); }} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8, alignItems:'center', marginTop:12 }}>
            <Text style={{ color:'#fff', fontFamily:'Inter-SemiBold' }}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput placeholder='First name' value={firstName} onChangeText={setFirstName} style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
          <TextInput placeholder='Last name' value={lastName} onChangeText={setLastName} style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
          <TextInput placeholder='Email' value={email} onChangeText={setEmail} keyboardType='email-address' style={{ borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6, marginBottom:8 }} />
          <View style={{ flexDirection:'row', gap:8 }}>
            <TouchableOpacity onPress={async ()=> {
              const p = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing:true, quality:0.7 });
              if (!p.canceled) setAvatar(p.assets[0].uri);
            }} style={{ backgroundColor:'#0ea5e9', padding:12, borderRadius:8 }}>
              <Text style={{ color:'#fff' }}>Select Avatar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async ()=> {
              const schema = z.object({ first_name: z.string().min(1), last_name: z.string().min(1), email: z.string().email() });
              const ok = schema.safeParse({ first_name:firstName, last_name:lastName, email });
              if (!ok.success) { Alert.alert('Validation', 'Please check inputs'); return; }
              const res = await manageProfile({ first_name:firstName, last_name:lastName, email });
              if (!res.ok) Alert.alert('Error', res.error||'Failed'); else { Alert.alert('Saved'); setEditing(false); const r = await getProfile(); if(r.ok) setProfile(r.data?.data); }
            }} style={{ backgroundColor:'#16a34a', padding:12, borderRadius:8 }}>
              <Text style={{ color:'#fff' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> setEditing(false)} style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:8 }}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
