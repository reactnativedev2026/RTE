import React from 'react';
import {StyleSheet, View} from 'react-native';
import {moderateScale} from '../utils/metrics';

interface CustomHorizontalLineProps {
  customStyle?: any;
}
const CustomHorizontalLine = ({customStyle}: CustomHorizontalLineProps) => {
  return <View style={[styles.horizontalLine, customStyle]} />;
};
export default CustomHorizontalLine;
const styles = StyleSheet.create({
  horizontalLine: {
    borderTopWidth: moderateScale(2),
    borderColor: 'rgba(247, 247, 247, 1)',
    marginTop: 10,
  },
});
