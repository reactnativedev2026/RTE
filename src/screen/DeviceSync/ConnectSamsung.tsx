import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View, Platform} from 'react-native';
import moment from 'moment';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {goBack} from '../../services/NavigationService';
import {getTemplateSpecs} from '../../utils/helpers';
import {store} from '../../core/store';
import {
  CustomAlert,
  CustomHorizontalLine,
  CustomModal,
  CustomScreenLoader,
} from '../../components';
import {SamsungHealth} from '../../services/SamsungHealthService';
import {
  useCreateDataSourceMutation,
  useSyncSamsungExerciseDataMutation,
  useSyncSamsungDailyDataMutation,
  useUpdateSamsungHealthLastCronMutation,
  useCheckUatAuthorizationQuery,
  usePushMobileAppUserDataMutation,
} from '../../services/deviceConnect.api';
import {useLazyGetUserPointDetailQuery} from '../../services/Calander.api';
import {useUpdateSyncDevicesMutation} from '../../services/setting.api';
import {deviceName} from '../../utils/dummyData';
import ProfileDatePicker from '../Profile/ProfileDatePicker';
import {SamsungHealthBackgroundSync, SYNC_START_DATE_KEY, SYNC_FREQUENCY_KEY} from '../../services/SamsungHealthBackgroundSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from '../../core/store';

interface ConnectSamsungProps {}

const ConnectSamsung = ({}: ConnectSamsungProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syncStartDate, setSyncStartDate] = useState<Date>(new Date());
  const [syncCompleted, setSyncCompleted] = useState(false);

  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [createDataSource, {isLoading: isCreatingDataSource}] =
    useCreateDataSourceMutation();
  const [updateSyncDevices, {isLoading: isSyncDevicesLoading}] =
    useUpdateSyncDevicesMutation();
  const [syncExerciseData] = useSyncSamsungExerciseDataMutation();
  const [syncDailyData] = useSyncSamsungDailyDataMutation();
  const [updateLastCron] = useUpdateSamsungHealthLastCronMutation();
  const [pushMobileAppUserData] = usePushMobileAppUserDataMutation();
  const [getDataByDate] = useLazyGetUserPointDetailQuery();
  const {data: uatAuthData} = useCheckUatAuthorizationQuery({}, {refetchOnMountOrArgChange: true});

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  // Auto-initialize Samsung Health on component mount
  React.useEffect(() => {
    const initializeSamsungHealth = async () => {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        await SamsungHealth.initialize();
      } catch (error: any) {
        // Silent fail
      }
    };

    initializeSamsungHealth();
  }, []);

  const connectToSamsung = async () => {
    if (Platform.OS !== 'android') {
      CustomAlert({
        type: 'info',
        message: 'Samsung Health is only available on Android devices',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Initialize Samsung Health (in case auto-init failed)
      await SamsungHealth.initialize();

      // Get allowed data types from UAT API response
      let allowedDataTypes: string[] | undefined = undefined;
      if (uatAuthData?.success === true && uatAuthData?.data?.allowed_data_types) {
        allowedDataTypes = uatAuthData.data.allowed_data_types;
      }

      // Step 2: Request permissions - this will show Samsung Health permission dialog
      // STEPS is always requested, EXERCISE is requested if in allowed_data_types
      const granted = await SamsungHealth.requestPermissions(allowedDataTypes);

      if (!granted) {
        CustomAlert({
          type: 'error',
          message: 'Permissions are required to connect Samsung Health. Please grant permissions to continue.',
        });
        setIsLoading(false);
        return;
      }

      // Step 3: Get device unique identifier
      let deviceId = '1'; // Default fallback value
      try {
        deviceId = await SamsungHealth.getDeviceId();
      } catch (deviceIdError) {
        // If device ID retrieval fails, continue with default value
        console.warn('Failed to get device ID, using default value:', deviceIdError);
      }

      // Step 4: Create data source with Samsung Health
      // Use placeholder token values since Samsung Health doesn't use OAuth
      // Use December 31, 2099 as expiry date to indicate token never expires
      // Store device unique identifier in access_token_secret
      const body = {
        data_source_id: deviceName.samsung, // Samsung Health ID from deviceName mapping (7)
        access_token: '1',
        refresh_token: '1',
        token_expires_at: new Date('2099-12-31T23:59:59.999Z'), // December 31, 2099
        access_token_secret: deviceId, // Device unique identifier
      };

      try {
        await createDataSource(body).unwrap();
      } catch (dataSourceError: any) {
        if (dataSourceError?.status !== 422) {
          throw dataSourceError;
        }
      }

      // Step 5: Update sync start date
      try {
        const syncBody = {
          sync_start_date: moment(syncStartDate).format('YYYY-MM-DD'),
          data_source: 'samsung',
        };
        await updateSyncDevices(syncBody).unwrap();
      } catch (syncError: any) {
        const errorMessage = syncError?.data?.message || syncError?.message || 'Failed to update sync start date. Please try again.';
        CustomAlert({
          type: 'error',
          message: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Step 6: Save sync start date to AsyncStorage
      try {
        const startOfDay = new Date(syncStartDate);
        startOfDay.setHours(0, 0, 0, 0);
        await AsyncStorage.setItem(SYNC_START_DATE_KEY, startOfDay.toISOString());
      } catch (error) {
        // Silent error
      }

      // Step 7: Set default sync frequency if not already set (10 minutes = 600 seconds)
      try {
        const existingFrequency = await AsyncStorage.getItem(SYNC_FREQUENCY_KEY);
        if (existingFrequency === null) {
          const defaultFrequencyInSeconds = 10 * 60; // 10 minutes
          await AsyncStorage.setItem(SYNC_FREQUENCY_KEY, defaultFrequencyInSeconds.toString());
        }
      } catch (error) {
        // Silent error
      }

      // Step 8: Initialize background sync service
      if (user?.preferred_event_id) {
        try {
          // Stop any existing sync service to ensure fresh initialization
          SamsungHealthBackgroundSync.stop();

          // Get allowed data types for background sync
          let allowedDataTypes: string[] | undefined = undefined;
          if (uatAuthData?.success === true && uatAuthData?.data?.allowed_data_types) {
            allowedDataTypes = uatAuthData.data.allowed_data_types;
          }

          await SamsungHealthBackgroundSync.initialize(
            {
              eventId: user.preferred_event_id,
              allowedDataTypes: allowedDataTypes,
              onSyncComplete: (success, message) => {
                setSyncCompleted(true);
              },
              onSyncStart: () => {},
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
              return getDataByDate(payload).unwrap();
            },
            async (payload) => {
              return pushMobileAppUserData(payload).unwrap();
            },
          );
        } catch (bgSyncError) {
          // Show error but don't fail the connection
          CustomAlert({
            type: 'warning',
            message: 'Device connected but initial sync failed. Sync will retry automatically.',
          });
        }
      }

      // Step 9: Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = 'Failed to connect Samsung Health';

      if (error?.status === 422) {
        errorMessage = error?.data?.message || 'Device already connected';
      } else if (error?.code === 'PERMISSION_ERROR') {
        errorMessage = error?.message || 'Failed to request Samsung Health permissions. Please make sure Samsung Health is installed and up to date.';
      } else if (error?.code === 'NO_ACTIVITY') {
        errorMessage = 'Unable to show permission dialog. Please try again.';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      CustomAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      {isLoading && <CustomScreenLoader />}
      <Text style={styles.headerText}>{'Connect Samsung Health'}</Text>
      <Text style={styles.descriptionText}>
        {
          'Select the date you would like to synchronize miles from. Please allow 30 minutes for data to sync.'
        }
      </Text>
      <CustomHorizontalLine />
      <View style={styles.tContainer}>
        <View style={styles.rowView}>
          <Text style={styles.headingStyle}>Sync Start Date</Text>
          <ProfileDatePicker
            value={syncStartDate}
            onChangeText={(date) => setSyncStartDate(date)}
            containerStyle={styles.datePickerContainer}
          />
        </View>
        <Pressable
          style={[styles.connectBtn, {backgroundColor: PrimaryColor}]}
          onPress={connectToSamsung}>
          <Text style={styles.connectText}>Connect Samsung Health</Text>
        </Pressable>
      </View>
      <CustomHorizontalLine />
      <CustomModal
        visible={showSuccessModal}
        title={'You\'re connected!'}
        description={
          syncCompleted
            ? 'Successfully connected your Samsung Health to the RTE Tracker. Initial sync completed successfully.'
            : 'Successfully connected your Samsung Health to the RTE Tracker. Initial sync is in progress.'
        }
        descriptionStyle={styles.description}
        showDescription={true}
        hideCancelBtn
        hideConfirmBtn
        onCloseIcon={() => {
          setShowSuccessModal(false);
          goBack();
        }}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  tContainer: {
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(10),
    justifyContent: 'center',
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  descriptionText: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
    marginTop: moderateScale(20),
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  headingStyle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.headerBlack,
    width: '50%',
  },
  datePickerContainer: {
    width: '45%',
    right: moderateScale(15),
    marginTop: moderateScale(10),
  },
  connectBtn: {
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(12),
    marginTop: moderateScale(30),
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: moderateScale(20),
  },
  connectText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  description: {
    fontSize: moderateScale(13),
    color: colors.primaryGrey,
  },
});

export default ConnectSamsung;

