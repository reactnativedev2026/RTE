import {
  Text,
  View,
  Platform,
  UIManager,
  ViewStyle,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';
import PieChart, {Slice} from 'react-native-pie-chart';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomThirtyDaysGraphProps {
  loading?: boolean;
  data?: undefined | Slice[];
  containerStyle?: ViewStyle;
}

const MileageByActivityType = ({
  data = [],
  containerStyle,
}: CustomThirtyDaysGraphProps) => {
  const widthAndHeight = 130;
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const changeLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mileage By Activity Type</Text>
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
          {height: expanded ? 'auto' : 0, overflow: 'hidden'},
        ]}>
        <View style={{flexDirection: 'row'}}>
          {data?.length > 0 ? (
            <PieChart series={data} widthAndHeight={widthAndHeight} />
          ) : (
            <Text style={styles.noRecord}>No mileage data available</Text>
          )}
          <View style={styles.modalitilesMainView}>
            {data?.map((item: any) => (
              <View style={styles.modalitiesView}>
                <View style={styles?.modalities}>
                  <View
                    style={[
                      styles.modalitiesColor,
                      {backgroundColor: item?.color},
                    ]}
                  />
                  <Text style={styles.modalitiesText}>{item?.name}</Text>
                </View>
                <View style={styles.milesContainer}>
                  <Text style={styles.milesText}>{item?.value} miles</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default MileageByActivityType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(10),
    backgroundColor: colors.white,
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    marginHorizontal: moderateScale(10),
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
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
  noRecord: {textAlign: 'center', marginTop: 20},
  modalitilesMainView: {
    flex: 2,
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(10),
  },
  modalitiesView: {flexDirection: 'row', flex: 2, alignItems: 'center'},
  modalities: {flexDirection: 'row', alignItems: 'center', flex: 1},
  modalitiesColor: {width: 15, height: 15, flexDirection: 'row'},
  modalitiesText: {paddingLeft: 5},
  milesContainer: {flex: 1},
  milesText: {textAlign: 'right'},
});
