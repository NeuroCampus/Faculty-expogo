# Faculty Mobile (Expo)

React Native (Expo) implementation of the Faculty dashboard features.

## Features Scaffolded
- Auth (login) with token storage & proactive refresh.
- Dashboard (today classes + snapshot).
- Attendance (assignments list placeholder for taking attendance).
- Announcements (list + create basic example).
- Proctor students listing.
- Settings (permissions, image picker, local notification test, logout).
- Push notifications registration & custom sound channel.
- Contacts & camera/image-picker scaffolding.

## Install & Run
```bash
cd react-native-faculty
npm install  # or yarn
echo "EXPO_PUBLIC_API_BASE_URL=https://your-backend" > .env  # or use eas secrets
npx expo start
```

Use the Expo Go app (iOS/Android) to scan the QR code. Replace placeholder assets (fonts & sound) with real binaries.

## Next Steps
- Implement remaining faculty flows (leave, marks, detailed attendance taking UI).
- Add offline queue for attendance.
- Add push token registration endpoint integration.
- Improve styling & adopt design system tokens.

## Custom Notification Sound
Replace `assets/sounds/custom_notification.wav` with your desired sound. Ensure it is listed in `app.json` (already configured) and shorter than 5 seconds.

## Fonts
Replace placeholder font files with real `Inter` font files or adjust `App.tsx` to match your chosen typography.

## Environment Vars
API base URL uses `EXPO_PUBLIC_API_BASE_URL`. For EAS builds, define it in `app.config` or `eas.json` env.

## Security Notes
- Refresh tokens stored in AsyncStorage (consider SecureStore for higher security).
- Add rate limiting & token revocation on backend for production.
