import React from 'react';
import {store} from '../core/store';
import {colors, images, Routes} from '../utils';
import MultipleTapsPress from './MultipleTapsPress';
import {StyleSheet, Text, View} from 'react-native';
import {IOS, moderateScale} from '../utils/metrics';
import {navigate} from '../services/NavigationService';
import {dateFormatFullMonth} from '../utils/dateFormats';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface CustomQuestListProps {
  item: any;
  showCompleted?: boolean;
  initialRoute?: string;
}

const CustomQuestList = ({
  item,
  showCompleted,
  initialRoute,
}: CustomQuestListProps) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  return (
    <MultipleTapsPress
      style={styles.bottomColor}
      onPress={() => {
        navigate(Routes.MEETING_MENTOR, {item, initialRoute});
      }}>
      <View style={styles.ListContainer}>
        <View style={styles.listView}>
          <View style={styles.row}>
            <View style={styles.tickIcon}>
              {item?.is_completed && showCompleted && (
                <images.TickIcon height={10} width={10} />
              )}
            </View>
            <Text style={styles.QuestTitle} numberOfLines={1}>
              {item?.activity?.name}
            </Text>
          </View>
          <View style={styles.Listcard}>
            <Text
              style={
                styles.listItem
              }>{`${item?.activity?.total_points} Miles`}</Text>
            <Text style={styles.listItem}>
              {dateFormatFullMonth(item?.date, timezone)}
            </Text>
          </View>
          <View style={styles.ListArrow}>
            <AntDesign
              name={'doubleright'}
              size={15}
              color={colors.headerBlack}
            />
          </View>
        </View>
      </View>
    </MultipleTapsPress>
  );
};
export default CustomQuestList;

const styles = StyleSheet.create({
  ListContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: moderateScale(5),
    borderBottomLeftRadius: moderateScale(18),
    borderBottomRightRadius: moderateScale(18),
  },
  bottomColor: {
    marginTop: moderateScale(10),
    borderTopColor: colors.white,
    borderLeftColor: colors.white,
    borderRightColor: colors.white,
    borderBottomColor: colors.lightGrey,
    borderWidth: moderateScale(IOS ? 3 : 2),
    borderBottomLeftRadius: moderateScale(25),
    borderBottomRightRadius: moderateScale(25),
  },
  listView: {
    flex: 1,
    paddingBottom: moderateScale(6.5),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  Listcard: {
    flexDirection: 'row',
    marginTop: moderateScale(15),
    marginLeft: moderateScale(5),
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(10),
  },
  QuestTitle: {
    flex: 1,
    fontWeight: '600',
    color: colors.headerBlack,
    fontSize: moderateScale(16),
  },
  listItem: {color: colors.primaryGrey, paddingRight: moderateScale(30)},

  ListArrow: {
    position: 'absolute',
    top: moderateScale(20),
    right: moderateScale(20),
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  tickIcon: {width: moderateScale(15), left: moderateScale(2)},
});
