import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';

const CustomScreenLoader: React.FC = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator
        size="large"
        color={colors.primaryMediumBlue}
        style={styles.indicator}
      />
    </View>
  );
};

export default CustomScreenLoader;

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.13)',
  },
  indicator: {
    marginTop: moderateScale(180),
  },
});
