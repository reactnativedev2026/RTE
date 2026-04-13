import React from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import useCustomHomeWrapper from '../hooks/useCustomHomeWrapper';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';
import CustomTeamStatistics from './CustomTeamStatistics';

interface MemberTotalsProps {
  loading?: boolean;
  data?: object | undefined | any;
  containerStyle?: ViewStyle;
}

const MemberTotals = ({containerStyle}: MemberTotalsProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const {
    chartMiles,
    achievementsFetching,
    teamAchievementsData,
    teamFetching,
    achievementsData,
  } = useCustomHomeWrapper({
    preferredEventId: user?.preferred_event_id,
    preferredTeamId: user?.preferred_team_id,
  });
  const isFetching = achievementsFetching || teamFetching;
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
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Member Totals</Text>
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
        <CustomTeamStatistics
          completeProfile={teamAchievementsData}
          isFetching={achievementsFetching || teamFetching}
          showBestDays={false}
          showHeading={false}
        />
      </View>
    </View>
  );
};

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
    marginHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  headerIcon: {fontSize: moderateScale(18)},
  chartContainer: {
    marginTop: moderateScale(13),
  },
});

export default MemberTotals;
