import {useRoute} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CustomAlert, CustomHeader, CustomScreenWrapper} from '../../components';
import {store} from '../../core/store';
import {useDeleteDataSourceMutation} from '../../services/deviceConnect.api';
import {pop} from '../../services/NavigationService';
import {colors} from '../../utils/colors';
import {deviceName} from '../../utils/dummyData';
import {getTemplateSpecs} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';
import {SamsungHealth} from '../../services/SamsungHealthService';
import {SamsungHealthConnection} from '../../services/SamsungHealthConnectionService';
import {
  SYNC_FREQUENCY_KEY,
  SYNC_START_DATE_KEY,
  LAST_SYNC_DATE_KEY,
  SYNCED_TRANSACTION_IDS_KEY,
  SYNCED_STEPS_DATES_KEY,
  ALLOWED_DATA_TYPES_KEY,
  SamsungHealthBackgroundSync,
} from '../../services/SamsungHealthBackgroundSync';
import ProfileDatePicker from '../Profile/ProfileDatePicker';
import {rteDateFormatFullMonth} from '../../utils/dateFormats';

interface DeviceSyncContainerProps {}

const DisconnectScreen = ({}: DeviceSyncContainerProps) => {
  const {params} = useRoute();
  const [preserved, setPreserved] = React.useState(false);

  const isApple = params?.short_name === 'apple' || false;
  const isSamsung = params?.short_name === 'samsung' || false;
  const isOura = params?.short_name === 'ouraring' || false;

  const [deleteDataSource, {isLoading}] = useDeleteDataSourceMutation();

  // Initialize delete date to 1st January of current year
  const getDefaultDeleteDate = () => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1); // January 1st of current year
  };

  const [deleteFromDate, setDeleteFromDate] = React.useState<Date>(
    getDefaultDeleteDate(),
  );

  // Get minimum date (1st January of current year) and maximum date (today)
  const getMinDate = () => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1); // January 1st of current year
  };

  const getMaxDate = () => {
    return new Date(); // Today
  };

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  const disconnect_action = async () => {
    try {
      // Samsung Health specific cleanup
      if (isSamsung && Platform.OS === 'android') {
        try {
          console.log('🧹 Starting Samsung Health cleanup...');

          // Reset background sync service (clears in-memory state)
          await SamsungHealthBackgroundSync.reset();

          // Clear all Samsung Health AsyncStorage keys
          await AsyncStorage.multiRemove([
            SYNC_FREQUENCY_KEY,
            SYNC_START_DATE_KEY,
            LAST_SYNC_DATE_KEY,
            SYNCED_TRANSACTION_IDS_KEY,
            SYNCED_STEPS_DATES_KEY,
            ALLOWED_DATA_TYPES_KEY,
            '@bg_fetch_setup_failed',
          ]);

          // Clear connection status cache
          await SamsungHealthConnection.clearCache();

          // Disconnect from native Samsung Health SDK
          await SamsungHealth.disconnect();

          console.log('✅ Samsung Health cleanup completed successfully');
          console.log('   - Background sync stopped');
          console.log('   - All cached data cleared');
          console.log('   - Connection status cleared');
          console.log('   - Native SDK disconnected');
        } catch (error) {
          console.error('❌ Samsung Health cleanup error:', error);
          // Continue with database deletion even if cleanup fails
        }
      }

      // Prepare disconnect payload
      const disconnectPayload: any = {
        data_source_id: deviceName[params?.short_name],
        synced_mile_action: isApple
          ? 'preserve'
          : preserved
          ? 'preserve'
          : 'delete',
      };

      // Add delete_from date if deleting miles
      if (!isApple && !preserved) {
        disconnectPayload.delete_from = rteDateFormatFullMonth(deleteFromDate);
      }

      console.log(`🔌 Disconnecting ${params?.short_name}:`, disconnectPayload);

      // Delete the data source from the database
      await deleteDataSource(disconnectPayload)
        .unwrap()
        .then(() => {
          console.log(`✅ Successfully disconnected ${params?.short_name}`);
          pop(1);
        })
        .catch(err => {
          console.error(`❌ Disconnect API error for ${params?.short_name}:`, err);
          CustomAlert({type: 'error', message: err?.data?.message || 'Failed to disconnect device'});
        });
    } catch (error: any) {
      console.error(`❌ Disconnect error for ${params?.short_name}:`, error);
      CustomAlert({
        type: 'error',
        message: error?.message || 'Failed to disconnect device',
      });
    }
  };

  return (
    <CustomScreenWrapper removeScroll={true} loadingIndicator={isLoading}>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <View style={{marginHorizontal: moderateScale(20)}}>
          <Text
            style={
              styles.headerText
            }>{`Disconnect ${params?.short_name}`}</Text>
          <Text style={styles.detailText}>
            {isApple
              ? `To disconnect your Apple Watch go to the iOS app, Trackery, on your phone and choose to disconnect.
                \nHave you already disconnected from the Trackery app?`
              : isSamsung
              ? `Disconnecting Samsung Health will remove the connection between your Samsung Health account and the RTE Tracker. You can choose whether you want to keep previously synced miles, or delete all synced entries.`
              : isOura
              ? `Disconnecting Oura Ring will remove the connection between your Oura Ring account and the RTE Tracker. You can choose whether you want to keep previously synced miles, or delete all synced entries.`
              : ` You can choose whether you want to keep previously synced miles, or
            delete all synced entries.`}
          </Text>
          {!isApple && (
            <>
              <View style={styles.preserved_view}>
                <TouchableOpacity
                  onPress={() => setPreserved(true)}
                  style={[
                    styles.preserved_btn,
                    {borderColor: preserved ? PrimaryColor : colors.primaryGrey},
                  ]}>
                  <Text
                    style={[
                      styles.syncedMiles_txt,
                      {color: preserved ? PrimaryColor : colors.primaryGrey},
                    ]}>
                    {'Preserve\nSynced Miles'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPreserved(false)}
                  style={[
                    styles.preserved_btn,
                    {borderColor: !preserved ? PrimaryColor : colors.primaryGrey},
                  ]}>
                  <Text
                    style={[
                      styles.syncedMiles_txt,
                      {color: !preserved ? PrimaryColor : colors.primaryGrey},
                    ]}>
                    {'Delete\nSynced Miles'}
                  </Text>
                </TouchableOpacity>
              </View>
              {!preserved && (
                <View style={styles.datePickerContainer}>
                  <ProfileDatePicker
                    value={deleteFromDate}
                    onChangeText={(date: Date) => setDeleteFromDate(date)}
                    headingText="Delete data from:"
                    minimumDate={getMinDate()}
                    maximumDate={getMaxDate()}
                    containerStyle={[
                      styles.datePickerStyle,
                      {borderColor: PrimaryColor},
                    ]}
                    calendarStyle={{fill: PrimaryColor}}
                  />
                </View>
              )}
            </>
          )}
        </View>
        <TouchableOpacity
          style={[styles.connectBtn, {backgroundColor: PrimaryColor}]}
          onPress={disconnect_action}>
          <Text style={styles.connectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(30),
    marginBottom: moderateScale(20),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
    textTransform: 'capitalize',
  },
  detailText: {
    marginTop: moderateScale(20),
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
  },
  preserved_view: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(15),
    marginTop: moderateScale(20),
  },
  preserved_btn: {
    borderWidth: 2,
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
  },
  syncedMiles_txt: {textAlign: 'center', fontWeight: '600'},
  connectBtn: {
    marginTop: moderateScale(20),
    alignSelf: 'center',
    width: moderateScale(105),
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(9),
  },
  connectText: {
    fontWeight: '700',
    textAlign: 'center',
    color: colors.white,
    fontSize: moderateScale(14),
  },
  datePickerContainer: {
    marginTop: moderateScale(20),
  },
  datePickerStyle: {
    marginHorizontal: 0,
  },
});

export default DisconnectScreen;
