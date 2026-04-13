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
import {
  useLazyGetTeamFollowersQuery,
  useLazyGetPeopleFollowersQuery,
} from '../services/Home.api';
import React from 'react';
import {colors} from '../utils';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import {moderateScale, RFValue} from '../utils/metrics';
import {CustomScreenLoader, CustomToogleButton, Listing} from './index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomFollowersProps {
  loading?: boolean;
  data?: object | undefined | any;
  containerStyle?: ViewStyle;
}

const CustomFollowers = ({containerStyle, loading}: CustomFollowersProps) => {
  // Component Destructing
  const {FollowersListView} = Listing;
  // States
  const [team, setTeam] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [UserFollowers, setUserFollowers] = React.useState([]);
  const [teamFollowers, setTeamFollowers] = React.useState([]);
  // Redux state
  const {user} = useSelector((state: RootState) => state.loginReducer);
  //RTK_Query
  const [getUserFollowers, {isFetching: UF}] = useLazyGetPeopleFollowersQuery();
  const [getTeamFollowers, {isFetching: TF}] = useLazyGetTeamFollowersQuery();

  React.useEffect(() => {
    if (expanded) {
      team ? GetTeamFollowers_action() : GetUserFollowers_action();
    }
  }, [refresh, team, loading]);

  const GetUserFollowers_action = async () => {
    await getUserFollowers({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => setUserFollowers(res?.data?.data))
      .catch(error => {
        console.log('sdsdsdd', error);
      });
  };
  const GetTeamFollowers_action = async () => {
    if (user?.preferred_team_id) {
      await getTeamFollowers({team_id: user?.preferred_team_id})
        .unwrap()
        .then(res => setTeamFollowers(res?.data?.data))
        .catch(err => {
          console.log('Error => ', err);
        });
    }
  };

  const followers = (key: boolean) => {
    switch (key) {
      case false:
        return (
          <FollowersListView
            hideMore
            data={UserFollowers}
            team={key}
            loading={UF}
          />
        );
      case true:
        return (
          <FollowersListView
            hideMore
            data={teamFollowers}
            team={key}
            loading={TF}
          />
        );
    }
  };

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const changeLayout = () => {
    GetUserFollowers_action();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {(UF || TF) && <CustomScreenLoader />}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.headerText}>Followers</Text>
          <MaterialCommunityIcons
            size={20}
            color={'#000'}
            name={'reload'}
            style={{paddingHorizontal: 5}}
            onPress={() => setRefresh(state => !state)}
          />
        </View>
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
          {minHeight: expanded ? 150 : 0, maxHeight: expanded ? 300 : 0},
        ]}>
        <CustomToogleButton
          team={team}
          text2={'Team'}
          text1={'People'}
          setTeam={setTeam}
        />
        <View style={styles.horizontalDevidingLine_view} />
        {followers(team)}
      </View>
    </View>
  );
};

export default CustomFollowers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1.5,
    padding: moderateScale(10),
    backgroundColor: colors.white,
    borderColor: colors.lightGrey,
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
  progressBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.lightGrey,
    marginHorizontal: moderateScale(5),
  },
  horizontalDevidingLine_view: {
    height: 0.5,
    width: '90%',
    marginVertical: 10,
    alignSelf: 'center',
    backgroundColor: colors.secondaryGrey,
  },
  toggleButton: {paddingHorizontal: 20},
  headerIcon: {fontSize: moderateScale(18)},
  itemName: {flex: 1, fontSize: RFValue(12)},
  progressBarFill: {height: '100%', borderRadius: 10},
  headerText: {fontSize: moderateScale(16), fontWeight: 'bold'},
  chartContainer: {overflow: 'hidden', marginTop: moderateScale(10)},
});
