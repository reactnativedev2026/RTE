import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../utils/colors';
import {getTemplateSpecs} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import {store} from '../core/store';
import MultipleTapsPress from './MultipleTapsPress';

interface CustomBottonsContainerProps {
  onPressBtn?: () => void;
  onPressSave?: () => void;
  loading?: boolean;
  secondBtnTxt?: string | undefined;
  customStyleBtn?: any;
  customStyleBtnCancel?: any;
  containerStyle?: any;
  cancelBtnTxt?: string | undefined;
  hideCancelBtn?: boolean | undefined;
  disabled?: boolean;
}
const CustomBottonsContainer = ({
  onPressBtn,
  onPressSave,
  loading,
  secondBtnTxt,
  customStyleBtn,
  customStyleBtnCancel,
  containerStyle,
  cancelBtnTxt,
  hideCancelBtn,
  disabled,
}: CustomBottonsContainerProps) => {
  return (
    <View style={[styles.main, containerStyle]}>
      {!hideCancelBtn && (
        <Pressable
          onPress={onPressBtn}
          style={[styles.btnContainer, customStyleBtnCancel]}>
          <Text style={styles.btnText}>{cancelBtnTxt || 'Cancel'}</Text>
        </Pressable>
      )}
      <MultipleTapsPress
        disabled={disabled}
        onPress={onPressSave}
        style={[
          styles.btn2Container,
          customStyleBtn,
          {
            backgroundColor: disabled
              ? colors.lightGrey
              : getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                ).btnPrimaryColor,
          },
        ]}>
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text style={styles.btnText}>{secondBtnTxt || 'Save'}</Text>
        )}
      </MultipleTapsPress>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(20),
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  btnContainer: {
    borderRadius: moderateScale(50),
    backgroundColor: colors.lightGrey,
    paddingHorizontal: moderateScale(25),
    paddingVertical: moderateScale(10),
    marginHorizontal: moderateScale(5),
  },
  btn2Container: {
    borderRadius: moderateScale(50),
    paddingHorizontal: moderateScale(33),
    paddingVertical: moderateScale(10),
    marginHorizontal: moderateScale(5),
  },
});
export default CustomBottonsContainer;
