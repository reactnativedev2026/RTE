import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, images } from '../utils';
import { moderateScale } from '../utils/metrics';

interface CustomButtonWithIconProps {
  iconName?: any;
  onPress?: () => void;
  label?: string;
  customStyle?: any;
  iconWidth?: any;
}
const CustomButtonWithIcon = ({
  iconName,
  onPress,
  label,
  customStyle,
  iconWidth,
}: CustomButtonWithIconProps) => {
  const Icon = images[iconName || 'Menu'];
  return (
    <Pressable onPress={onPress} style={[styles.btn, customStyle]}>
      {iconName && <Icon {...(iconWidth ? {width: iconWidth} : {})} />}
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
};
export default CustomButtonWithIcon;

const styles = StyleSheet.create({
  btn: {
    paddingLeft: moderateScale(15),
    paddingRight: moderateScale(7),
    backgroundColor: colors.headerBlack,
    alignSelf: 'flex-start',
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: moderateScale(33),
    marginBottom: moderateScale(15),
    maxWidth: moderateScale(163),
  },
  txt: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginLeft: moderateScale(5),
    justifyContent: 'center',
    flex: 1,
    textAlign: 'center',
  },
});
