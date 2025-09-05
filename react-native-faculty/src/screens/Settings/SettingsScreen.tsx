import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import { scheduleLocalTestNotification } from '../../services/notifications/notifications';

export default function SettingsScreen() {
  const { logoutUser } = useAuth();

  const askContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    Alert.alert('Contacts', status === 'granted' ? 'Granted' : 'Denied');
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if(!res.canceled) Alert.alert('Picked', res.assets[0].uri);
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontFamily:'System', marginBottom:16 }}>Settings</Text>
      <TouchableOpacity onPress={scheduleLocalTestNotification} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8, marginBottom:12 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Test Local Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={askContacts} style={{ backgroundColor:'#0f766e', padding:12, borderRadius:8, marginBottom:12 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Request Contacts Permission</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage} style={{ backgroundColor:'#6d28d9', padding:12, borderRadius:8, marginBottom:12 }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Pick Profile Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logoutUser} style={{ backgroundColor:'#dc2626', padding:12, borderRadius:8, marginTop:'auto' }}>
        <Text style={{ color:'#fff', textAlign:'center' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
