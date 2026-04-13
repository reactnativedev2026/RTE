import React from 'react';
import {BaseToast, ErrorToast, SuccessToast} from 'react-native-toast-message';
import {colors} from '../utils';
import {StyleSheet} from 'react-native';
import {moderateScale} from '../utils/metrics';
interface toastConfigProps {
  text1: 'success' | 'error' | 'info';
  text2: string;
}
const ToastConfig = {
  success: ({text1, text2}: toastConfigProps) => (
    <SuccessToast
      style={[{borderLeftColor: colors.green}, styles.container]}
      text1={text1}
      text2={text2}
      text2NumberOfLines={3}
      text2Props={styles.textStyle}
    />
  ),
  error: ({text1, text2}: toastConfigProps) => (
    <ErrorToast
      style={[{borderLeftColor: colors.primaryRed}, styles.container]}
      text1={text1}
      text2={text2}
      text2NumberOfLines={3}
      text2Props={styles.textStyle}
    />
  ),
  info: ({text1, text2}: toastConfigProps) => (
    <BaseToast
      style={[{borderLeftColor: colors.primaryBlue}, styles.container]}
      text1={text1}
      text2={text2}
      text2NumberOfLines={3}
      text2Props={styles.textStyle}
    />
  ),
};

export default ToastConfig;

const styles = StyleSheet.create({
  textStyle: {
    paddingBottom: moderateScale(3),
  },
  container: {
    height: moderateScale(65),
  },
});
