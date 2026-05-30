import messaging from '@react-native-firebase/messaging';
import React, {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {CustomAlert, CustomScreenWrapper} from '../../components';
import {store} from '../../core/store';
import {useUserSetting} from '../../hooks';
import {deviceTokenApi} from '../../services/deviceToken.api';
import {
  useLazyGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../../services/notifications.api';
import {settingTypes} from '../Setting/helper';
import NotificationsForm from './NotificationsForm';

interface NotificationsContainerProps {}

const ALL_PUSH_API_KEYS = ['monthly_completed_push'];

const defaultEmailToggles = {
  bibs: false,
  follow_requests: false,
  team_bibs: false,
  team_follow_requests: false,
  team_updates: false,
};

const defaultPushToggles = {
  monthly_goal: false,
};

const NotificationsContainer = ({}: NotificationsContainerProps) => {
  // ── Email notification toggles (useUserSetting) ───────────────────────────
  const [toggles, setToggles] = React.useState(defaultEmailToggles);
  const [loadingToggles, setLoadingToggles] = React.useState(defaultEmailToggles);

  const updateNotificationCallback = (values: any) => {
    setToggles(prevState => ({...prevState, [values.key]: values?.value}));
  };
  const finalNotificationCallback = (values: any) => {
    setLoadingToggles(prevState => ({...prevState, [values?.key]: false}));
  };

  const {isFetching, settingData, handleUpdateNotifications, getUserSettingsCall} =
    useUserSetting({
      type: settingTypes.NOTIFICATION,
      updateCallback: updateNotificationCallback,
      finalCallback: finalNotificationCallback,
    });

  useEffect(() => {
    if (Array.isArray(settingData?.data?.notifications)) {
      const togglesObject = settingData?.data?.notifications?.reduce(
        (acc: any, item: any) => {
          acc[item.name] = item.notification_enabled;
          return acc;
        },
        {},
      );
      setToggles(togglesObject);
    }
  }, [settingData?.data?.notifications]);

  const updateNotifications = (values: any) => {
    setLoadingToggles(prevState => ({...prevState, [values.key]: true}));
    handleUpdateNotifications(values);
  };

  // ── Monthly goal push toggles (notifications.api) ─────────────────────────
  const [pushToggles, setPushToggles] = React.useState(defaultPushToggles);
  const [loadingPushToggles, setLoadingPushToggles] = React.useState<
    Partial<typeof defaultPushToggles>
  >({});

  const pushTogglesRef = useRef(pushToggles);
  useEffect(() => {
    pushTogglesRef.current = pushToggles;
  }, [pushToggles]);

  const [fetchPreferences, {isFetching: isPushFetching}] =
    useLazyGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  const loadPreferences = () => {
    fetchPreferences(undefined)
      .unwrap()
      .then(res => {
        const prefs = res?.data?.notification_preferences ?? {};
        const anyEnabled = ALL_PUSH_API_KEYS.some(k => (prefs as any)[k]);
        setPushToggles({monthly_goal: anyEnabled});
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  const handlePushToggle = (uiKey: string, value: boolean) => {
    setPushToggles({monthly_goal: value});
    setLoadingPushToggles(prev => ({...prev, [uiKey]: true}));

    const preferences = ALL_PUSH_API_KEYS.reduce<Record<string, boolean>>(
      (acc, apiKey) => {
        acc[apiKey] = value;
        return acc;
      },
      {},
    );

    updatePreferences({preferences})
      .unwrap()
      .catch(err => {
        setPushToggles({...pushTogglesRef.current});
        CustomAlert({type: 'error', message: err?.data?.message});
      })
      .finally(() => {
        setLoadingPushToggles(prev => ({...prev, [uiKey]: false}));
      });
  };

  // ── Device token sync ─────────────────────────────────────────────────────
  const syncDeviceToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (!fcmToken) {
        return;
      }
      const devicePayload = {
        token: fcmToken,
        platform: Platform.OS,
        device_name: await DeviceInfo.getDeviceName(),
        device_id: await DeviceInfo.getUniqueId(),
        status: true,
      };
      await store
        .dispatch(
          deviceTokenApi.endpoints.saveDeviceToken.initiate(devicePayload),
        )
        .unwrap();
    } catch (err) {
      console.log('syncDeviceToken error:', err?.data?.message || err);
    }
  };

  useEffect(() => {
    loadPreferences();
    syncDeviceToken();
  }, []);

  return (
    <CustomScreenWrapper onRefresh={() => {getUserSettingsCall(); loadPreferences();}}>
      <NotificationsForm
        toggles={toggles}
        onToggle={(values: any) => updateNotifications(values)}
        isLoading={isFetching}
        loadingToggle={loadingToggles}
        pushToggles={pushToggles}
        onPushToggle={handlePushToggle}
        isPushLoading={isPushFetching}
        loadingPushToggle={loadingPushToggles}
      />
    </CustomScreenWrapper>
  );
};

export default NotificationsContainer;
