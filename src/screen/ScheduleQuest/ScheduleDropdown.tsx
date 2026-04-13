import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CustomDDPicker} from '../../components';
import MultipleTapsPress from '../../components/MultipleTapsPress';
import {store} from '../../core/store';
import {colors, images} from '../../utils';
import {getTemplateSpecs} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';

interface ScheduleDropdownProps {
  headingText?: string;
  required?: boolean;
  questActivity?: any;
  setSelectedActivity?: any;
  selectedActivity?: any;
}
const ScheduleDropdown = ({
  headingText,
  required,
  questActivity,
  setSelectedActivity,
  selectedActivity,
}: ScheduleDropdownProps) => {
  const getRequiredTextStyle = (color: string) => ({
    color: color || colors.headerBlack,
  });
  const [open, setOpen] = React.useState(false);

  const renderItem = ({group, items}) => {
    return (
      <View style={styles.groupContainer}>
        <Text style={styles.groupTitle}>{group}</Text>
        <View
          style={{
            paddingBottom: moderateScale(20),
            paddingTop: moderateScale(10),
          }}>
          {items?.map((item, index) => {
            const key = item?.id || `fallback-key-${index}`;
            return (
              <MultipleTapsPress
                key={key}
                style={styles.itemContainer}
                onPress={() => {
                  setSelectedActivity(item);
                  setOpen(false);
                }}
                disabled={item?.is_completed}>
                <View style={styles.selectQuestContainer}>
                  <View style={{flex: 1}}>
                    <Text
                      style={styles.itemTitle}
                      numberOfLines={2}
                      ellipsizeMode="head">
                      {item?.name}
                    </Text>
                    <Text
                      style={
                        styles.itemTitle
                      }>{`${item?.total_points} Miles`}</Text>
                  </View>
                  <View style={styles.tick}>
                    {[...Array(item?.quest_count)].map((_, i) => (
                      <images.TickIcon
                        height={moderateScale(15)}
                        width={moderateScale(15)}
                      />
                    ))}
                  </View>
                </View>
              </MultipleTapsPress>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View>
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
      <CustomDDPicker
        list={questActivity}
        placeholder={selectedActivity?.name || 'Select a quest'}
        renderListItem={({item}) => renderItem(item)}
        ddCustomStyle={{maxHeight: moderateScale(200)}}
        close={open}
        setClose={setOpen}
      />
    </View>
  );
};
export default ScheduleDropdown;

const styles = StyleSheet.create({
  headingText: {
    color: colors.headerBlack,
    fontWeight: '700',
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  heading: {
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
  },
  groupContainer: {
    backgroundColor: colors.white,
    marginHorizontal: moderateScale(15),
    color: colors.headerBlack,
    borderTopWidth: 1,
    borderColor: 'rgba(217, 217, 217, 1)',
  },
  groupTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    paddingTop: moderateScale(10),
  },
  itemContainer: {
    paddingHorizontal: moderateScale(15),
    paddingTop: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
  },
  itemDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  itemAvailable: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  itemCategory: {fontSize: 12, fontStyle: 'italic', marginTop: 5},
  tick: {flexDirection: 'row', minWidth: 0, maxWidth: '25%', flexWrap: 'wrap'},
  selectQuestContainer: {flex: 1, flexDirection: 'row'},
});
