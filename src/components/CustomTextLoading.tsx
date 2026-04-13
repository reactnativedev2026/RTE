import React from 'react';
import {View} from 'react-native';
import {colors} from '../utils/colors';
import {BarIndicator} from 'react-native-indicators';

interface CustomTextLoadingProps {
  loading?: boolean;
  children?: React.ReactNode;
  size?: number;
}
const CustomTextLoading = ({
  loading,
  children,
  size,
}: CustomTextLoadingProps) => {
  return (
    <View>
      {loading ? (
        <BarIndicator size={size || 17} color={colors.primaryGrey} />
      ) : (
        children
      )}
    </View>
  );
};
export default CustomTextLoading;
