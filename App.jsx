import React from 'react';
import {LogBox, SafeAreaView, StyleSheet} from 'react-native';
import {AutocompleteDropdownContextProvider} from 'react-native-autocomplete-dropdown';
import 'react-native-devsettings/withAsyncStorage';
import {enableScreens} from 'react-native-screens';
import Toast from 'react-native-toast-message';
import {Provider as StoreProvider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {ToastConfig} from './src/components';
import {store} from './src/core/store';
import {Navigation} from './src/navigation';
import {useSamsungHealthBackgroundSync} from './src/hooks/useSamsungHealthBackgroundSync';
import {useMobileAppDebugSync} from './src/hooks/useMobileAppDebugSync';
import {useWelcomeBackAlert} from './src/hooks/useWelcomeBackAlert';
import {WelcomeBackAlert} from './src/components/WelcomeBackAlert';
import NotificationHandler from './NotificationHandler';

enableScreens(true);
let persistor = persistStore(store);
LogBox.ignoreAllLogs();

const BackgroundSyncInitializer = () => {
  useSamsungHealthBackgroundSync();
  useMobileAppDebugSync();
  return null;
};

const WelcomeBackAlertInitializer = () => {
  const {
    showAlert,
    title,
    message,
    isReconnecting,
    deviceName,
    dismissAlert,
    handleReconnectDevice,
  } = useWelcomeBackAlert();
  return (
    <WelcomeBackAlert
      visible={showAlert}
      title={title}
      message={message}
      isReconnecting={isReconnecting}
      deviceName={deviceName}
      onDismiss={dismissAlert}
      onReconnect={handleReconnectDevice}
    />
  );
};

const App = () => {
  return (
    <SafeAreaView style={styles.flex}>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AutocompleteDropdownContextProvider>
            <BackgroundSyncInitializer />
            <WelcomeBackAlertInitializer />
            <Navigation />
              <NotificationHandler /> 
          </AutocompleteDropdownContextProvider>
        </PersistGate>
      </StoreProvider>
      <Toast config={ToastConfig} />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
