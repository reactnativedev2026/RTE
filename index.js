/**
 * @format
 */
import * as React from 'react';
import { AppRegistry, Platform, LogBox } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';

LogBox.ignoreLogs([
  'Warning: Encountered two children with the same key, `[object Object]`. Keys should be unique so that components maintain',
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation',
]);
import { PaperProvider } from 'react-native-paper';
import { name as appName } from './app.json';
import App from './App';
import { SamsungHealthBackgroundSync } from './src/services/SamsungHealthBackgroundSync';

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
