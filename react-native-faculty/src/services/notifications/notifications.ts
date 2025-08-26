import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function configureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'custom_notification.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb'
    });
  }
}

export async function scheduleLocalTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Test Notification', body: 'This is a local test', sound: 'custom_notification.wav' },
    trigger: null
  });
}

export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}
