// ─────────────────────────────────────────────────────────
//  useNotifications.ts – ask permission, save FCM token,
//                        handle foreground messages
//  Requires: @react-native-firebase/app @react-native-firebase/messaging
//            @notifee/react-native
// ─────────────────────────────────────────────────────────
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/** Google Apps Script “web app” URL that receives the token
 *   (see next section).  */
const TOKEN_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbz2aLls33mxwo-258o5BJooj6zRXC5nDzirMERFol4r0vIFvuGODWoYgqhVRz_GVmkt/exec';

export default function useNotifications() {
  useEffect(() => {
    /* 1. runtime permission (Android 13+ will prompt) */
    messaging()
      .requestPermission()
      .catch(() => { /* user denied */ });

    /* 2. get / refresh token and push to Sheet */
    const upload = async () => {
      const token = await messaging().getToken();
      if (!token) return;

      /* GET request so it’s easy from Apps-Script */
      const url = `${TOKEN_ENDPOINT}?token=${encodeURIComponent(token)}`;
      try { await fetch(url); } catch { /* ignore network errors */ }
    };
    upload();

    /* also listen for token refresh */
    const unsubToken = messaging().onTokenRefresh(upload);

    /* 3. foreground handler → banner */
    const unsubFg = messaging().onMessage(async (msg) => {
      /* ensure channel exists */
      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
      });
      const n = msg.notification ?? {};
      notifee.displayNotification({
        title: n.title,
        body : n.body,
        android: { channelId: 'default', smallIcon: 'ic_launcher' },
      });
    });

    return () => {
      unsubFg();
      unsubToken();
    };
  }, []);
}
