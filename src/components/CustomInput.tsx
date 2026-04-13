import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../utils/colors';
import * as Animatable from 'react-native-animatable';
import Entypo from 'react-native-vector-icons/Entypo';
import {IOS, moderateScale} from '../utils/metrics';
import {fonts} from '../utils/fonts';
import {images} from '../utils';
import {getTemplateSpecs} from '../utils/helpers';
import {store} from '../core/store';

interface CustomInputProps {
  errorMsg?: string;
  onPressIcon?: () => void;
  showIcon?: boolean;
  props?: any;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  iconName?: string | undefined;
  headingText?: string;
  required?: boolean;
}
const CustomInput = ({
  errorMsg,
  containerStyle,
  secureTextEntry,
  inputStyle,
  onPressIcon,
  showIcon,
  props,
  iconName,
  headingText,
  required,
}: CustomInputProps) => {
  const Icon = images[iconName || 'Menu'];

  const getRequiredTextStyle = (color: string) => ({
    color: color || colors.headerBlack,
  });

  return (
    <>
      {headingText && (
        <View style={styles.heading}>
          <Text style={styles.headingText}>{headingText}</Text>
          {required && (
            <Text
              style={getRequiredTextStyle(
                getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                ).bottomTabIconColor,
              )}>
              {' '}
              *
            </Text>
          )}
        </View>
      )}
      <View style={[styles.inputContainer, containerStyle]}>
        <TextInput
          style={[styles.textInput, inputStyle]}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {showIcon && (
          <TouchableOpacity onPress={onPressIcon}>
            <Entypo
              name={secureTextEntry ? 'eye-with-line' : 'eye'}
              size={20}
              color={colors.headerBlack}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
        {iconName && <Icon height={20} width={20} />}
      </View>
      <Animatable.Text animation="bounceIn" style={styles.errorText}>
        {errorMsg}
      </Animatable.Text>
    </>
  );
};
const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(2),
    marginTop: moderateScale(10),
  },
  textInput: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
    fontFamily: fonts.Light,
    color: 'black',
    padding: 0,
    margin: 0,
    paddingVertical: IOS ? moderateScale(10) : moderateScale(5),
  },
  errorText: {
    color: 'red',
    paddingHorizontal: moderateScale(15),
  },
  icon: {
    paddingHorizontal: 10,
  },
  headingText: {
    color: colors.headerBlack,
    fontWeight: '700',
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  heading: {
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
  },
});
export default CustomInput;
