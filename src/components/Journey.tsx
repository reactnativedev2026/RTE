import {
  Text,
  View,
  Platform,
  UIManager,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {colors} from '../utils';
import LeafletMap from './Leafletmap';
import {moderateScale} from '../utils/metrics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface JourneyProps {
  loading?: boolean;
  distance?: object | any;
  containerStyle?: ViewStyle;
}

const Journey = ({containerStyle, distance}: JourneyProps) => {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const changeLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  return (
    <View
      style={[
        !expanded ? styles.mainContainer : styles.expandedContainer,
        containerStyle,
      ]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Journey</Text>
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
          {
            height: expanded ? null : 0,
            overflow: 'hidden',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          },
        ]}>
        <LeafletMap
          distance={distance}
          containerStyle={{marginHorizontal: 0}}
          showHeader={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingVertical: moderateScale(8),
    backgroundColor: colors.white,
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    marginHorizontal: moderateScale(10),
  },
  expandedContainer: {
    flex: 1,
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
    marginTop: 13,
    paddingHorizontal: moderateScale(10),
  },
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  headerIcon: {fontSize: moderateScale(18)},
  chartContainer: {
    marginTop: moderateScale(13),
  },
});

export default Journey;
