import {
  Text,
  View,
  Platform,
  FlatList,
  UIManager,
  ViewStyle,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import {
  useLazyTeamRequestListQuery,
  useLazyPeopleRequestListQuery,
} from '../services/Home.api';
import React from 'react';
import {colors} from '../utils';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import {moderateScale, RFValue} from '../utils/metrics';
import {CustomScreenLoader, CustomToogleButton, Listing} from './index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomThirtyDaysGraphProps {
  loading?: boolean;
  data?: object | undefined | any;
  containerStyle?: ViewStyle;
}

const RequestFollow = ({
  containerStyle,
  loading,
}: CustomThirtyDaysGraphProps) => {
  // Component Destructing
  const {TeamAndPeopleRequestListing} = Listing;
  // States
  const [team, setTeam] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const [userRequests, setUserRequests] = React.useState([]);
  const [teamRequests, setTeamRequests] = React.useState([]);
  // Redux state
  const {user} = useSelector((state: RootState) => state.loginReducer);
  //RTK_Query
  const [getUserFollowRequests, {isFetching: UF}] =
    useLazyPeopleRequestListQuery();
  const [getTeamFollowRequest, {isFetching: TF}] =
    useLazyTeamRequestListQuery();

  React.useEffect(() => {
    if (expanded) {
      team ? GetTeamFollowRequest_action() : GetUserFollowRequests_action();
    }
  }, [refresh, team, loading]);

  const GetUserFollowRequests_action = async () => {
    await getUserFollowRequests({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => setUserRequests(res?.data?.data));
  };
  const GetTeamFollowRequest_action = async () => {
    await getTeamFollowRequest({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => setTeamRequests(res?.data?.data));
  };

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const changeLayout = () => {
    GetUserFollowRequests_action();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const renderRequests = ({item}) => (
    <TeamAndPeopleRequestListing
      team={team}
      item={item}
      eventId={user?.preferred_event_id}
      data={team ? teamRequests : userRequests}
      setData={team ? setTeamRequests : setUserRequests}
    />
  );

  const ListEmptyComponent = () => {
    if (!UF && !TF) {
      return <Text style={styles.emptyList_view}>No record found!</Text>;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {(UF || TF) && <CustomScreenLoader />}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.headerText}>Follow Request</Text>
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
        <FlatList
          renderItem={renderRequests}
          data={team ? teamRequests : userRequests}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    </View>
  );
};

export default RequestFollow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1.5,
    padding: moderateScale(10),
    borderColor: colors.lightGrey,
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
  emptyList_view: {textAlign: 'center', color: colors.primary},
});
