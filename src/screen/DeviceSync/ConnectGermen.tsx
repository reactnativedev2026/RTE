import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomHorizontalLine,
  CustomModal,
  CustomScreenLoader,
  CustomToggleSwitch,
} from '../../components';
import { RootState, store } from '../../core/store';
import {
  useCreateDataSourceMutation,
  useUpdateUserEventDailyStepsMutation,
} from '../../services/deviceConnect.api';
import { useLazyGetEventListingQuery } from '../../services/profile.api';
import { useUpdateSyncDevicesMutation } from '../../services/setting.api';
import { colors } from '../../utils/colors';
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import { setEventList } from '../AuthScreen/login/login.slice';
import ProfileDatePicker from '../Profile/ProfileDatePicker';
// Types for daily steps API response
interface DailyStepsStatus {
  id: number;
  event_id: number;
  include_daily_steps: boolean;
}
interface ConnectGermenProps {}

const ConnectGermen = ({}: ConnectGermenProps) => {
  //Hook
  const route = useRoute();
  const {goBack} = useNavigation();

  //Redux_State
  const {eventList, user} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  // Params
  const params = route?.params as
    | {access_token?: string; access_token_secret?: string}
    | undefined;
  // States
  const [formValues, setFormValues] = React.useState({
    rte: false,
    visible: false,
    date: new Date(),
    // date: getOnlyDate(tz(user?.time_zone_name || 'UTC').toDate()),
  });
  const [loadingEventId, setLoadingEventId] = React.useState<number | null>(
    null,
  );

  //RTK-Query
  const [createDataSource, {isLoading}] = useCreateDataSourceMutation();
  const [updateSyncDevices, {isLoading: isSyncDevicesLoading}] =
    useUpdateSyncDevicesMutation();
  const [updateUserEventDailySteps] = useUpdateUserEventDailyStepsMutation();
  const [getEventList] = useLazyGetEventListingQuery();

  const hitCreateDatasourceAPI = async () => {
    const body = {
      data_source_id: 3,
      access_token: params?.access_token,
      access_token_secret: params?.access_token_secret,
    };

    try {
      await createDataSource(body).unwrap();
    } catch (error: any) {
      CustomAlert({
        type: 'error',
        message: error?.data?.message || error?.message || 'Error',
      });
      if (error?.status === 422) {
        throw new Error('Device Connected');
      }
    }
  };

  const connectToGarmin = async () => {
    try {
      await hitCreateDatasourceAPI().then(async () => {
        const body = {
            sync_start_date: moment(formValues?.date).format('YYYY-MM-DD'),
          // rteDateFormatFullMonth(
          //   formValues?.date,
          //   user?.time_zone_name,
          // ),
          data_source: 'garmin',
        };
        await updateSyncDevices(body)
          .unwrap()
          .then(() => setFormValues({...formValues, visible: true}))
          .catch(err =>
            CustomAlert({
              type: 'error',
              message: err?.data?.message,
              title: 'Device Connected',
            }),
          );
      });
    } catch (error) {
      console.log('🚀 ~NEED ERROR HERE ', error);
    }
  };

  const updateEventList = useCallback(() => {
    // setRefreshing(!refreshing);
    getEventList({list_type: 'active'})
      .unwrap()
      .then(res => {
        const preferredEventId = user?.preferred_event_id;
        const dataArray = [...(res?.data?.data || [])];

        if (preferredEventId) {
          const index = dataArray.findIndex(
            item => item.id == preferredEventId,
          );
          if (index > 0) {
            dataArray.unshift(dataArray.splice(index, 1)[0]);
          }
        }
        setLoadingEventId(null);
        store.dispatch(setEventList(dataArray));
      })
      .catch(err => console.log('error', err))
      .finally(() => {});
  }, []);

  return (
    <View style={{flex: 1}}>
      {(isLoading || isSyncDevicesLoading) && <CustomScreenLoader />}

      <Text style={styles.headerText}>{'Connect Garmin'}</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Know Before You Sync:</Text>
        <Text style={styles.descriptionText}>
          {
            'If your Garmin is NOT GPS-enabled and you would like miles from your daily steps to be added to the tracker, slide the switch for daily steps ON.'
          }
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.descriptionText}>
          {
            'If your Garmin IS GPS-enabled all activities will be auto-synced to the tracker. Sliding the switch for daily steps ON will double your miles.'
          }
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.descriptionText}>
          {
            'You can always slide the switch for daily steps OFF without having to resync your device.'
          }
        </Text>
      </View>

      <CustomHorizontalLine />

      <View>
        <Text style={styles.descriptionText}>
          {
            'Select the date you would like to synchronize miles from. Please allow 30 minutes for data to sync.'
          }
        </Text>
        {/* Render toggles for each event with daily steps status */}
        {(eventList ?? []).map((status: DailyStepsStatus) => {
          // Find event name from eventList
          // const event = eventList?.find((e: any) => e.event_id === status.event_id);
          const isLoading = loadingEventId === status.id;
          const checkEnable =
            (status?.participations &&
              status?.participations[0]?.include_daily_steps) ||
            false;

          return (
            <CustomToggleSwitch
              key={status.id}
              offColor="grey"
              labelStyle={styles.toggleLabel}
              label={'Daily Steps: ' + status?.name}
              isOn={checkEnable}
              loading={isLoading}
              onToggle={async () => {
                setLoadingEventId(status.id);
                try {
                  await updateUserEventDailySteps({
                    event_id: status.id,
                    include_daily_steps: !checkEnable,
                  }).unwrap();
                  updateEventList();
                } catch (error: any) {
                  CustomAlert({
                    type: 'error',
                    message:
                      error?.data?.message ||
                      error?.message ||
                      'Failed to update daily steps status',
                  });
                  setLoadingEventId(null);
                } finally {
                }
              }}
              onColor={
                getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                )?.settingsColor || colors.lightBlue
              }
              disabled={isLoading}
            />
          );
        })}

        <View style={styles.rowView}>
          <Text style={styles.headingStyle}>Sync Start Date</Text>
          <ProfileDatePicker
            value={formValues?.date}
            // value={rteDateFormatFullMonth(formValues?.date)}
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
          onPress={connectToGarmin}
          style={[
            styles.connectBtn,
            {
              backgroundColor: getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              ).btnPrimaryColor,
            },
          ]}>
          <Text style={styles.connectText}>Connect Garmin</Text>
        </Pressable>
      </View>
      <CustomHorizontalLine />
      <CustomModal
        visible={formValues?.visible}
        title={'You’re connected!'}
        description={
          'Successfully connected your Garmin account to the RTE Tracker. It may take up to 30 min to sync data. By default, we will include your daily steps.'
        }
        descriptionStyle={styles.description}
        showDescription={true}
        hideCancelBtn
        hideConfirmBtn
        onCloseIcon={() => {
          setFormValues({...formValues, visible: false});
          goBack();
        }}
        onClose={() => setFormValues({...formValues, visible: false})}
        onConfirm={() => setFormValues({...formValues, visible: false})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(10),
  },
  card: {marginTop: moderateScale(20)},
  heading: {
    fontWeight: '600',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  descriptionText: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(5),
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
  toggleLabel: {fontSize: moderateScale(14), fontWeight: '700', width: '70%'},
});

export default ConnectGermen;
