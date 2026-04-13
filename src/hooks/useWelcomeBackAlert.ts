import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState, store} from '../core/store';
import {deviceConnectApi} from '../services/deviceConnect.api';
import {openLink} from '../utils/helpers';
import CustomAlert from '../components/CustomAlert';

export interface WelcomeBackAlertState {
  showAlert: boolean;
  title: string;
  message: string;
  isReconnecting: boolean;
  preserveData: boolean;
  deviceName: string | null;
}

/**
 * Hook to show welcome back alert on app launch and when app comes to foreground
 * Shows alert only when ALL conditions are met:
 * - User is logged in
 * - User is connected with Garmin device
 * - Garmin refresh token value is not null and has "1" in value
 * - UAT API returns show_notification: true
 * - Uses title and message from API response
 */
export const useWelcomeBackAlert = () => {
  const [state, setState] = useState<WelcomeBackAlertState>({
    showAlert: false,
    title: 'Welcome back',
    message: 'Welcome back',
    isReconnecting: false,
    preserveData: false,
    deviceName: null,
  });
  const appState = useRef(AppState.currentState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const {token, user} = useSelector((state: RootState) => state.loginReducer);

  const checkConditions = async (): Promise<{
    shouldShow: boolean;
    title?: string;
    message?: string;
    preserveData?: boolean;
    deviceName?: string | null;
  }> => {
    try {
      // Condition 1: Check if user is logged in
      if (!token || !user) {
        console.log('[WelcomeBackAlert] User not logged in');
        return {shouldShow: false};
      }

      // Condition 2 & 3: Check Garmin device connection and refresh token
      const deviceSyncResult = await store.dispatch(
        deviceConnectApi.endpoints.getDeviceSync.initiate(
          {},
          {forceRefetch: true},
        ),
      );

      // Handle RTK Query initiate response structure
      let devices: any[] | null = null;

      if ('data' in deviceSyncResult && deviceSyncResult.data) {
        // RTK Query initiate returns {data: {...}} structure
        if (deviceSyncResult.data?.data && Array.isArray(deviceSyncResult.data.data)) {
          devices = deviceSyncResult.data.data;
        } else if (Array.isArray(deviceSyncResult.data)) {
          // Sometimes data might be directly an array
          devices = deviceSyncResult.data;
        }
      } else if ('error' in deviceSyncResult) {
        console.error('[WelcomeBackAlert] Device sync API error:', deviceSyncResult.error);
        return {shouldShow: false};
      }

      if (!devices || devices.length === 0) {
        console.log('[WelcomeBackAlert] No device data available');
        return {shouldShow: false};
      }

      console.log('[WelcomeBackAlert] Found devices:', devices.map((d: any) => ({
        short_name: d.short_name,
        hasSourceProfile: !!d.source_profile,
      })));

      const garminDevice = devices.find(
        (d: any) => d.short_name === 'garmin',
      );

      if (!garminDevice) {
        console.log('[WelcomeBackAlert] Garmin device not found in device list');
        return {shouldShow: false};
      }

      // Check if Garmin device is connected (has source_profile)
      if (!garminDevice?.source_profile) {
        console.log('[WelcomeBackAlert] Garmin device not connected (no source_profile)');
        return {shouldShow: false};
      }

      console.log('[WelcomeBackAlert] Garmin source_profile:', {
        hasRefreshToken: !!garminDevice.source_profile?.refresh_token,
        refreshTokenType: typeof garminDevice.source_profile?.refresh_token,
      });

      // Check if refresh_token exists and contains "1"
      const refreshToken = garminDevice.source_profile?.refresh_token;

      if (!refreshToken || typeof refreshToken !== 'string') {
        console.log('[WelcomeBackAlert] Garmin refresh token is null or invalid');
        return {shouldShow: false};
      }

      if (!refreshToken.includes('1')) {
        console.log('[WelcomeBackAlert] Garmin refresh token does not contain "1"');
        return {shouldShow: false};
      }

      // Condition 4: Check UAT authorization API for alert configuration
      const uatResult = await store.dispatch(
        deviceConnectApi.endpoints.checkUatAuthorization.initiate(
          {},
          {forceRefetch: true},
        ),
      );

      // Log the result structure for debugging
      console.log('[WelcomeBackAlert] UAT API result:', {
        hasData: 'data' in uatResult,
        hasError: 'error' in uatResult,
      });

      if ('error' in uatResult) {
        console.error('[WelcomeBackAlert] UAT API error:', uatResult.error);
        return {shouldShow: false};
      }

      if ('data' in uatResult && uatResult.data) {
        const uatData = uatResult.data;

        console.log('[WelcomeBackAlert] UAT API data structure:', {
          success: uatData?.success,
          hasData: !!uatData?.data,
          show_notification: uatData?.data?.show_notification,
          fullData: JSON.stringify(uatData, null, 2),
        });

        // Check if show_notification is true
        if (uatData?.success === true && uatData?.data?.show_notification === true) {
          const alertData = uatData.data.alert;
          const title = alertData?.title || 'Welcome back';
          const message = alertData?.message || '';

          // Get preserve_data from API (used for disconnect action)
          const preserveData = uatData.data?.preserve_data === true;

          // Get device name from the garminDevice we already found
          const deviceName = garminDevice?.name || null;

          console.log('[WelcomeBackAlert] All conditions met, showing alert:', {
            title,
            message,
            preserveData,
            deviceName,
          });

          return {
            shouldShow: true,
            title,
            message,
            preserveData,
            deviceName: deviceName,
          };
        } else {
          console.log('[WelcomeBackAlert] show_notification check failed:', {
            success: uatData?.success,
            show_notification: uatData?.data?.show_notification,
            show_notificationType: typeof uatData?.data?.show_notification,
          });
          return {shouldShow: false};
        }
      }

      console.log('[WelcomeBackAlert] No UAT data available');
      return {shouldShow: false};
    } catch (error) {
      console.error('[WelcomeBackAlert] Error checking conditions:', error);
      return {shouldShow: false};
    }
  };

  const showAlertWithDelay = async () => {
    try {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      console.log('[WelcomeBackAlert] Checking conditions to show alert...');

      // Check conditions before showing alert
      const {
        shouldShow,
        title,
        message,
        preserveData,
        deviceName,
      } = await checkConditions();

      console.log('[WelcomeBackAlert] Conditions check result:', {
        shouldShow,
        hasTitle: !!title,
        hasMessage: !!message,
      });

      if (!shouldShow) {
        console.log('[WelcomeBackAlert] Conditions not met, not showing alert');
        return null;
      }

      // Show alert with a small delay to ensure screen is fully loaded
      // (similar to Samsung Health permission check)
      const timer = setTimeout(() => {
        console.log('[WelcomeBackAlert] Setting alert state to visible');
        setState(prev => ({
          ...prev,
          showAlert: true,
          title: title || 'Welcome back',
          message: message || '',
          isReconnecting: false,
          preserveData: preserveData || false,
          deviceName: deviceName || null,
        }));
      }, 1000);
      timerRef.current = timer;
      return timer;
    } catch (error) {
      console.error('[WelcomeBackAlert] Error in showAlertWithDelay:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('[WelcomeBackAlert] useEffect triggered', {
      hasToken: !!token,
      hasUser: !!user,
    });

    // Only check if user is logged in
    if (!token || !user) {
      console.log('[WelcomeBackAlert] User not logged in, skipping alert check');
      return;
    }

    // Show alert on initial app launch
    showAlertWithDelay();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        console.log('[WelcomeBackAlert] App state changed:', {
          current: appState.current,
          next: nextAppState,
        });
        // Check if app is transitioning from background/inactive to active
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App has come to foreground, check conditions and show alert
          console.log('[WelcomeBackAlert] App came to foreground, checking conditions');
          showAlertWithDelay();
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      subscription.remove();
    };
  }, [token, user]);

  const dismissAlert = () => {
    setState(prev => ({...prev, showAlert: false}));
  };

  const handleReconnectDevice = async () => {
    try {
      // Set loading state - keep alert visible
      setState(prev => ({...prev, isReconnecting: true}));

      // Step 1: Get device list to find Garmin device and its data_source_id
      const deviceSyncResult = await store.dispatch(
        deviceConnectApi.endpoints.getDeviceSync.initiate(
          {},
          {forceRefetch: true},
        ),
      );

      let devices: any[] | null = null;

      if ('data' in deviceSyncResult && deviceSyncResult.data) {
        if (deviceSyncResult.data?.data && Array.isArray(deviceSyncResult.data.data)) {
          devices = deviceSyncResult.data.data;
        } else if (Array.isArray(deviceSyncResult.data)) {
          devices = deviceSyncResult.data;
        }
      } else if ('error' in deviceSyncResult) {
        console.error('[WelcomeBackAlert] Device sync API error:', deviceSyncResult.error);
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Unable to get device information. Please try again.',
        });
        return;
      }

      if (!devices || devices.length === 0) {
        console.error('[WelcomeBackAlert] Device list not available');
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Unable to get device information. Please try connecting from Settings.',
        });
        return;
      }

      const garminDevice = devices.find(
        (d: any) => d.short_name === 'garmin',
      );

      if (!garminDevice) {
        console.error('[WelcomeBackAlert] Garmin device not found');
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Garmin device not found. Please try connecting from Settings.',
        });
        return;
      }

      // Get data_source_id from source_profile
      const dataSourceId = garminDevice.source_profile?.data_source_id || garminDevice.source_profile?.id;

      if (!dataSourceId) {
        console.error('[WelcomeBackAlert] Garmin data_source_id not found in source_profile');
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Unable to get Garmin device ID. Please try connecting from Settings.',
        });
        return;
      }

      console.log('[WelcomeBackAlert] Found Garmin data_source_id:', dataSourceId);

      // Step 2: Disconnect Garmin device using data_source_id from API
      // Use preserve_data from API to determine synced_mile_action
      const syncedMileAction = state.preserveData ? 'preserve' : 'delete';

      const deleteResult = await store.dispatch(
        deviceConnectApi.endpoints.deleteDataSource.initiate({
          data_source_id: dataSourceId,
          synced_mile_action: syncedMileAction,
        }),
      );

      if ('error' in deleteResult) {
        console.error('[WelcomeBackAlert] Failed to disconnect Garmin:', deleteResult.error);
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Failed to disconnect Garmin device. Please try again.',
        });
        return;
      }

      console.log('[WelcomeBackAlert] Garmin device disconnected successfully');

      // Step 3: Get updated device list to find Garmin OAuth URL
      const updatedDeviceSyncResult = await store.dispatch(
        deviceConnectApi.endpoints.getDeviceSync.initiate(
          {},
          {forceRefetch: true},
        ),
      );

      let updatedDevices: any[] | null = null;

      if ('data' in updatedDeviceSyncResult && updatedDeviceSyncResult.data) {
        if (updatedDeviceSyncResult.data?.data && Array.isArray(updatedDeviceSyncResult.data.data)) {
          updatedDevices = updatedDeviceSyncResult.data.data;
        } else if (Array.isArray(updatedDeviceSyncResult.data)) {
          updatedDevices = updatedDeviceSyncResult.data;
        }
      }

      if (updatedDevices && updatedDevices.length > 0) {
        const updatedGarminDevice = updatedDevices.find(
          (d: any) => d.short_name === 'garmin',
        );

        if (updatedGarminDevice?.oauth_url) {
          // Step 4: Open Garmin OAuth URL to trigger reconnection
          console.log('[WelcomeBackAlert] Opening Garmin OAuth URL');
          // Reset loading state and dismiss alert before opening OAuth URL
          setState(prev => ({...prev, isReconnecting: false, showAlert: false}));
          openLink(updatedGarminDevice.oauth_url);
        } else {
          console.error('[WelcomeBackAlert] Garmin OAuth URL not found');
          setState(prev => ({...prev, isReconnecting: false}));
          CustomAlert({
            type: 'error',
            message: 'Garmin connection URL not available. Please try connecting from Settings.',
          });
        }
      } else {
        console.error('[WelcomeBackAlert] Updated device list not available');
        setState(prev => ({...prev, isReconnecting: false}));
        CustomAlert({
          type: 'error',
          message: 'Unable to get device information. Please try connecting from Settings.',
        });
      }
    } catch (error) {
      console.error('[WelcomeBackAlert] Error reconnecting Garmin:', error);
      setState(prev => ({...prev, isReconnecting: false}));
      CustomAlert({
        type: 'error',
        message: 'An error occurred while reconnecting Garmin. Please try again.',
      });
    }
  };

  return {
    showAlert: state.showAlert,
    title: state.title,
    message: state.message,
    isReconnecting: state.isReconnecting,
    deviceName: state.deviceName,
    dismissAlert,
    handleReconnectDevice,
  };
};
