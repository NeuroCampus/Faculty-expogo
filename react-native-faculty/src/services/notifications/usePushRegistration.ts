import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { requestNotificationPermission, configureNotificationChannel } from './notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false })
});

export function usePushRegistration() {
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermission();
      await configureNotificationChannel();
      if (!granted) return;
      if (Device.isDevice) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        // TODO: send token to backend when endpoint exists.
        console.log('Expo push token', token);
      } else {
        console.log('Must use physical device for push notifications');
      }
    })();
  }, []);
}
