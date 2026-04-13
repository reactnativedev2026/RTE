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
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import ProfileDatePicker from '../Profile/ProfileDatePicker';

interface ConnectStarvaProps {}

const ConnectStarva = ({}: ConnectStarvaProps) => {
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

  const hitCreateDatasourceAPI = async () => {
    const currentTime = new Date();
    const secToHours = new Date(
      currentTime.getTime() + params?.token_expires_at * 1000,
    );
    const body = {
      data_source_id: 4,
      access_token: params?.access_token,
      access_token_secret: params?.access_token_secret,
      token_expires_at: secToHours,
      refresh_token: params?.refresh_token,
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
  };

  const connectToStrava = async () => {
    try {
      await hitCreateDatasourceAPI().then(async () => {
        const body = {
          sync_start_date: moment(formValues?.date).format('YYYY-MM-DD'),
          data_source: 'strava',
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
    <View style={{flex: 1}}>
      {(isLoading || isSyncDevicesLoading) && <CustomScreenLoader />}

      <Text style={styles.headerText}>{'Connect Strava'}</Text>
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
          onPress={connectToStrava}
          style={[
            styles.connectBtn,
            {
              backgroundColor: getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              ).btnPrimaryColor,
            },
          ]}>
          <Text style={styles.connectText}>Connect Strava</Text>
        </Pressable>
      </View>
      <CustomHorizontalLine />
      <CustomModal
        visible={formValues?.visible}
        title={'You’re connected!'}
        description={
          'Successfully connected your Strava account to the RTE Tracker. It may take up to 30 min to sync data. By default, we will include your daily steps.'
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
    </View>
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
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(30),
    marginTop: moderateScale(30),
    alignSelf: 'center',
  },
  connectText: {
    fontSize: moderateScale(14),
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {fontSize: moderateScale(13), color: colors.primaryGrey},
});

export default ConnectStarva;
