import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  ConnectDevice,
  DeviceSyncContainer,
  GoalsContainer,
  ImportContainer,
  PasswordContainer,
  ProfileContainer,
  SettingContainer,
  TrackerAttitudeContainer,
  TutorialsContainer,
} from '../screen';
import ManualEntryContainer from '../screen/ManualEntry/ManualEntryContainer';
import NotificationsContainer from '../screen/Notifications/NotificationsContainer';
import PrivacyContainer from '../screen/Privacy/PrivacyContainer';
import {Routes} from '../utils/Routes';
import {screenOptions} from './styles';
import {templateName} from '../utils/helpers';
import {RootState} from '../core/store';
import {useSelector} from 'react-redux';
import DisconnectScreen from '../screen/DeviceSync/DisconnectScreen';
import SamsungHealthSettings from '../screen/DeviceSync/SamsungHealthSettings';
import SamsungHealthDebug from '../screen/DeviceSync/SamsungHealthDebug';
import OuraRingSettings from '../screen/DeviceSync/OuraRingSettings';

const Stack = createNativeStackNavigator();
const SettingStack = () => {
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);

  return (
    <Stack.Navigator
      initialRouteName={Routes.SETTING}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={Routes.SETTING}
        component={SettingContainer}
        initialParams={{id: null}}
      />
      <Stack.Screen name={Routes.PROFILE} component={ProfileContainer} />
      <Stack.Screen name={Routes.PASSWORD} component={PasswordContainer} />
      <Stack.Screen name={Routes.DEVICE_SYNC} component={DeviceSyncContainer} />
      <Stack.Screen name={Routes.CONNECT_DEVICE} component={ConnectDevice} />
      <Stack.Screen
        name={Routes.DISCONNECT_DEVICE}
        component={DisconnectScreen}
      />
      <Stack.Screen
        name={Routes.SAMSUNG_HEALTH_SETTINGS}
        component={SamsungHealthSettings}
      />
      <Stack.Screen
        name={Routes.SAMSUNG_HEALTH_DEBUG}
        component={SamsungHealthDebug}
      />
      <Stack.Screen
        name={Routes.OURA_RING_SETTINGS}
        component={OuraRingSettings}
      />
      <Stack.Screen
        name={Routes.NOTIFICATIONS}
        component={NotificationsContainer}
      />
      <Stack.Screen
        name={Routes.MANUAL_ENTRY}
        component={ManualEntryContainer}
      />
      <Stack.Screen name={Routes.PRIVACY} component={PrivacyContainer} />
      <Stack.Screen name={Routes.IMPORT} component={ImportContainer} />
      {eventDetail?.template !== templateName.HEROS_JOURNEY && (
        <Stack.Screen name={Routes.GOALS} component={GoalsContainer} />
      )}
      <Stack.Screen
        name={Routes.TRACKER_ATTITUDE}
        component={TrackerAttitudeContainer}
      />
      <Stack.Screen name={Routes.TUTORIAL} component={TutorialsContainer} />
    </Stack.Navigator>
  );
};

export default SettingStack;
