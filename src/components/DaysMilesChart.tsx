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
import Svg, {Circle, Line, Polyline} from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Tooltip from 'react-native-walkthrough-tooltip';
import {store} from '../core/store';
import {colors} from '../utils';
import {rteDateMonthFormat} from '../utils/dateFormats';
import {getTemplateSpecs, getYAxisConfig} from '../utils/helpers';
import {moderateScale} from '../utils/metrics';
import CustomArrow from './CustomArrow';
import CustomHorizontalLine from './CustomHorizontalLine';

interface DaysMilesChartDataItem {
  date: string;
  daily_total: number | string;
  seven_day_avg: number | string;
}

interface DaysMilesChartProps {
  loading?: boolean;
  data?: DaysMilesChartDataItem[];
  containerStyle?: ViewStyle;
}

const DaysMilesChart = ({data, containerStyle}: DaysMilesChartProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [showMiles, setShowMiles] = React.useState(false);
  const [selectedMiles, setSelectedMiles] = React.useState<{
    thatDay: number | string;
    average: number | string;
  } | null>(null);
  const [currentScrollPosition, setCurrentScrollPosition] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<
    number | undefined
  >();

  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const getTemplete = store.getState().loginReducer.eventDetail?.template;
  const chartHeight = 200;
  const templateSpecs = getTemplateSpecs(getTemplete);
  const svgColor = getTemplateSpecs(getTemplete)?.svgColor;
  const graphColor = getTemplateSpecs(getTemplete)?.statsColor;

  React.useEffect(() => {
    Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }, []);

  const changeLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    setShowMiles(false);
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

  const maxValue =
    data && data.length > 0
      ? Math.max(
          ...data.map((item: DaysMilesChartDataItem) =>
            parseFloat(item.daily_total as string),
          ),
        )
      : 0;

  const yAxisConfig = getYAxisConfig(maxValue);
  const yAxisLabels = Array.from(
    {length: yAxisConfig.labels},
    (_, i) => i * yAxisConfig.increment,
  );

  const handleCirclePress = ({
    thatDay,
    average,
  }: {
    thatDay: number | string;
    average: number | string;
  }) => {
    setSelectedMiles({thatDay, average});
    setShowMiles(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Last 30 Days</Text>
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
      {expanded && (
        <>
          <View>
            <View style={[styles.headingLine, {backgroundColor: svgColor}]} />
            <View style={[styles.headingCircle, {backgroundColor: svgColor}]} />
            <Text style={styles.headingText}>
              Average Distance Over Previous 7 Days
            </Text>
          </View>
          {showMiles && (
            <View style={styles.milesContainer}>
              <View style={styles.showMiles}>
                <Text style={styles.milesText}>Distance that day:</Text>
                {selectedMiles && (
                  <Text style={styles.milesText}>
                    {`${selectedMiles?.thatDay} miles`}
                  </Text>
                )}
              </View>
              <View style={styles.showMiles}>
                <Text style={styles.milesText}>
                  Average over previous 7 days:
                </Text>
                <Text style={styles.milesText}>
                  {' '}
                  {`${selectedMiles?.average} miles`}
                </Text>
              </View>
            </View>
          )}
          <CustomHorizontalLine
            customStyle={[styles.lineSpacing, {marginTop: moderateScale(15)}]}
          />
        </>
      )}
      {maxValue > 0 ? (
        <View
          style={[
            styles.chartContainer,
            {height: expanded ? null : 0, overflow: 'hidden'},
          ]}>
          {data?.length && data.length > 3 && (
            <TouchableOpacity
              hitSlop={styles.hitSlop}
              onPress={handleBackArrowPress}>
              <CustomArrow
                fill={templateSpecs.btnPrimaryColor}
                props={{style: {transform: [{rotate: '180deg'}]}}}
              />
            </TouchableOpacity>
          )}
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
            {(data ?? [])
              .slice()
              .reverse()
              .map((item, index) => {
                const barHeight =
                  (parseFloat(item?.daily_total as string) / yAxisConfig.max) *
                  chartHeight;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={{flex: 1}}>
                      <Tooltip
                        isVisible={visible}
                        content={<Text>{barHeight}</Text>}
                        placement="bottom"
                        onClose={() => setVisible(false)}>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.bar,
                              {height: barHeight, backgroundColor: graphColor},
                            ]}
                          />
                        </View>
                      </Tooltip>
                    </View>
                    <Text style={styles.yearLabel}>
                      {rteDateMonthFormat(String(item?.date), timezone)}
                    </Text>
                  </View>
                );
              })}

            {/* SVG Polyline for 7-day average */}
            <Svg
              height={chartHeight}
              width={(data?.length ?? 0) * 50}
              style={styles.svgOverlay}>
              {/* Bottom axis line */}
              <Line
                x1={0}
                y1={chartHeight}
                x2={(data?.length ?? 0) * 50}
                y2={chartHeight}
                stroke="black"
                strokeWidth={1}
              />
              {/* Vertical grid lines */}
              {Array.from({length: (data?.length ?? 0) + 1}).map((_, i) => (
                <Line
                  key={i}
                  x1={i * 50}
                  y1={0}
                  x2={i * 50}
                  y2={chartHeight}
                  stroke="black"
                  strokeWidth={1}
                />
              ))}
              {/* Polyline for the 7-day average */}
              <Polyline
                points={(data ?? [])
                  .slice()
                  .reverse()
                  .map((item, index) => {
                    const x = index * 50 + 25;
                    const y =
                      chartHeight -
                      (parseFloat(item.seven_day_avg as string) /
                        yAxisConfig.max) *
                        chartHeight;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={svgColor}
                strokeWidth={2}
              />
              {/* Circles for each point */}
              {(data ?? [])
                .slice()
                .reverse()
                .map((item, index) => {
                  const x = index * 50 + 25;
                  const y =
                    chartHeight -
                    (parseFloat(item.seven_day_avg as string) /
                      yAxisConfig.max) *
                      chartHeight;
                  return (
                    <Circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={6}
                      fill={index === selectedIndex ? 'red' : svgColor}
                      onPress={() => {
                        handleCirclePress({
                          thatDay: item?.daily_total,
                          average: item?.seven_day_avg,
                        });
                        setSelectedIndex(index);
                      }}
                      stroke={colors.white}
                    />
                  );
                })}
            </Svg>
          </ScrollView>
          {data?.length && data.length > 3 && (
            <TouchableOpacity
              hitSlop={styles.hitSlop}
              onPress={handleArrowPress}>
              <CustomArrow fill={templateSpecs.btnPrimaryColor} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={{marginBottom: 10}}>
          {expanded && (
            <Text style={{textAlign: 'center'}}>No Record Found!</Text>
          )}
        </View>
      )}
    </View>
  );
};

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
    marginHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  headerIcon: {fontSize: moderateScale(18)},
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: moderateScale(10),
    justifyContent: 'space-between',
  },
  barWrapper: {
    alignItems: 'center',
    width: 50,
    justifyContent: 'flex-end',
    padding: 0,
    margin: 0,
  },
  barContainer: {
    flex: 1,
    height: 200,
    // borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
  },
  bar: {
    width: 30,
    borderTopLeftRadius: moderateScale(4),
    borderTopRightRadius: moderateScale(4),
  },
  yearLabel: {
    fontWeight: '700',
    color: colors.primaryGrey,
    fontSize: moderateScale(10),
    marginTop: moderateScale(15),
  },
  hitSlop: {
    top: moderateScale(20),
    left: moderateScale(20),
    right: moderateScale(20),
    bottom: moderateScale(20),
  },
  svgOverlay: {position: 'absolute', left: 0, top: 0},
  lineSpacing: {marginVertical: moderateScale(5)},
  headingLine: {
    top: 7,
    left: 11,
    width: 0,
    height: 1,
  },
  headingCircle: {
    top: 1.5,
    left: 19,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 50,
    position: 'absolute',
    borderColor: colors.white,
  },
  headingText: {
    fontWeight: '600',
    color: colors.primaryGrey,
    fontSize: moderateScale(10),
    marginLeft: moderateScale(50),
  },
  milesContainer: {
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: moderateScale(305),
    height: moderateScale(55),
    padding: moderateScale(10),
    backgroundColor: colors.grey,
    marginTop: moderateScale(10),
    borderRadius: moderateScale(8),
  },
  showMiles: {flexDirection: 'row', justifyContent: 'space-between'},
  milesText: {fontSize: moderateScale(11), fontWeight: '700'},
  yAxisContainer: {
    height: 200,
    marginRight: 10,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    color: colors.headerBlack,
    fontSize: moderateScale(12),
    textAlign: 'right',
  },
});

export default DaysMilesChart;
