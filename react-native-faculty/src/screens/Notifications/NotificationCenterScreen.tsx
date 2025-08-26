import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { scheduleLocalTestNotification } from '../../services/notifications/notifications';
// Lazy load expo-av to avoid early prototype access if version mismatch
let AudioRef: any = null;
let cachedSound: any = null;

interface InAppNotification { id: string; title?: string; body?: string; date: number; }

export default function NotificationCenterScreen() {
  const [items, setItems] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      const title = n.request.content.title || undefined;
      const body = n.request.content.body || undefined;
      setItems(prev => [{ id: n.request.identifier, title, body, date: Date.now() }, ...prev]);
    });
    return () => sub.remove();
  }, []);

  const onPlayTone = async () => {
    try {
      if (!AudioRef) {
        let mod: any = await import('expo-av').catch(()=>null);
        if(!mod || !mod.Audio){
          try { mod = require('expo-av'); } catch {}
        }
        if(!mod || !mod.Audio){ throw new Error('expo-av Audio unavailable'); }
        AudioRef = mod.Audio;
      }
      if (!cachedSound) {
        cachedSound = new AudioRef.Sound();
        await cachedSound.loadAsync(require('../../../assets/sounds/custom_notification.wav'));
      }
      await cachedSound.replayAsync();
    } catch (e) {
      console.warn('Tone play failed', e);
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <View style={{ flexDirection:'row', gap:12, marginBottom:12 }}>
        <TouchableOpacity onPress={() => scheduleLocalTestNotification()} style={{ backgroundColor:'#2563eb', padding:12, borderRadius:8 }}>
          <Text style={{ color:'#fff' }}>Trigger Local Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlayTone} style={{ backgroundColor:'#0ea5e9', padding:12, borderRadius:8 }}>
          <Text style={{ color:'#fff' }}>Play Custom Tone</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8 }}>
            <Text style={{ fontWeight:'600' }}>{item.title || 'Notification'}</Text>
            <Text style={{ color:'#444' }}>{item.body}</Text>
            <Text style={{ color:'#888', fontSize:12, marginTop:6 }}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color:'#666' }}>No notifications yet.</Text>}
      />
    </View>
  );
}


