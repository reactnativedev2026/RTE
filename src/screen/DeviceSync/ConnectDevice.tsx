import {useRoute} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {CustomHeader, CustomScreenWrapper} from '../../components';
import {colors} from '../../utils/colors';
import {deviceName} from '../../utils/dummyData';
import {moderateScale} from '../../utils/metrics';
import ConnectApple from './ConnectApple';
import ConnectFitBit from './ConnectFitBit';
import ConnectGermen from './ConnectGermen';
import ConnectStarva from './ConnectStarva';
import ConnectSamsung from './ConnectSamsung';
import ConnectOura from './ConnectOura';

interface ConnectDeviceProps {}

const ConnectDevice = ({}: ConnectDeviceProps) => {
  const route = useRoute();
  const {
    access_token,
    access_token_secret,
    refresh_token,
    short_name,
    token_expires_at,
  } = route.params || {};
  console.log('route.params', route.params);

  const checkRedirection = deviceName[short_name];
  return (
    <CustomScreenWrapper removeScroll={false}>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        {checkRedirection === 2 ? (
          <ConnectFitBit />
        ) : checkRedirection === 3 ? (
          <ConnectGermen />
        ) : checkRedirection === 4 ? (
          <ConnectStarva />
        ) : checkRedirection === 5 ? (
          <ConnectApple />
        ) : checkRedirection === 6 ? (
          <ConnectOura />
        ) : checkRedirection === 7 ? (
          <ConnectSamsung />
        ) : (
          <View />
        )}
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
    paddingBottom: moderateScale(120),
    marginBottom: moderateScale(20),
  },
  // headerText: {
  //   fontSize: moderateScale(16),
  //   fontWeight: '800',
  //   color: colors.primaryGrey,
  //   textAlign: 'center',
  //   marginTop: moderateScale(10),
  // },
});

export default ConnectDevice;
