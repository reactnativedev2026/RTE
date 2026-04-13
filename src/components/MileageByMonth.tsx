import React from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {store} from '../core/store';
import {colors} from '../utils';
import {rteMonthNameFormat} from '../utils/dateFormats';
import {MONTHS} from '../utils/dummyData';
import {getTemplateSpecs, getYAxisConfig} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import CustomArrow from './CustomArrow';
import {Listing} from './index';

interface CustomThirtyDaysGraphProps {
  loading?: boolean;
  monthMileage?: any;
  containerStyle?: ViewStyle;
}

const MileageByMonth = ({
  monthMileage,
  containerStyle,
}: CustomThirtyDaysGraphProps) => {
  const {MileageByMonthListing} = Listing;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [currentScrollPosition, setCurrentScrollPosition] = React.useState(0);

  const timezone = store.getState().loginReducer.user?.time_zone_name;

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const changeLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleArrowPress = () => {
    const newScrollPosition = currentScrollPosition + 200;
    scrollViewRef.current?.scrollTo({x: newScrollPosition, animated: true});
    setCurrentScrollPosition(newScrollPosition);
  };

  const handleBackArrowPress = () => {
    const newScrollPosition = Math.max(currentScrollPosition - 200, 0);
    scrollViewRef.current?.scrollTo({x: newScrollPosition, animated: true});
    setCurrentScrollPosition(newScrollPosition);
  };

  const handleScroll = (event: any) => {
    setCurrentScrollPosition(event.nativeEvent.contentOffset.x);
  };

  // Calculate max value from monthMileage data
  const maxValue =
    monthMileage && monthMileage.length > 0
      ? Math.max(
          ...monthMileage.map((record: any) => parseFloat(record.amount)),
        )
      : 0;

  const yAxisConfig = getYAxisConfig(maxValue);
  const yAxisLabels = Array.from(
    {length: yAxisConfig.labels},
    (_, i) => i * yAxisConfig.increment,
  );

  const templateSpecs = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  );

  const newData = MONTHS.map((item: any, index: number) => {
    const record = monthMileage?.find(
      (records: any) => item === rteMonthNameFormat(records?.date, timezone),
    );

    return record
      ? {amount: record.amount, date: record.date} // Use the record if found
      : {amount: '0', date: `2025-${index + 1}-01`}; // Default if no record exists
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mileage By Month</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={changeLayout}>
          <Text style={styles.headerIcon}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={30}
              color="#000"
            />
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.chartContainer,
          {height: expanded ? null : 0, overflow: 'hidden'},
        ]}>
        {monthMileage?.length > 0 ? (
          <>
            <React.Fragment>
              {monthMileage?.length > 3 && (
                <TouchableOpacity
                  hitSlop={styles.hitSlop}
                  onPress={handleBackArrowPress}>
                  <CustomArrow
                    fill={templateSpecs.btnPrimaryColor}
                    props={{style: {transform: [{rotate: '180deg'}]}}}
                  />
                </TouchableOpacity>
              )}
            </React.Fragment>

            <View style={styles.yAxisContainer}>
              {yAxisLabels
                .map((value, index) => (
                  <Text key={index} style={styles.yAxisLabel}>
                    {value}
                  </Text>
                ))
                .reverse()}
            </View>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              style={{flex: 1}}>
              {newData?.map((item, index) => (
                <MileageByMonthListing
                  index={index}
                  item={item}
                  maxValue={yAxisConfig.max}
                />
              ))}
            </ScrollView>
            {monthMileage?.length > 3 && (
              <TouchableOpacity
                hitSlop={styles.hitSlop}
                onPress={handleArrowPress}>
                <CustomArrow fill={templateSpecs.btnPrimaryColor} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={{textAlign: 'center', flex: 1}}>
            No record for the current year!
          </Text>
        )}
      </View>
    </View>
  );
};

export default MileageByMonth;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: moderateScale(10),
    backgroundColor: colors.white,
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    marginHorizontal: moderateScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  headerIcon: {fontSize: moderateScale(18)},
  chartContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    alignItems: 'flex-end',
    marginTop: moderateScale(10),
    justifyContent: 'space-between',
  },
  milesLabel: {
    color: colors.primaryBlue,
    fontSize: moderateScale(12),
    marginTop: moderateScale(5),
  },
  divider: {
    width: 2,
    height: '100%',
    backgroundColor: colors.primaryBlue,
    marginHorizontal: moderateScale(10),
  },
  hitSlop: {
    top: moderateScale(20),
    left: moderateScale(20),
    right: moderateScale(20),
    bottom: moderateScale(20),
  },
  yAxisContainer: {
    height: 200,
    marginRight: 10,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    textAlign: 'right',
    color: colors.headerBlack,
    fontSize: moderateScale(12),
  },
});
