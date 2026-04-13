import {tz} from 'moment';
import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {store} from '../core/store';
import {navigate} from '../services/NavigationService';
import {colors} from '../utils/colors';
import {getFloatNumber} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import {Routes} from '../utils/Routes';
import CustomCalanderFooter from './CustomCalanderFooter';
import {CustomArrow, CustomHorizontalLine} from './index';

interface CustomCalendarListViewProps {
  yearPoints: any | undefined;
  isFetching?: boolean;
  isLoading?: boolean;
  current?: string;
  onListChange?: () => void;
  onPointsAddCallback?: () => void;
  onDayPress?: (day: any) => void;
}

const calculateTotalMiles = miles => {
  if (!Array.isArray(miles)) return 0;

  return miles.reduce((sum, data) => {
    const miles2 = Number(data?.total_mile) || 0;
    return sum + miles2;
  }, 0);
};

const CustomCalendarListView = ({
  yearPoints,
  isFetching,
  isLoading,
  current,
  onListChange,
  onPointsAddCallback,
  onDayPress,
}: CustomCalendarListViewProps) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const currentMoment = tz(current, timezone);
  const nowMoment = tz(timezone);
  const currentMonth =
    currentMoment.year() === nowMoment.year() &&
    currentMoment.month() === nowMoment.month();

  const monthTotalMiles = calculateTotalMiles(yearPoints);

  const renderItem = ({item, index}: {item: any; index: any}) => {
    const isEven = index % 2 === 0;

    return (
      <View key={index?.toString()} style={styles.itemContainer}>
        <CustomHorizontalLine customStyle={styles.lineStyling} />
        <View style={styles.itemStyling(isEven)}>
          <CustomCalanderFooter
            onPressEdit={() => {
              navigate(Routes.ADD_CALENDAR_MILES, {
                miles: item?.total_mile,
                date: item?.date,
                onPointsAddCallback,
              });
            }}
            footerObj={item}
            notes={item?.note}
            isLoading={isLoading}
            startDate={item?.date}
            hideNotes={!item?.note}
            miles={item?.total_mile}
            customImage={styles.image}
            containerStyle={styles.containerStyle}
            notesContainer={styles.calendarListNotes}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.firstContainer}>
      <View style={styles.calendarContainer}>
        <Calendar
          hideDayNames
          key={current}
          markingType={'custom'}
          onDayPress={onDayPress}
          current={current?.toString()}
          onVisibleMonthsChange={onListChange}
          maxDate={new Date().toISOString().split('T')[0]}
          hideExtraDays
          theme={{
            textMonthFontSize: 18,
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '800',
            selectedDayTextColor: colors.white,
          }}
          dayComponent={() => {
            return;
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
          style={{
            height: 50,
            backgroundColor: colors.white,
            marginHorizontal: moderateScale(-15),
          }}
          renderArrow={(direction: string) => {
            return (
              <CustomArrow
                fill={
                  direction === 'left' ||
                  (direction === 'right' && !currentMonth)
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
          disableArrowRight={currentMonth}
        />
      </View>
      <FlatList
        data={yearPoints}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        ListEmptyComponent={() => {
          if (!isFetching) {
            return (
              <View style={styles.centerContainer}>
                <Text style={styles.notFoundText}> No record found!</Text>
              </View>
            );
          }
        }}
      />
    </View>
  );
};

export default CustomCalendarListView;

const styles = StyleSheet.create({
  firstContainer: {backgroundColor: colors.lightGray},
  containerStyle: {
    marginTop: moderateScale(8),
    paddingHorizontal: moderateScale(14),
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(390),
  },
  notFoundText: {
    textAlign: 'center',
    color: colors.lightGrey,
    fontSize: moderateScale(16),
  },
  image: {
    width: moderateScale(70),
    height: moderateScale(50),
    paddingRight: moderateScale(10),
  },
  lineStyling: {borderColor: colors.lightGrey, marginTop: moderateScale(-1)},
  itemStyling: isEven => ({
    width: '100%',
    backgroundColor: !isEven && colors.white,
  }),
  itemContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: moderateScale(10),
  },
  calendarContainer: {paddingHorizontal: moderateScale(15)},
  calendarListNotes: {flexDirection: 'row', paddingLeft: moderateScale(10)},
});
