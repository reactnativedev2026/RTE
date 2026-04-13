/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import {
  CustomHeader,
  CustomModal,
  CustomScreenLoader,
  CustomScreenWrapper,
} from '../../components';
import {RootState, store} from '../../core/store';
import {useAdjustKeyboard} from '../../hooks';
import useJoinTeam from '../../hooks/useJoinTeam';
import {goBack, replace} from '../../services/NavigationService';
import {
  useAcceptTeamMemberRequestMutation,
  useDeclineTeamMemberRequestMutation,
  useLazyGetTeamDetailQuery,
} from '../../services/teams.api';
import {colors} from '../../utils';
import {fonts} from '../../utils/fonts';
import {IOS, moderateScale} from '../../utils/metrics';
import {Routes} from '../../utils/Routes';
import {setTeamDetail, setUser} from '../AuthScreen/login/login.slice';
import {getMembershipStatus, teamMembershipStatus} from '../Teams/helper';
import TeamFooter from './TeamFooter';

// Custom debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const JoinTeamContainer = () => {
  useAdjustKeyboard();
  const {
    teamData,
    isFetching,
    requestIsLoading,
    goToNextPage,
    goToPreviousPage,
    handleJoinTeam,
    resetTeams,
    search,
    setSearch,
    teamApiData,
    pullToRefreshTeams,
    cancelMemberRequest_action,
  } = useJoinTeam();

  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [acceptMemberRequest, {isLoading: isAccepting}] =
    useAcceptTeamMemberRequestMutation();
  const [declineMemberRequest, {isLoading: isDeclining}] =
    useDeclineTeamMemberRequestMutation();
  const [getTeamDetails] = useLazyGetTeamDetailQuery();

  const [refreshing, setRefreshing] = React.useState(false);
  const [showRespond, setShowRespond] = React.useState(false);
  // Debounced search input
  const [searchInput, setSearchInput] = React.useState('');
  const debouncedSearchInput = useDebouncedValue(searchInput, 300);
  const didMountRef = React.useRef(false);

  useEffect(() => {
    // resetTeams();
    // setSearchInput('');
    setSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call API immediately when searchInput is cleared
  useEffect(() => {
    if (searchInput === '') {
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Debounced search effect
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setSearch(debouncedSearchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  const handleRefreshControl = () => {
    pullToRefreshTeams();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const AceeptRequest = async item => {
    const body = {team_id: item?.id, event_id: item?.event_id};
    setShowRespond(false);
    try {
      await acceptMemberRequest(body).unwrap();
      const teamDetails = await getTeamDetails({
        teamId: item?.id,
        body: {event_id: item?.event_id},
      }).unwrap();
      store.dispatch(setTeamDetail(teamDetails?.data));
      store.dispatch(
        setUser({...user, has_team: true, preferred_team_id: item?.id}),
      );
      replace(Routes.MEMEBR_ON_TEAM);
    } catch (error) {
      console.error('Error responding to team request:', error);
    }
  };

  const DeclineRequest = async item => {
    const body = {
      team_id: item?.id,
      event_id: item?.event_id,
    };
    setShowRespond(false);
    try {
      const response = await declineMemberRequest(body).unwrap();
      goBack();
      console.log('DeclineMemberRequest data', response);
    } catch (error) {
      console.log('Respond team error', error);
    }
  };

  const isLoading = isAccepting || isDeclining;
  const Item = ({item}: {item: any}) => {
    const isRequested =
      item?.membership_status == teamMembershipStatus?.REQUESTED;
    return (
      <View style={styles.ListContainer} key={item?.toString()}>
        <View style={styles.listView}>
          <View>
            <Text numberOfLines={1} style={styles.QuestTitle}>
              {item?.name}
            </Text>
            <Text style={{color: colors.darkBlue}}>
              {isRequested && 'requested'}
            </Text>
          </View>
          {/* <TouchableOpacity onPress={() => navigate(Routes.MEMEBR_ON_TEAM)}>
          <View style={styles.Listcard}>
            <Text style={styles.listItem}>{data.city}</Text>
            <Text style={styles.listItem}>{data.dept}</Text>
          </View>
        </TouchableOpacity> */}

          <View style={styles.customrow}>
            {!item?.public_profile && (
              <Feather name={'lock'} size={18} color={colors.darkPurple} />
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (
                  item?.membership_status ==
                  teamMembershipStatus?.JOIN_IN_PROGRESS
                ) {
                  setShowRespond(true);
                } else if (isRequested) {
                  cancelMemberRequest_action(item?.id);
                } else {
                  handleJoinTeam(item?.id, item?.public_profile);
                }
              }}
              disabled={
                item?.membership_status ==
                (teamMembershipStatus?.JOIN_IN_PROGRESS ||
                  teamMembershipStatus?.JOINED)
              }>
              <Text style={styles.editGoalTxt}>
                {isRequested
                  ? 'Cancel'
                  : getMembershipStatus(item?.membership_status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {showRespond && (
          <CustomModal
            visible={showRespond}
            onClose={() => DeclineRequest(item)}
            onConfirm={() => AceeptRequest(item)}
            title="Are you sure you want to accept the request?"
            cancelButtonTitle="Reject"
            confirmButtonTitle="Accept"
            showDescription={false}
            onCloseIcon={() => setShowRespond(false)}
          />
        )}
      </View>
    );
  };

  return (
    <CustomScreenWrapper
      removeScroll={true}
      loadingIndicator={requestIsLoading}>
      <View style={styles.Maincontainer}>
        {isLoading && <CustomScreenLoader />}
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.heading}>Join a Team</Text>
        <View style={styles.inputContainer}>
          <AntDesign name={'search1'} size={20} color={colors.primaryGrey} />
          <TextInput
            style={styles.textInputStyle}
            placeholder="Search"
            placeholderTextColor={colors.lightGrey}
            value={searchInput}
            onChangeText={setSearchInput}
            autoCorrect={false}
          />
        </View>
        {debouncedSearchInput.length > 0 && isFetching && (
          <View style={styles.searchLoaderContainer}>
            <ActivityIndicator size="large" color={colors.darkBlue} />
          </View>
        )}
        <View style={styles.brRow} />
        {/* {isFetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              animating={isFetching}
              size="small"
              color={colors.darkBlue}
            />
          </View>
        ) : ( */}
        <FlatList
          data={teamData}
          extraData={teamData}
          renderItem={Item}
          contentContainerStyle={{flexGrow: 1}}
          bounces={false}
          style={{flex: 1}}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => {
            if (!isFetching) {
              return (
                <View style={styles.centerContainer}>
                  <Text style={styles.notFoundText}>Teams not found!</Text>
                </View>
              );
            } else {
              return (
                <View style={styles.centerContainer}>
                  <ActivityIndicator
                    animating={isFetching}
                    size="small"
                    color={colors.darkBlue}
                  />
                </View>
              );
            }
          }}
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              onRefresh={handleRefreshControl}
              tintColor={colors.white}
            />
          }
        />
        {/* )} */}

        <View style={styles.brRow} />

        <TeamFooter
          isFetching={isFetching}
          onPressNext={goToNextPage}
          onPressPrevious={goToPreviousPage}
          teamApiData={teamApiData}
        />
      </View>
    </CustomScreenWrapper>
  );
};

export default JoinTeamContainer;

const styles = StyleSheet.create({
  Maincontainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    flex: 1,
  },
  heading: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: moderateScale(20),
    color: colors.primaryGrey,
  },
  inputContainer: {
    borderWidth: moderateScale(2),
    borderColor: '#EDEDED',
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(2),
    marginTop: moderateScale(10),
  },
  textInputStyle: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
    fontFamily: fonts.Light,
    color: 'black',
    padding: 0,
    margin: 0,
    paddingVertical: IOS ? moderateScale(5) : moderateScale(2.5),
    textAlign: 'right',
  },
  brRow: {
    width: '100%',
    borderColor: colors.lightGrey,
    borderWidth: 0.2,
    marginTop: 10,
    height: 1,
  },
  itemCard: {flex: 1},
  ListContainer: {
    flex: 1,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listView: {
    flex: 1,
    paddingBottom: moderateScale(6.5),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  Listcard: {flexDirection: 'row', marginTop: 5},
  QuestTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.headerBlack,
    flex: 1,
  },
  listItem: {color: 'grey', paddingRight: 30},
  button: {
    width: moderateScale(125),
    backgroundColor: colors.lightGrey,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  customrow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  centerContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  notFoundText: {fontSize: 16, color: colors.lightGrey, textAlign: 'center'},
  editGoalTxt: {color: colors.white, fontWeight: '400'},
  searchLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
