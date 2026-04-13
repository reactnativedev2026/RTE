import { tz } from 'moment-timezone';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { store } from '../core/store';
import { colors } from '../utils';
import { getTemplateSpecs, templateName } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';

interface CustomDayComponentProps {
  date?: any;
  state?: any;
  markedDates?: any;
  onDayPress?: any;
  monthlyPoints?: any;
}

const CustomDayComponent = ({
  date,
  state,
  markedDates,
  onDayPress,
  monthlyPoints,
}: CustomDayComponentProps) => {
  const markedStyle = markedDates?.[date?.dateString]?.customStyles || {};
  const timezone = store.getState().loginReducer.user?.time_zone_name;

  const isFutureDate = tz(date?.dateString, timezone || 'UTC').isAfter(
    tz(timezone || 'UTC'),
  );

  const template = store.getState().loginReducer.eventDetail?.template;
  const isHerosTemplate = template === templateName?.HEROS_JOURNEY;

  const currentPoint = monthlyPoints?.find(
    (point: any) => point.date === date?.dateString,
  );

  const hasMilestoneImage = currentPoint?.milestone?.image;
  const miles = currentPoint?.total_mile; // change key if different

  const templateSpecs = getTemplateSpecs(template);
  const isDisabled = isFutureDate;

  const dayColor = isDisabled
    ? colors.lightGrey
    : markedStyle?.text?.color || colors.primaryGrey;

  return (
    <TouchableOpacity
      onPress={() => {
        if (!isDisabled) {
          onDayPress?.(date);
        }
      }}
      style={[styles.container, markedStyle?.container]}
      disabled={isDisabled}
      activeOpacity={0.85}>
      {/* Star in the top-right corner */}
      {hasMilestoneImage && (
        <Ionicons
          name="star"
          size={moderateScale(12)}
          color={
            isHerosTemplate && currentPoint?.milestone?.is_completed
              ? colors.primaryYellow
              : templateSpecs?.starColor
          }
          style={styles.star}
        />
      )}

      {/* Center content (day + miles) */}
      <View style={styles.contentWrapper}>
        <Text
          style={[
            styles.dayText,
            {
              color: dayColor,
              fontWeight: markedStyle?.text?.fontWeight || '800',
              opacity: isDisabled ? 0.4 : 1,
            },
          ]}>
          {date?.day}
        </Text>

        {/* Miles below day – only for non-future dates with a value */}
        {!isDisabled && miles != null && (
          <View style={styles.milesWrapper}>
            <Text style={styles.milesValue}>{miles}</Text>
            {/* <Text style={styles.milesUnit}>mi</Text> */}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomDayComponent;

const styles = StyleSheet.create({
  container: {
    width: moderateScale(36),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: moderateScale(15),
    textAlign: 'center',
  },
  milesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(2),
    // paddingHorizontal: moderateScale(4),
    // paddingVertical: moderateScale(1),
    // borderRadius: moderateScale(8),
    // backgroundColor: 'rgba(0,0,0,0.04)', // subtle modern pill
  },
  milesValue: {
    fontSize: moderateScale(8),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
  milesUnit: {
    marginLeft: moderateScale(2),
    fontSize: moderateScale(8),
    fontWeight: '500',
    color: colors.primaryGrey,
  },
  star: {
    position: 'absolute',
    top: moderateScale(-5),
    right: moderateScale(-5),
  },
});
