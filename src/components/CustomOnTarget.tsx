import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-expect-error: No type definitions for 'react-native-speedometer', safe to ignore for JS import
import RNSpeedometer from 'react-native-speedometer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../core/store';
import { useUserSetting } from '../hooks';
import useLoginStore from '../screen/AuthScreen/login/useLoginStore';
import { settingTypes } from '../screen/Setting/helper';
import { setAttitideList } from '../services/slice/TrackerAttitude.slice';
import { colors, Routes } from '../utils';
import { SpeedoMeterLabel, trackerDetails } from '../utils/dummyData';
import { moderateScale } from '../utils/metrics';

interface CustomOnTargetProps {}
const CustomOnTarget = ({}: CustomOnTargetProps) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);
  const {settingData: trackerAttitudeSettingData} = useUserSetting({
    type: settingTypes.TRACKER_ATTITUDE,
  });

  const {readBroadcast} = useLoginStore();

  const {settingData: rtyGoalsSettingData, getUserSettingsCall} =
    useUserSetting({
      type: settingTypes.RTY_GOALS,
    });

  const {AttitudeList} = useSelector(
    (state: RootState) => state.trackerReducer,
  );

  type TrackerAttitudeKey = keyof typeof trackerDetails;
  const attitudeValue: TrackerAttitudeKey | undefined =
    typeof AttitudeList === 'string' && AttitudeList in trackerDetails
      ? (AttitudeList as TrackerAttitudeKey)
      : undefined;

  useEffect(() => {
    if (
      (!AttitudeList || AttitudeList === '') &&
      trackerAttitudeSettingData &&
      (trackerAttitudeSettingData as any)?.data?.attitude
    ) {
      dispatch(
        setAttitideList((trackerAttitudeSettingData as any)?.data?.attitude),
      );
    }
  }, [AttitudeList, trackerAttitudeSettingData, dispatch]);

  useEffect(() => {
    if (attitudeValue) {
      getUserSettingsCall();
    }
  }, [attitudeValue]);

  return (
    <View style={styles.targetContainer}>
      <View style={styles.targetHeader}>
        <Text style={styles.targetHeaderText}>Are you on Target?</Text>
        <TouchableOpacity
          style={styles.editGoalBtn}
          onPress={() =>
            navigation.navigate(Routes.SETTING_STACK, {screen: Routes.GOALS})
          }>
          <Text style={styles.editGoalTxt}>Edit Goal</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.targetContent}>
        {/* <Image source={require('../assets/meter.png')} style={styles.img} /> */}
        <View style={styles.speedoMeterContainer}>
          <RNSpeedometer
            value={eventDetail?.statistics?.completed_percentage}
            size={100}
            // labels={SpeedoMeterLabel}
            labels={SpeedoMeterLabel.map(label => ({
              ...label,
              name: (
                <Text>
                  <Text style={styles.milesNumber}>
                    {`${eventDetail?.statistics?.completed_miles}\n`}
                  </Text>
                  <Text style={styles.milesText}> miles</Text>
                </Text>
              ),
            }))}
            labelStyle={{fontSize: 1}}
            labelNoteStyle={{
              fontSize: 10,
              borderWidth: 1,
              borderRadius: 5,
              padding: 5,
              borderColor: colors.primaryGrey,
            }}
          />
        </View>
        {/* <View style={styles.meterBox} /> */}
        {/* <Text style={styles.targetText}>
          {rtyGoalsSettingData &&
          (rtyGoalsSettingData as any)?.data?.rty_stats_message
            ? (rtyGoalsSettingData as any).data.rty_stats_message + '\n'
            : ''}
          {rtyGoalsSettingData &&
          (rtyGoalsSettingData as any)?.data?.rty_stats_action_message
            ? (rtyGoalsSettingData as any).data.rty_stats_action_message + '\n'
            : ''} 
        </Text> */}
        <Text style={styles.targetText}>
          {rtyGoalsSettingData &&
          (rtyGoalsSettingData as any)?.data?.rty_stats_message_widget
            ? (rtyGoalsSettingData as any).data.rty_stats_message_widget + '\n'
            : ''}
        </Text>
      </View>
    </View>
  );
};

export default CustomOnTarget;

const styles = StyleSheet.create({
  targetContainer: {
    marginHorizontal: 10,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 30,
    marginBottom: 20,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  targetHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
  targetContent: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  speedoMeterContainer: {
    alignItems: 'center',
  },
  milesNumber: {
    color: colors.black,
  },
  milesText: {
    color: colors.primaryGrey,
  },
  targetText: {
    color: colors.primaryGrey,
    textAlign: 'left',
    width: '58%',
    minHeight: 90,
  },
  attitudeText: {
    textTransform: 'capitalize',
  },
  editGoalText: {
    fontWeight: 'bold',
  },
  editGoalBtn: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    backgroundColor: colors.black,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editGoalTxt: {
    color: colors.white,
  },
  img: {
    height: 80,
    width: 110,
  },
  meterBox: {
    height: 40,
    width: 60,
    position: 'absolute',
    borderWidth: 1,
    bottom: 0,
    left: 20,
    borderRadius: 5,
    borderColor: '#d3d3d3',
  },
});
