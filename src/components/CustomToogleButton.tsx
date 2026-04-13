import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../utils';
import {getTemplateSpecs} from '../utils/helpers';
import {store} from '../core/store';

const CustomToogleButton = ({text1, text2, team, setTeam, size}) => {
  // get Colors
  const graphColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.statBtnClr;

  return (
    <View style={styles.peopleTeam_view}>
      <TouchableOpacity
        onPress={() => setTeam(false)}
        style={[
          styles.switch_btn,
          {
            backgroundColor: team ? colors.lightGrey : graphColor,
            width: size ? size : 80,
          },
        ]}>
        <Text
          style={[
            styles.switch_txt,
            {color: team ? colors.primaryGrey : colors.white},
          ]}>
          {text1}
        </Text>
      </TouchableOpacity>
      <View style={styles.verticalDevidingLine_view} />
      <TouchableOpacity
        onPress={() => setTeam(true)}
        style={[
          styles.switch_btn,
          {
            backgroundColor: team ? graphColor : colors.lightGrey,
            width: size ? size : 80,
          },
        ]}>
        <Text
          style={[
            styles.switch_txt,
            {color: team ? colors.white : colors.primaryGrey},
          ]}>
          {text2}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomToogleButton;

const styles = StyleSheet.create({
  peopleTeam_view: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switch_btn: {
    borderRadius: 20,
    paddingVertical: 7,
    alignItems: 'center',
  },
  verticalDevidingLine_view: {
    width: 1,
    height: 25,
    marginHorizontal: 10,
    backgroundColor: colors.primaryGrey,
  },
  switch_txt: {textAlign: 'right', fontSize: 15},
});
