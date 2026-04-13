import { tz } from 'moment-timezone';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { store } from '../core/store';
import { colors, images } from '../utils';
import { getTemplateSpecs } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import CustomCalanderFooter from './CustomCalanderFooter';
import CustomCalendar from './CustomCalendar';
import CustomCalendarListView from './CustomCalendarListView';

interface CustomCalendarWrapperProps {
  onPressEdit?: () => void;
  onMonthChange?: (m: any) => void;
  onListChange?: (m: any) => void;
  boldDates?: string[];
  onDayPress?: (day: any) => void;
  startDate?: any;
  current?: any;
  onTodayPress?: () => void;
  yearPoints?: any;
  isFetching?: boolean;
  listView?: any;
  setListView?: any;
  onPointsAddCallback?: () => void;
  setCurrent?: any;
  footerObj?: any;
  monthlyPoints?: any;
  isLoading?: any;
  setShowModal?: () => void;
  showModal?: boolean;
  handleCalendarPoints?: () => void;
}
const CustomCalendarWrapper = ({
  onPressEdit,
  onMonthChange,
  onListChange,
  boldDates = [],
  onDayPress,
  startDate,
  current,
  onTodayPress,
  yearPoints,
  isFetching,
  isLoading,
  listView,
  setListView,
  onPointsAddCallback,
  setCurrent,
  footerObj,
  monthlyPoints,
  setShowModal,
  showModal,
  handleCalendarPoints,
}: CustomCalendarWrapperProps) => {
  const primaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.primaryColor;
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const [formattedDate, setFormattedDate] = React.useState('');
  const currentFormattedDate = tz(timezone || 'UTC').format('MM/YYYY');

  React.useEffect(() => {
    if (current) {
      setFormattedDate(tz(current, timezone || 'UTC').format('MM/YYYY'));
    }
  }, [current]);

  const changeToList = () => {
    setCurrent('');
    if (!listView) {
      setListView(!listView);
    }
  };
  const changeToGrid = () => {
    setCurrent('');
    if (listView) {
      setListView(!listView);
    }
  };

  return (
    <View
      style={[
        styles.firstContainer,
        {height: listView && yearPoints?.length < 1 ? 450 : null},
      ]}>
      <View style={styles.calendarContainer}>
        <View style={styles.mainRow}>
          <View style={styles.row}>
            <Pressable
              hitSlop={styles.hitSlop}
              onPress={changeToGrid}
              style={{padding: 5}}>
              <MaterialCommunityIcons
                name="view-module-outline"
                color={!listView ? primaryColor : colors.lightGrey}
                size={30}
              />
            </Pressable>
            <Pressable
              hitSlop={styles.hitSlop}
              onPress={changeToList}
              style={{paddingVertical: 12, paddingHorizontal: 5}}>
              <images.ListViewIcon
                fill={listView ? primaryColor : colors.lightGrey}
                stroke={listView ? primaryColor : colors.lightGrey}
                style={styles.iconMargin}
              />
            </Pressable>
          </View>
          {formattedDate === currentFormattedDate && (
            <Pressable onPress={onTodayPress} hitSlop={styles.hitSlop}>
              <Text style={styles.goToday}>Current Month</Text>
            </Pressable>
          )}
        </View>

        {listView ? (
          <CustomCalendarListView
            onListChange={onListChange}
            current={current?.toString()}
            onDayPress={onDayPress}
            yearPoints={yearPoints}
            isFetching={isFetching}
            onPointsAddCallback={onPointsAddCallback}
          />
        ) : (
          <CustomCalendar
            onMonthChange={onMonthChange}
            boldDates={boldDates}
            onDayPress={onDayPress}
            startDate={startDate}
            current={current}
            monthlyPoints={monthlyPoints}
          />
        )}
      </View>

 
      {/* {!listView && (!startDate || !footerObj?.date) &&  (
        <CustomCalanderFooter
          onPressEdit={onPressEdit}
          hideNotes={!footerObj?.notes}
          footerObj={footerObj}
          mainStyle={styles.footerContainer}
          isLoading={isLoading}
          setShowModal={setShowModal}
          showModal={showModal}
          notesContainer={{flexDirection: 'row'}}
          monthlyPoints={monthlyPoints}
          onPointsAddCallback={handleCalendarPoints}
        />
      )} */}

      {!listView && eventDetail?.event_status !== 'future' && (
        <CustomCalanderFooter
          onPressEdit={onPressEdit}
          hideNotes={!footerObj?.notes}
          footerObj={footerObj}
          mainStyle={styles.footerContainer}
          isLoading={isLoading}
          setShowModal={setShowModal}
          showModal={showModal}
          notesContainer={{flexDirection: 'row'}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(23),
    marginHorizontal: moderateScale(10),
    borderTopRightRadius: moderateScale(25),
    borderTopLeftRadius: moderateScale(25),
  },

  mainRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: moderateScale(10),
    backgroundColor: colors.white,
    paddingHorizontal: moderateScale(15),
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  hitSlop: {top: 10, bottom: 10, right: 10, left: 10},
  goToday: {
    color: colors.lightGrey,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  iconMargin: {marginLeft: moderateScale(10)},
  footerContainer: {
    backgroundColor: 'rgba(247, 247, 247, 1)',
    paddingBottom: moderateScale(80),
    paddingHorizontal: moderateScale(15),
    flex: 1,
  },
  calendarContainer: {
    // paddingHorizontal: moderateScale(15),
    overflow: 'hidden',
    paddingBottom: moderateScale(10),
    backgroundColor: colors.white,
  },
});
export default CustomCalendarWrapper;
