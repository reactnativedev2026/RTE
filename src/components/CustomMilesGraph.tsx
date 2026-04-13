import React, { useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { store } from '../core/store';
import { colors } from '../utils/colors';
import { getFloatNumber, getTemplateSpecs, templateName } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import CustomArrow from './CustomArrow';

interface CustomMilesGraphProps {
  loading?: boolean;
  chartMiles?: object | undefined | any;
  containerStyle?: ViewStyle;
}

const CustomMilesGraph = ({
  loading,
  chartMiles,
  containerStyle,
}: CustomMilesGraphProps) => {
  const scrollViewRef = useRef(null);
  const [currentScrollPosition, setCurrentScrollPosition] = React.useState(0);
  const isHerosTemplate = Boolean(
    store.getState().loginReducer.eventDetail?.template ==
      templateName?.HEROS_JOURNEY,
  );
  const graphColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.graphColor;

  const milesChart = chartMiles?.miles;

  const maxValue =
    milesChart?.chart?.length > 0
      ? Math.max(...milesChart?.chart?.map(item => item?.miles))
      : 0;
  const templateSpecs = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  );

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

  const handleScroll = event => {
    setCurrentScrollPosition(event.nativeEvent.contentOffset.x);
  };

  const getOrdinal = num => {
    if (!num) {
      return '';
    }
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };
  if (loading) {
    return (
      <View style={[styles.container]}>
        <ActivityIndicator
          color={colors.primaryGrey}
          size={'small'}
          style={{marginVertical: moderateScale(20)}}
        />
      </View>
    );
  }

  if (milesChart?.total > 0 && !loading) {
    return (
      <View style={[styles.container, containerStyle]}>
        {/* {chartMiles?.event_streak_count && <Text style={styles.targetHeaderText} numberOfLines={2}>
          {`This is your ${getOrdinal(
            chartMiles?.event_streak_count,
          )} year of ${isHerosTemplate ? 'Hero Journey' : 'Run the Year'}!`}
        </Text>} */}
        {/* <Text style={styles.lifetimeMiles}>Lifetime Miles</Text> */}
        <Text style={styles.miles({color: templateSpecs.bottomTabIconColor})}>
          {`${getFloatNumber(milesChart?.total)} miles`}
        </Text>
        <View style={styles.greySeparatorLine} />
        <View style={styles.chartContainer}>
          {milesChart?.chart?.length > 3 && (
            <TouchableOpacity
              hitSlop={styles.hitSlop}
              onPress={handleBackArrowPress}>
              <CustomArrow
                fill={templateSpecs.btnPrimaryColor}
                props={{style: {transform: [{rotate: '180deg'}]}}}
              />
            </TouchableOpacity>
          )}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            style={{flex: 1}}>
            {milesChart?.chart?.map((item, index) => {
              const barHeight = maxValue ? (item?.miles / maxValue) * 150 : 0;

              return (
                <View key={index} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor:
                          index === 0 ? graphColor : colors.lightGrey,
                      },
                    ]}
                  />
                  <Text style={styles.milesLabel}>
                    {getFloatNumber(item?.miles)} miles
                  </Text>
                  <Text
                    style={[
                      styles.yearLabel,
                      {color: index === 0 ? graphColor : item.color},
                    ]}>
                    {item?.year}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          {milesChart?.chart?.length > 3 && (
            <TouchableOpacity
              hitSlop={styles.hitSlop}
              onPress={handleArrowPress}>
              <CustomArrow fill={templateSpecs.btnPrimaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
};

export default CustomMilesGraph;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: moderateScale(10),
    backgroundColor: colors.white,
    padding: moderateScale(10),
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  targetHeaderText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: 'black',
    marginTop: moderateScale(5),
    textAlign: 'center',
    paddingHorizontal: moderateScale(5),
  },
  lifetimeMiles: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: 'black',
    marginTop: moderateScale(5),
    textAlign: 'center',
  },
  miles: (props?: {color?: string}): TextStyle => ({
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: props?.color || colors.primaryBlue,
    marginTop: moderateScale(5),
    textAlign: 'center',
  }),
  greySeparatorLine: {
    borderTopWidth: moderateScale(0.5),
    borderColor: colors.gray,
    marginTop: moderateScale(20),
  },
  chartContainer: {
    marginTop: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: moderateScale(10),
  },
  bar: {
    width: moderateScale(30),
    borderRadius: moderateScale(4),
    backgroundColor: 'red',
  },
  milesLabel: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(5),
    color: '#333',
  },
  yearLabel: {
    fontSize: moderateScale(14),
    marginTop: moderateScale(5),
  },
  hitSlop: {
    top: moderateScale(20),
    bottom: moderateScale(20),
    right: moderateScale(20),
    left: moderateScale(20),
  },
});
