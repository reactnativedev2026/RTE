import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { store } from '../../core/store';
import { colors, images } from '../../utils';
import { dateFormatWithoutTimezone } from '../../utils/dateFormats';
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

interface ProfileDatePickerProps {
  value?: any;
  onChangeText?: (text: string | undefined | null | date | object) => void;
  containerStyle?: any;
  calendarStyle?: any;
  headingText?: string;
  required?: boolean;
  noMaximumDate?: boolean;
  minimumDate?: any;
  maximumDate?: any;
  date?: any;
}

const ProfileDatePicker = ({
  value,
  onChangeText,
  containerStyle,
  headingText,
  required,
  noMaximumDate,
  date,
  minimumDate,
  calendarStyle,
  maximumDate,
}: ProfileDatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const getRequiredTextStyle = (color: string) => ({
    color: color || colors.headerBlack,
  });
  // const timezone = store.getState().loginReducer.user?.time_zone_name;
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
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.container, containerStyle]}>
        <Text style={styles.dateTxt}>
          {dateFormatWithoutTimezone(value) || 'Birthday'}
        </Text>
        <images.Calander
          height={17}
          width={17}
          fill={calendarStyle ? calendarStyle?.fill : colors.lightGrey}
          style={styles.calendar}
        />
      </Pressable>
      <DatePicker
        modal
        mode="date"
        open={open}
        date={value instanceof Date ? value : new Date(value)} // this ensures Date object
        onConfirm={date => {
          setOpen(false);
          onChangeText?.(date);
        }}
         onCancel={() => setOpen(false)}
        maximumDate={noMaximumDate ? undefined : maximumDate ?? new Date()}
        minimumDate={minimumDate}
      />
    </>
  );
};

export default ProfileDatePicker;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(2),
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    justifyContent: 'space-between',
    borderRadius: moderateScale(100),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(20),
  },
  dateTxt: {color: colors.primaryGrey, fontSize: moderateScale(16)},
  calendar: {marginLeft: moderateScale(10)},
  headingText: {
    fontWeight: '700',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  heading: {paddingBottom: moderateScale(8), flexDirection: 'row'},
});
