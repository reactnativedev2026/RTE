import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {goBack} from '../../services/NavigationService';
import {getTemplateSpecs} from '../../utils/helpers';
import {store} from '../../core/store';
import {useRoute} from '@react-navigation/native';
import {
  CustomAlert,
  CustomHorizontalLine,
  CustomModal,
  CustomScreenLoader,
} from '../../components';
import {useCreateDataSourceMutation} from '../../services/deviceConnect.api';
import {useUpdateSyncDevicesMutation} from '../../services/setting.api';
import {deviceName} from '../../utils/dummyData';
import ProfileDatePicker from '../Profile/ProfileDatePicker';

interface ConnectOuraProps {}

const ConnectOura = ({}: ConnectOuraProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syncStartDate, setSyncStartDate] = useState<Date>(new Date());

  const route = useRoute();
  const params = route?.params;

  const [createDataSource, {isLoading: isCreatingDataSource}] =
    useCreateDataSourceMutation();
  const [updateSyncDevices, {isLoading: isSyncDevicesLoading}] =
    useUpdateSyncDevicesMutation();

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  const connectToOura = async () => {
    setIsLoading(true);

    try {
      // Step 1: Calculate token expiration time
      const currentTime = new Date();
      const secToHours = new Date(
        currentTime.getTime() + params?.token_expires_at * 1000,
      );

      // Step 2: Create data source with Oura Ring
      const body = {
        data_source_id: deviceName[params?.short_name] || 6, // Oura Ring ID
        access_token: params?.access_token,
        refresh_token: params?.refresh_token,
        token_expires_at: secToHours,
        access_token_secret: params?.access_token_secret,
      };

      try {
        await createDataSource(body).unwrap();
      } catch (dataSourceError: any) {
        // If device is already connected (422), continue to update sync date
        if (dataSourceError?.status !== 422) {
          throw dataSourceError;
        }
        console.log('Device already connected, updating sync start date...');
      }

      // Step 3: Update sync start date
      try {
        const syncBody = {
          sync_start_date: moment(syncStartDate).format('YYYY-MM-DD'),
          data_source: 'ouraring',
        };
        console.log('Updating sync start date with body:', syncBody);
        await updateSyncDevices(syncBody).unwrap();
        console.log('Sync start date updated successfully');
      } catch (syncError: any) {
        console.error('Error updating sync start date:', JSON.stringify(syncError, null, 2));
        const errorMessage = syncError?.data?.message || syncError?.message || 'Failed to update sync start date. Please try again.';
        CustomAlert({
          type: 'error',
          message: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Step 4: Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Oura Ring connection error:', JSON.stringify(error, null, 2));

      let errorMessage = 'Failed to connect Oura Ring';

      if (error?.status === 422) {
        errorMessage = error?.data?.message || 'Device already connected';
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
      <Text style={styles.headerText}>{'Connect Oura Ring'}</Text>
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
          onPress={connectToOura}>
          <Text style={styles.connectText}>Connect Oura Ring</Text>
        </Pressable>
      </View>
      <CustomHorizontalLine />
      <CustomModal
        visible={showSuccessModal}
        title={'You\'re connected!'}
        description={
          'Successfully connected your Oura Ring to the RTE Tracker. It may take up to 30 min to sync data.'
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

export default ConnectOura;
