import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AppHeader: React.FC<{ title: string; onMenu?: () => void }> = ({ title, onMenu }) => {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:12, backgroundColor:'#ffffff', borderBottomWidth:1, borderColor:'#eee' }}>
      {onMenu && (
        <TouchableOpacity onPress={onMenu} style={{ marginRight:12 }}>
          <Ionicons name="menu" size={24} color="#111" />
        </TouchableOpacity>
      )}
      <Text style={{ fontSize:18, fontFamily:'Inter-SemiBold' }}>{title}</Text>
    </View>
  );
};
