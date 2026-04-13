import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../core/store';
import { SamsungHealthBackgroundSync } from '../services/SamsungHealthBackgroundSync';
import {
  useSyncSamsungExerciseDataMutation,
  useSyncSamsungDailyDataMutation,
  useUpdateSamsungHealthLastCronMutation,
  useCheckUatAuthorizationQuery,
  usePushMobileAppUserDataMutation,
} from '../services/deviceConnect.api';
import { useLazyGetUserPointDetailQuery } from '../services/Calander.api';
import { Platform } from 'react-native';

/**
 * Hook to initialize Samsung Health background sync on app start
 * This ensures the background sync service continues running even after app restart
 */
export const useSamsungHealthBackgroundSync = () => {
  const { user } = useSelector((state: RootState) => state.loginReducer);
  const [syncExerciseData] = useSyncSamsungExerciseDataMutation();
  const [syncDailyData] = useSyncSamsungDailyDataMutation();
  const [updateLastCron] = useUpdateSamsungHealthLastCronMutation();
  const [pushMobileAppUserData] = usePushMobileAppUserDataMutation();
  const [getDataByDate] = useLazyGetUserPointDetailQuery();
  const { data: uatAuthData } = useCheckUatAuthorizationQuery(
    {},
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    // Only initialize on Android
    if (Platform.OS !== 'android') {
      return;
    }

    if (!user?.preferred_event_id) {
      return;
    }

    const initializeBackgroundSync = async () => {
      try {
        // Get allowed data types from UAT API response
        let allowedDataTypes: string[] | undefined = undefined;
        if (uatAuthData?.success === true && uatAuthData?.data?.allowed_data_types) {
          allowedDataTypes = uatAuthData.data.allowed_data_types;
        }

        // Get resync data from UAT API response
        let resyncSamsungFrom: string | undefined = undefined;
        let resyncSamsungSyncId: string | undefined = undefined;
        if (uatAuthData?.success === true && uatAuthData?.data) {
          resyncSamsungFrom = uatAuthData.data.resync_samsung_from;
          resyncSamsungSyncId = uatAuthData.data.resync_samsung_sync_id;
        }

        await SamsungHealthBackgroundSync.initialize(
          {
            eventId: user.preferred_event_id,
            allowedDataTypes: allowedDataTypes,
            resyncSamsungFrom: resyncSamsungFrom,
            resyncSamsungSyncId: resyncSamsungSyncId,
            onSyncComplete: (success, message) => { },
            onSyncStart: () => { },
          },
          async (payload) => {
            return syncExerciseData(payload).unwrap();
          },
          async (payload) => {
            return syncDailyData(payload).unwrap();
          },
          async (payload) => {
            return updateLastCron(payload).unwrap();
          },
          async (payload) => {
            console.log(payload, 'this is payload')
            return getDataByDate(payload).unwrap();
          },
        );
      } catch (error) {
        // Silent error
      }
    };

    initializeBackgroundSync();

    // Cleanup on unmount
    return () => {
      // Don't stop the service on unmount - it should continue running
      // SamsungHealthBackgroundSync.stop();
    };
  }, [user?.preferred_event_id, uatAuthData]);
};
