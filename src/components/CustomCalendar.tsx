import {tz} from 'moment-timezone';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {store} from '../core/store';
import {colors} from '../utils/colors';
import {getOnlyDate} from '../utils/dateFormats';
import {getFloatNumber, getTemplateSpecs} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import CustomArrow from './CustomArrow';
import CustomDayComponent from './CustomDayComponent';

interface CustomCalendarProps {
  onMonthChange?: (m: any) => void;
  boldDates?: string[];
  onDayPress?: (day: any) => void;
  startDate?: any;
  current?: any;
  monthlyPoints?: Array<{
    cumulative_mile: string;
    date: string;
    milestone: any;
    note: string;
    total_mile: string;
    setDate: Date;
  }>;
}

const calculateTotalMiles = miles => {
  if (!Array.isArray(miles)) return 0;

  return miles.reduce((sum, data) => {
    const miles2 = Number(data?.total_mile) || 0;
    return sum + miles2;
  }, 0);
};

const CustomCalendar = ({
  onMonthChange,
  boldDates = [],
  onDayPress,
  startDate,
  current,
  monthlyPoints = [],
}: CustomCalendarProps) => {
  const primaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.primaryColor;
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const nowInTZ = tz(timezone);

  const [formattedDate, setFormattedDate] = React.useState('');
  const currentFormattedDate = nowInTZ.format('MM/YYYY');
  const isCurrentDate = getOnlyDate(nowInTZ.toDate());

  const monthTotalMiles = calculateTotalMiles(monthlyPoints);

  React.useEffect(() => {
    if (current) {
      setFormattedDate(tz(current, timezone).format('MM/YYYY'));
    }
  }, [current]);

  // Find the date with the highest total_mile
  // NOT USED LOGIC
  // const highestMilesEntry = monthlyPoints?.reduce(
  //   (max, point) => {
  //     const currentMiles = parseFloat(point?.total_mile);
  //     return currentMiles > parseFloat(max?.total_mile) ? point : max;
  //   },
  //   {total_mile: '0', date: ''},
  // ); // Default object to compare

  // const highestMilesDate = highestMilesEntry.date;

  // Prepare marked dates for the Calendar
  const markedDates = boldDates?.reduce((acc: any, date: string) => {
    acc[date] = {
      customStyles: {
        container: {backgroundColor: colors.lightGray},
        text: {
          fontWeight: 'bold',
          color: colors.headerBlack,
          fontSize: moderateScale(16),
        },
      },
    };
    return acc;
  }, {});

  // Add the highest miles date
  // if (highestMilesDate) {
  //   markedDates[highestMilesDate] = {
  //     ...markedDates[highestMilesDate],
  //     customStyles: {
  //       text: {
  //         fontWeight: 'bold',
  //         color: colors.headerBlack,
  //         fontSize: moderateScale(16),
  //       },
  //     },
  //   };
  // }

  if (isCurrentDate) {
    markedDates[isCurrentDate] = {
      customStyles: {
        text: {
          color: primaryColor,
          fontWeight: 'bold',
          fontSize: moderateScale(16),
        },
      },
    };
  }

  if (startDate) {
    const isPastDate = tz(startDate, timezone).isBefore(
      tz(isCurrentDate, timezone),
    );
    const isToday = tz(startDate, timezone).isSame(
      tz(isCurrentDate, timezone),
      'day',
    );
    markedDates[startDate] = {
      ...markedDates[startDate],
      customStyles: {
        container: {
          backgroundColor: isToday
            ? primaryColor
            : isPastDate
            ? colors.black
            : colors.white,
        },
        text: {
          color: isToday || isPastDate ? colors.white : colors.headerBlack,
          fontWeight: 'bold',
          fontSize: moderateScale(16),
        },
      },
    };
  }

  return (
    <View>
      <Calendar
        maxDate={isCurrentDate}
        current={current?.toString()}
        key={current}
        onDayPress={onDayPress}
        onVisibleMonthsChange={onMonthChange}
        markingType={'custom'}
        hideExtraDays
        theme={{
          selectedDayTextColor: colors.white,
          textMonthFontWeight: '700',
          textMonthFontSize: 18,
          textDayHeaderFontWeight: '800',
        }}
        renderHeader={date => {
          // default header (Month + Year)
          const header = date.toString('MMMM yyyy');
          return (
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginVertical: 10,
                color: '#000', // matches default text
              }}>
              {/* parseFloat(remainingPoints).toFixed(2)}\nMiles` */}
              {header + ' (' + getFloatNumber(monthTotalMiles) + ' Miles)'}
            </Text>
          );
        }}
        dayComponent={({date, state}) => {
          return (
            <CustomDayComponent
              date={date}
              state={state}
              markedDates={markedDates}
              // highestMilesDate={highestMilesDate}
              onDayPress={onDayPress}
              monthlyPoints={monthlyPoints}
            />
          );
        }}
        renderArrow={(direction: string) => {
          return (
            <CustomArrow
              fill={
                direction == 'left' ||
                (direction == 'right' && formattedDate !== currentFormattedDate)
                  ? colors.primaryGrey
                  : colors.white
              }
              props={{
                style:
                  direction === 'left'
                    ? {transform: [{rotate: '180deg'}]}
                    : null,
              }}
            />
          );
        }}
        disableArrowRight={formattedDate === currentFormattedDate}
      />
    </View>
  );
};

export const styles = StyleSheet.create({});

export default CustomCalendar;
