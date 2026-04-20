/**
 * @format
 */
import * as React from 'react';
import { AppRegistry, Platform, LogBox } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';

LogBox.ignoreLogs([
  'Warning: Encountered two children with the same key, `[object Object]`. Keys should be unique so that components maintain',
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation',
]);
import { PaperProvider } from 'react-native-paper';
import { name as appName } from './app.json';
import App from './App';
import { SamsungHealthBackgroundSync } from './src/services/SamsungHealthBackgroundSync';
import { handleNavigation } from './NotificationHandler';

export default function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);

if (Platform.OS === 'android') {
  BackgroundFetch.registerHeadlessTask(async (event) => {
    const taskId = event.taskId;
    console.log('[Headless] Task triggered:', taskId);

    // Handle end-of-day sync task
    if (taskId === 'shealth-eod-sync') {
      console.log('[Headless] Running end-of-day sync...');
      await SamsungHealthBackgroundSync.performEndOfDaySync();
    } else {
      // Handle regular sync task
      console.log('[Headless] Running regular sync...');
      await SamsungHealthBackgroundSync.manualSync();
    }
  });
}

// Background FCM Message Handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background FCM Message:', remoteMessage);
  if (remoteMessage.notification) {
    console.log('📩 Native FCM notification detected, skipping Notifee.');
    return;
  }

  // 2. Extract content and check if it's empty to avoid "ghost" notifications (like 'RTE Notification' fallback)
  const title = remoteMessage.data?.title || remoteMessage.notification?.title;
  const body = remoteMessage.data?.body || remoteMessage.notification?.body;

  if (!title && !body) {
    console.log('📩 Empty notification content, skipping display.');
    return;
  }

  // Show notification for data-only messages in background
  try {
    await notifee.displayNotification({
      id: remoteMessage.messageId, // Sync with FCM message ID to prevent duplicates
      title: title || 'RTE Notification',
      body: body || 'You have a new update',
      data: remoteMessage.data,
      android: {
        channelId: 'com.loginsignupapp',
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
    });
  } catch (error) {
    console.warn('Background displayNotification failed:', error);
  }
});// Notifee Background Event Handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('📲 Notifee Background Notification Press:', detail.notification);
    handleNavigation()
    // On Android, a PRESS event will automatically launch the app if configured correctly.
    // The handleNavigation logic in NotificationHandler.js will take over from here.
  }
});
