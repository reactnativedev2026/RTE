import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {colors} from '../utils/colors';
import {getTemplateSpecs} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import {store} from '../core/store';

interface CustomToggleProps {
  isTeam: boolean;
  setIsTeam: (value: boolean) => void;
}
const CustomToggle = ({setIsTeam, isTeam}: CustomToggleProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          !isTeam
            ? {
                backgroundColor:
                  getTemplateSpecs(
                    store.getState().loginReducer.eventDetail?.template,
                  )?.toggleColor || colors.headerBlack,
              }
            : styles.unselectedButton,
        ]}
        onPress={() => {
          setIsTeam(false);
        }}>
        <Text
          style={[
            styles.text,
            !isTeam ? styles.selectedText : styles.unselectedText,
          ]}>
          You
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          isTeam
            ? {
                backgroundColor:
                  getTemplateSpecs(
                    store.getState().loginReducer.eventDetail?.template,
                  )?.toggleColor || colors.headerBlack,
              }
            : styles.unselectedButton,
        ]}
        onPress={() => {
          setIsTeam(true);
        }}>
        <Text
          style={[
            styles.text,
            isTeam ? styles.selectedText : styles.unselectedText,
          ]}>
          Team
        </Text>
      </Pressable>
    </View>
  );
};

export default CustomToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: moderateScale(25),
    backgroundColor: colors.lightGrey,
    height: moderateScale(33),
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(25),
    width: moderateScale(80),
  },
  unselectedButton: {
    backgroundColor: colors.lightGrey,
  },
  text: {
    fontSize: moderateScale(14),
  },
  selectedText: {
    color: colors.white,
    fontWeight: '800',
  },
  unselectedText: {
    color: colors.white,
    fontWeight: '400',
  },
});
