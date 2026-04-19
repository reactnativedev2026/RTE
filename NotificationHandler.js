{/* <NotificationHandler /> app.js call */ }

import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, navigationRef } from './src/services/NavigationService';
import { Routes } from './src/utils/Routes';

const NotificationHandler = () => {

  useEffect(() => {
    const requestPermission = async () => {
      try {
        // POST_NOTIFICATIONS is only a runtime permission on Android 13+ (API 33).
        // On older versions, requesting it returns 'denied' immediately, causing
        // an early return before the FCM token is ever retrieved.
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('❌ Notification permission denied');
            return;
          }
        }

        const authStatus = await messaging().requestPermission();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted');

          const fcmToken = await messaging().getToken();
          await AsyncStorage.setItem('fcmToken', fcmToken || '');
          console.log('📲 FCM Token:', fcmToken);
        }
      } catch (error) {
        console.warn('Permission error:', error);
      }
    };
    requestPermission();
  }, []);

  // Android channel
  useEffect(() => {
    if (Platform.OS === 'android') {
      notifee.createChannel({
        id: 'com.loginsignupapp',
        name: 'com.loginsignupapp',
        importance: AndroidImportance.HIGH,
      }).then(() => {
        console.log('✅ Notifee channel created');
      }).catch((err) => {
        console.warn('NotificationHandler: Notifee createChannel failed', err?.message || err);
      });
    }
  }, []);

  // Foreground FCM messages
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log('📩 Foreground FCM Message:', remoteMessage);
        try {
          await notifee.displayNotification({
            title: remoteMessage?.notification?.title || 'New Notification',
            body: remoteMessage?.notification?.body || 'You have a new message',
            android: {
              channelId: 'com.loginsignupapp',
              importance: AndroidImportance.HIGH,
              pressAction: { id: 'default' },
            },
          });
        } catch (err) {
          console.warn('NotificationHandler: displayNotification failed', err?.message || err);
        }
      });
    } catch (error) {
      console.warn('NotificationHandler: onMessage setup failed', error?.message || error);
      return () => { };
    }
    return () => unsubscribe?.();
  }, []);

  // Background & quit state handlers
  useEffect(() => {
    let unsubscribe;
    try {
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('📲 Opened from quit state (FCM):', remoteMessage);
            handleNavigation(remoteMessage.data);
          }
        })
        .catch((err) => console.warn('NotificationHandler: getInitialNotification failed', err?.message || err));

      notifee.getInitialNotification()
        .then((notification) => {
          if (notification) {
            console.log('📲 Opened from quit state (Notifee):', notification.notification);
            handleNavigation(notification.notification.data);
          }
        })
        .catch((err) => console.warn('NotificationHandler: Notifee getInitialNotification failed', err?.message || err));

      unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage) {
          console.log('📲 Opened from background:', remoteMessage);
          handleNavigation(remoteMessage.data);
        }
      });
    } catch (error) {
      console.warn('NotificationHandler: notification opened handlers failed', error?.message || error);
      return () => { };
    }
    return () => unsubscribe?.();
  }, []);

  // Notifee Foreground Events
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('📲 Notifee Foreground Press:', detail.notification);
        handleNavigation(detail.notification?.data);
      }
    });
    return () => unsubscribe();
  }, []);



  return null;
};

export default NotificationHandler;

export const handleNavigation = (data: any) => {
  // if (!data) {
  //   console.log('📲 handleNavigation: No data found in payload');
  //   return;
  // }

  console.log('📲 handleNavigation: Processing Data:', JSON.stringify(data));
  const notificationType = data?.type || '';

  // if (notificationType.startsWith('monthly_goal')) {
  console.log('📲 Type matches: monthly_goal. Navigating to MonthlyGoalScreen...');

  const navParams = {
    screen: Routes.MONTHLY_GOAL,
  };

  // Robust retry logic for cold start / navigation readiness
  let attempts = 0;
  const tryNavigate = () => {
    attempts++;
    if (navigationRef.isReady()) {
      console.log(`📲 Navigation Ready (Attempt ${attempts}). Jumping to screen.`);
      navigate(Routes.CALENDAR_STACK, navParams);
    } else if (attempts < 6) {
      console.log(`📲 Navigation Not Ready (Attempt ${attempts}), retrying in 800ms...`);
      setTimeout(tryNavigate, 800);
    } else {
      console.warn('📲 Navigation failed: Timeout after 6 attempts.');
    }
  };

  tryNavigate();
  // } else {
  //   console.log('📲 No specific navigation logic defined for type:', notificationType);
  // }
};

