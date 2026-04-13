import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  CustomDDPicker,
  CustomHeader,
  CustomHorizontalLine,
  CustomScreenWrapper,
} from '../../components';
import {colors} from '../../utils';
import {trackerAttitudeOptions} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';
import {settingTypes} from '../Setting/helper';
import {useUserSetting} from '../../hooks';

interface TrackerAttitudeContainerProps {}
const TrackerAttitudeContainer = ({}: TrackerAttitudeContainerProps) => {
  const [value, setValue] = React.useState('');
  const errorCallback = () => {
    setValue('');
  };

  const {isFetching, settingData, handleUpdateTrackerAttitude, isLoading} =
    useUserSetting({
      type: settingTypes.TRACKER_ATTITUDE,
      errorCallback,
    });

  useEffect(() => {
    if (settingData?.data?.attitude) {
      setValue(settingData?.data?.attitude);
    }
  }, [settingData?.data?.attitude]);

  return (
    <CustomScreenWrapper
      loadingIndicator={isFetching || isLoading}
      removeScroll>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>Tracker Attitude</Text>
        <Text style={styles.description}>
          Select how you would like to interact with the Tracker. Your choice
          here will influence the tone of motivational messages to help you work
          toward your goal all year long.
        </Text>

        <CustomHorizontalLine customStyle={styles.lineSpacing} />

        <View style={styles.row}>
          <Text style={styles.heading}>Tracker Attitude</Text>
          <View style={styles.pickerWrapper}>
            <CustomDDPicker
              list={trackerAttitudeOptions}
              placeholder={'Select'}
              initiallySelectedValue={value}
              onSelectItem={val => {
                handleUpdateTrackerAttitude(val?.value);
              }}
            />
          </View>
        </View>

        <CustomHorizontalLine customStyle={styles.lineSpacing} />
      </View>
    </CustomScreenWrapper>
  );
};
export default TrackerAttitudeContainer;

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(140),
    marginBottom: moderateScale(20),
    flex: 1,
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  description: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(20),
  },
  lineSpacing: {
    marginTop: moderateScale(20),
    marginBottom: moderateScale(20),
    zIndex: -1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.headerBlack,
    marginRight: moderateScale(10),
  },
  pickerWrapper: {
    flex: 1,
    maxWidth: moderateScale(185),
    minWidth: moderateScale(150),
    justifyContent: 'center',
    height: moderateScale(40),
  },
});
