import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Print from 'expo-print';
import Svg, { Rect } from 'react-native-svg';

export default function GenerateStatisticsScreen() {
  const onExportPdf = async () => {
    const html = `<!doctype html><html><body><h1>Statistics</h1><p>Exported from mobile app.</p></body></html>`;
    try {
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Export failed', String(e));
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:12 }}>Generate Statistics</Text>
      <View style={{ borderWidth:1, borderColor:'#eee', borderRadius:10, padding:16, marginBottom:16 }}>
        <Text style={{ color:'#666', marginBottom:8 }}>Attendance by Section</Text>
        <Svg width="100%" height="120">
          <Rect x="10" y="20" width="60" height="80" fill="#60a5fa" />
          <Rect x="90" y="40" width="60" height="60" fill="#34d399" />
          <Rect x="170" y="30" width="60" height="70" fill="#fbbf24" />
        </Svg>
      </View>
      <TouchableOpacity onPress={onExportPdf} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:10 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>Export as PDF</Text>
      </TouchableOpacity>
    </View>
  );
}


