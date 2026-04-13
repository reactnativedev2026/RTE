import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { store } from '../core/store';
import { colors } from '../utils';
import { MONTHS } from '../utils/dummyData';
import { getFloatNumber, getTemplateSpecs, getYAxisConfig, isWhite } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import CustomArrow from './CustomArrow';
import CustomHorizontalLine from './CustomHorizontalLine';

interface YearlyMilesChartYear {
  id: string;
  year: number;
  bgClr: string;
  month: {name: string; total_miles: number}[];
}

interface YearlyMilesChartProps {
  loading?: boolean;
  data?: YearlyMilesChartYear[];
  containerStyle?: ViewStyle;
}

const YearlyMilesChart = ({
  data = [],
  containerStyle,
}: YearlyMilesChartProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPositionRef = useRef(0);
  const [expanded, setExpanded] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const changeLayout = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  }, []);

  const scrollHorizontally = useCallback(
    (direction: 'forward' | 'backward') => {
      const newScrollPosition =
        direction === 'forward'
          ? scrollPositionRef.current + 200
          : Math.max(scrollPositionRef.current - 200, 0);

      scrollViewRef.current?.scrollTo({x: newScrollPosition, animated: true});
      scrollPositionRef.current = newScrollPosition;
    },
    [],
  );

  const handleScroll = useCallback(
    (event: {nativeEvent: {contentOffset: {x: number}}}) => {
      scrollPositionRef.current = event.nativeEvent.contentOffset.x;
    },
    [],
  );

  const templateSpecs = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  );

  // Calculate max value from data
  const maxValue =
    data && data.length > 0
      ? Math.max(
          ...data.flatMap((year: YearlyMilesChartYear) =>
            year.month.map((entry: {total_miles: number}) => entry.total_miles),
          ),
        )
      : 0;

  const yAxisConfig = getYAxisConfig(maxValue);
  const yAxisLabels = Array.from(
    {length: yAxisConfig.labels},
    (_, i) => i * yAxisConfig.increment,
  );

  const handlePress = item => {
    setSelectedMonth(item);
    setModalVisible(true);
  };

  const {graphMonths} = useMemo(() => {
    if (!data?.length) {
      return {graphMonths: []};
    }

    const graphData = MONTHS?.map((month, index) => ({
      id: String(index + 1),
      year: month,
      data: data?.map((year: YearlyMilesChartYear) => ({
        miles: year.month[index]?.total_miles || 0,
        bgColor: year.bgClr,
      })),
    }));

    return {
      graphMonths: graphData,
    };
  }, [data]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Yearly Miles by Month</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={changeLayout}>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={30}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {expanded && <CustomHorizontalLine customStyle={styles.lineSpacing} />}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedMonth?.year} Summary</Text>

            {selectedMonth?.data?.map((d, i) => (
              <View key={i} style={styles.modalDataRow}>
                <View style={[styles.colorDot, {backgroundColor: d.bgColor}]} />
                <Text style={styles.modalText}>Miles: {getFloatNumber(d.miles)+ ' Miles'}</Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.chartContainer,
          {height: expanded ? 'auto' : 0, overflow: 'hidden'},
        ]}>
        {data?.length > 0 ? (
          <>
            {data?.length > 3 && (
              <TouchableOpacity
                hitSlop={styles.hitSlop}
                onPress={() => scrollHorizontally('backward')}>
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
              {graphMonths.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handlePress(item)}
                  style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View style={styles.customBarsContainer}>
                      {item?.data?.map((value, idx) => {
                        const barHeight = (value.miles / yAxisConfig.max) * 200;
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.customBar,
                              {
                                height: barHeight,
                                backgroundColor: value.bgColor,
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <Text style={styles.yearLabel}>{item.year}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {data?.length > 3 && (
              <TouchableOpacity
                hitSlop={styles.hitSlop}
                onPress={() => scrollHorizontally('forward')}>
                <CustomArrow fill={templateSpecs.btnPrimaryColor} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={{textAlign: 'center', flex: 1}}>No record found!</Text>
        )}
      </View>

      {expanded && <CustomHorizontalLine customStyle={styles.lineSpacing} />}

      {expanded && data?.length > 0 && (
        <View style={styles.yearContainer}>
          {data?.map((item: YearlyMilesChartYear) => (
            <View style={[styles.yearButton, {backgroundColor: item?.bgClr}]}>
              <Text
                style={[
                  styles.yearText,
                  {color: isWhite(item?.bgClr) ? colors.black : colors.white},
                ]}>
                {item?.year?.toString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default React.memo(YearlyMilesChart);

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.white,
    marginBottom: moderateScale(20),
    borderRadius: moderateScale(30),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(10),
  },
  header: {
    marginHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: moderateScale(20),
    justifyContent: 'space-between',
  },
  barWrapper: {
    // alignItems: 'center',
    width: moderateScale(50),
    justifyContent: 'flex-end',
  },
  barContainer: {
    flex: 1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: moderateScale(3),
    paddingRight: moderateScale(42),
  },
  yearLabel: {
    height: 14,
    marginTop: 15,
    fontWeight: '700',
    color: colors.primaryGrey,
    fontSize: moderateScale(10),
  },
  hitSlop: {
    top: moderateScale(20),
    left: moderateScale(20),
    right: moderateScale(20),
    bottom: moderateScale(20),
  },
  lineSpacing: {marginBottom: moderateScale(5), marginTop: moderateScale(15)},
  customBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: moderateScale(20),
    height: 200,
    justifyContent: 'space-between',
  },
  customBar: {
    width: moderateScale(2),
    borderRadius: moderateScale(5),
    marginHorizontal: moderateScale(1),
  },
  yearContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: moderateScale(10),
  },
  yearButton: {
    borderRadius: 20,
    margin: moderateScale(5),
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(8),
  },
  yearText: {fontSize: moderateScale(10), lineHeight: moderateScale(14)},
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#444',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
