import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CustomArrow} from '../../components';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';
import {navigate} from '../../services/NavigationService';
import {Routes} from '../../utils/Routes';

interface MeetingContainerProps {}
const MeetingContainer = ({}: MeetingContainerProps) => {
  return (
    <TouchableOpacity
      style={styles.containerr}
      onPress={() => navigate(Routes.MEETING_MENTOR)}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Meeting with the Mentor</Text>
          <View style={styles.milesAndDate}>
            <Text style={styles.date}>2 Miles</Text>
            <Text style={styles.date}>May 8, 2024</Text>
          </View>
        </View>
        <CustomArrow />
      </View>
    </TouchableOpacity>
  );
};
export default MeetingContainer;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(8),
  },
  title: {
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: colors.headerBlack,
  },
  date: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    fontWeight: '500',
  },

  containerr: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(15),
    shadowColor: colors.headerBlack,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: moderateScale(5),
    marginTop: moderateScale(8),
  },
  milesAndDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScale(5),
  },
  textContainer: {flex: 1, marginRight: moderateScale(15)},
});
