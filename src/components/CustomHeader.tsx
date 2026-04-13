import React from 'react';
import CustomArrow from './CustomArrow';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../utils/colors';
import {images} from '../utils';
import {moderateScale} from '../utils/metrics';
import {goBack} from '../services/NavigationService';

interface CustomHeaderProps {
  onPressEdit?: () => void;
  hideEditBtn?: boolean;
  onPressBack?: () => void;
}
const CustomHeader = ({
  onPressEdit,
  hideEditBtn,
  onPressBack,
}: CustomHeaderProps) => {
  const BackPress = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      goBack();
    }
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={BackPress} style={styles.btn}>
        <CustomArrow
          fill={colors.primaryGrey}
          props={{
            style: {transform: [{rotate: '180deg'}]},
          }}
        />
        <Text style={styles.textStyle}>Back</Text>
      </Pressable>
      {!hideEditBtn && (
        <Pressable onPress={onPressEdit} style={styles.btn}>
          <Text style={styles.textStyle}>Edit</Text>
          <images.EditIcon style={styles.edit} />
        </Pressable>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textStyle: {
    color: colors.lightGrey,
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: moderateScale(5),
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  edit: {marginLeft: moderateScale(5)},
});

export default CustomHeader;
