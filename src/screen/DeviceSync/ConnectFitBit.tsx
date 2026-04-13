import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CustomAlert,
  CustomHorizontalLine,
  CustomModal,
  CustomScreenLoader,
} from '../../components';
import { store } from '../../core/store';
import { useCreateDataSourceMutation } from '../../services/deviceConnect.api';
import { useUpdateSyncDevicesMutation } from '../../services/setting.api';
import { colors } from '../../utils/colors';
import { deviceName } from '../../utils/dummyData';
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import ProfileDatePicker from '../Profile/ProfileDatePicker';

interface ConnectFitBitProps {}

const ConnectFitBit = ({}: ConnectFitBitProps) => {
  //Hook
  const route = useRoute();
  const {goBack} = useNavigation();
  const timezone = store.getState().loginReducer.user?.time_zone_name;

  // Params
  const params = route?.params;
  // States
  const [formValues, setFormValues] = React.useState({
    rte: false,
    visible: false,
    date: new Date(),
  });
  //RTK-Query
  const [createDataSource, {isLoading}] = useCreateDataSourceMutation();
  const [updateSyncDevices, {isLoading: isSyncDevicesLoading}] =
    useUpdateSyncDevicesMutation();

  // React.useEffect(() => {
  //   hitCreateDatasourceAPI();
  // }, [params]);

  const hitCreateDatasourceAPI = async () => {
    const currentTime = new Date();
    const secToHours = new Date(
      currentTime.getTime() + params?.token_expires_at * 1000,
    );
    const body = {
      data_source_id: deviceName[params?.short_name] || 2,
      access_token: params?.access_token,
      refresh_token: params?.refresh_token,
      token_expires_at: secToHours,
      access_token_secret: params?.access_token_secret,
    };

    try {
      await createDataSource(body).unwrap();
    } catch (error) {
      CustomAlert({
        type: 'error',
        message: error?.data?.message,
      });
      if (error?.status === 422) {
        throw new Error('Device Connected');
      }
    }
    // await createDataSource(body)
    //   .unwrap()
    //   .then(res => {
    //     // CustomAlert({type: 'success', message: res?.message});
    //   })
    //   .catch(err => {
    //     CustomAlert({type: 'error', message: err?.data?.message});
    //   });
  };

  const connectToFitbit = async () => {
    try {
      await hitCreateDatasourceAPI().then(async () => {
        const body = {
          // sync_start_date: rteDateFormatFullMonth(formValues?.date, timezone),
          sync_start_date: moment(formValues?.date).format('YYYY-MM-DD'),
          data_source: 'fitbit',
        };
        await updateSyncDevices(body)
          .unwrap()
          .then(res => {
            setFormValues({...formValues, visible: true});
          })
          .catch(err => {
            console.log('err', err);
            CustomAlert({
              type: 'error',
              message: err?.data?.message,
              title: 'Device Connected',
            });
          });
      });
    } catch (error) {
      console.log('🚀 ~NEED ERROR HERE ', error);
    }
  };

  return (
    <React.Fragment>
      {(isLoading || isSyncDevicesLoading) && <CustomScreenLoader />}
      <Text style={styles.headerText}>{'Connect FitBit'}</Text>
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
            value={formValues?.date}
            // value={rteDateFormatFullMonth(formValues?.date, timezone)}
            // noMaximumDate
            onChangeText={text => {
              setFormValues(prevFormValues => ({
                ...prevFormValues,
                date: text,
              }));
            }}
            containerStyle={styles.datePickerContainer}
          />
        </View>
        <Pressable
          onPress={connectToFitbit}
          style={[
            styles.connectBtn,
            {
              backgroundColor: getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              ).btnPrimaryColor,
            },
          ]}>
          <Text style={styles.connectText}>Sync FitBit</Text>
        </Pressable>
      </View>
      <CustomHorizontalLine />
      <CustomModal
        visible={formValues?.visible}
        title={'You’re connected!'}
        description={
          'Successfully connected your Fitbit account to the RTE Tracker. It may take up to 30 min to sync data. By default, we will include your daily steps.'
        }
        descriptionStyle={styles.description}
        showDescription={true}
        hideCancelBtn
        hideConfirmBtn
        onCloseIcon={() => {
          setFormValues({...formValues, visible: false});
          goBack();
        }}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  tContainer: {
    justifyContent: 'center',
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(10),
  },
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(10),
  },

  descriptionText: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(20),
    lineHeight: moderateScale(20),
  },
  rowView: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headingStyle: {
    width: '50%',
    fontSize: 14,
    fontWeight: '700',
    color: colors.headerBlack,
  },
  datePickerContainer: {
    width: '45%',
    right: moderateScale(15),
    marginTop: moderateScale(10),
  },
  connectBtn: {
    alignSelf: 'center',
    marginTop: moderateScale(30),
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  },
  connectText: {
    fontWeight: '700',
    textAlign: 'center',
    color: colors.white,
    fontSize: moderateScale(14),
  },
  description: {fontSize: moderateScale(13), color: colors.primaryGrey},
});

export default ConnectFitBit;
