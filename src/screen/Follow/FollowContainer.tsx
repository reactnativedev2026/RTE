/* eslint-disable react/no-unstable-nested-components */
import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useSelector} from 'react-redux';
import {
  CustomHeader,
  CustomScreenLoader,
  CustomScreenWrapper,
  CustomToogleButton,
  Listing,
} from '../../components';
import {RootState} from '../../core/store';
import {useAdjustKeyboard} from '../../hooks';
import useFollowTeam from '../../hooks/useFollowTeam';
import usePeopleFollow from '../../hooks/usePeopleFollow';
import {
  useCancelPeopleFollowRequestMutation,
  useCancelTeamFollowRequestMutation,
  useSentPeopleFollowRequestMutation,
  useSentTeamFollowRequestMutation,
} from '../../services/Home.api';
import {colors} from '../../utils';
import {fonts} from '../../utils/fonts';
import {IOS, moderateScale} from '../../utils/metrics';
import {peopleFollowStates} from '../Teams/helper';
import FollowFooter from './FollowFooter';

// Custom debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const FollowContainer = () => {
  const {params} = useRoute<RouteProp<{params: {team?: boolean}}, 'params'>>();
  const {TeamAndPeopleListing} = Listing;
  useAdjustKeyboard();
  const {
    peopleData,
    peopleIsFetching,
    peopleNextPage,
    peoplePreviousPage,
    searchPeople,
    searchSetPeople,
    setPeopleData,
    peopleApiData,

    pullToRefreshPeople,
  } = usePeopleFollow();

  const {
    teamData,
    isFetching,
    goToNextPage,
    goToPreviousPage,
    resetTeams,
    search,
    setTeamData,
    setSearch,
    teamApiData,
    pullToRefreshTeams,
  } = useFollowTeam();

  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [sendPeopleFollowrequest, {isLoading: peopleRequestLoading}] =
    useSentPeopleFollowRequestMutation();
  const [sendTeamFollowrequest, {isLoading: teamRequestLoading}] =
    useSentTeamFollowRequestMutation();
  const [cancelPeopleFollowingRequest, {isLoading: CPRLoading}] =
    useCancelPeopleFollowRequestMutation();
  const [cancelTeamFollowingRequest, {isLoading: CTRLoading}] =
    useCancelTeamFollowRequestMutation();

  const [refreshing, setRefreshing] = React.useState(false);
  const [team, setTeamState] = React.useState(params?.team);
  const setTeam = (value: boolean) => {
    setTeamState(value);
    setSearchInput('');
  };
  // Add local state for debounced search input
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchInput = useDebouncedValue(searchInput, 300);
  const didMountRef = React.useRef(false);
  // Call API immqediately when searchInput is cleared
  useEffect(() => {
    if (searchInput === '') {
      if (team) {
        setSearch('');
      } else {
        searchSetPeople('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, team]);

  // Debounced search effect
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (team) {
      setSearch(debouncedSearchInput);
    } else {
      searchSetPeople(debouncedSearchInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput, team]);

  const handleRefreshControl = () => {
    team ? pullToRefreshTeams() : pullToRefreshPeople();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const SendFollowRequest = ({
    id,
    index,
    isPublic,
  }: {
    id: number;
    index: number;
    isPublic: boolean;
  }) => {
    if (team) {
      const body = {event_id: user?.preferred_event_id, team_id: id};
      if (
        teamData[index]?.follow_status ==
          peopleFollowStates?.TEAM_PEOPLE_NOT_FOLLOW ||
        teamData[index]?.follow_status ==
          peopleFollowStates?.TEAM_NOT_FOLLOW_PRIVATE
      ) {
        sendTeamFollowrequest(body)
          .unwrap()
          .then(() => {
            setTeamData(prev => {
              if (!prev) {
                return prev;
              } // Ensure prev exists
              const updated = [...prev]; // Clone the array to maintain immutability
              updated[index] = {
                ...updated[index],
                follow_status: peopleFollowStates?.REQUESTED,
                follow_status_text: isPublic ? 'Following' : 'Requested',
              };
              return updated;
            });
          })
          .catch(err => console.log('Error', err));
      } else if (
        teamData[index]?.follow_status == peopleFollowStates?.REQUESTED
      ) {
        cancelTeamFollowingRequest({
          event_id: user?.preferred_event_id,
          team_id: teamData[index]?.id,
        })
          .unwrap()
          .then(() => {
            setTeamData(prev => {
              if (!prev) {
                return prev;
              } // Ensure prev exists
              const updated = [...prev]; // Clone the array to maintain immutability
              updated[index] = {
                ...updated[index],
                follow_status_text: isPublic ? 'Follow' : 'Request',
                follow_status: isPublic
                  ? peopleFollowStates?.TEAM_PEOPLE_NOT_FOLLOW
                  : peopleFollowStates?.TEAM_NOT_FOLLOW_PRIVATE,
              };
              return updated;
            });
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    } else {
      const body = {event_id: user?.preferred_event_id, user_id: id};
      if (
        peopleData[index]?.following_status == peopleFollowStates?.NOT_FOLLOW ||
        peopleData[index]?.following_status ==
          peopleFollowStates?.TEAM_PEOPLE_NOT_FOLLOW
      ) {
        sendPeopleFollowrequest(body)
          .unwrap()
          .then(() => {
            setPeopleData(prev => {
              if (!prev) {
                return prev;
              } // Ensure prev exists
              const updated = [...prev]; // Clone the array to maintain immutability
              updated[index] = {
                ...updated[index],
                following_status: isPublic
                  ? peopleFollowStates?.FOLLOWING
                  : peopleFollowStates?.REQUESTED,
              };
              return updated;
            });
          })
          .catch(err => console.log('Error', err));
      } else if (
        peopleData[index]?.following_status == peopleFollowStates?.REQUESTED
      ) {
        cancelPeopleFollowingRequest({
          event_id: user?.preferred_event_id,
          user_id: id,
        })
          .unwrap()
          .then(() => {
            setPeopleData(prev => {
              if (!prev) {
                return prev;
              } // Ensure prev exists
              const updated = [...prev]; // Clone the array to maintain immutability
              updated[index] = {
                ...updated[index],
                following_status: peopleFollowStates?.NOT_FOLLOW,
              };
              return updated;
            });
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    }
  };

  const isLoading =
    peopleRequestLoading || teamRequestLoading || CPRLoading || CTRLoading;
  const Item = ({item, index}: {item: any; index: number}) => {
    let requested = null;
    if (team) {
      requested = item?.follow_status == peopleFollowStates?.REQUESTED;
    } else {
      requested = item?.following_status == peopleFollowStates?.REQUESTED;
    }
    return (
      <TeamAndPeopleListing
        item={item}
        team={team}
        requested={!item?.public_profile && requested}
        customText={item?.follow_status_text}
        onPress={() => {
          SendFollowRequest({
            id: item?.id,
            index: index,
            isPublic: item?.public_profile,
          });
        }}
      />
    );
  };

  return (
    <CustomScreenWrapper removeScroll={true}>
      <View style={styles.maincontainer}>
        {isLoading && <CustomScreenLoader />}
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.heading}>Who would you like to follow?</Text>
        <View style={{marginVertical: 15}}>
          <CustomToogleButton
            size={110}
            team={team}
            setTeam={setTeam}
            text2={'Follow Team'}
            text1={'Follow People'}
          />
        </View>
        <View style={styles.inputContainer}>
          <AntDesign name={'search1'} size={20} color={colors.primaryGrey} />
          <TextInput
            value={searchInput}
            placeholder="Search"
            style={styles.textInputStyle}
            placeholderTextColor={colors.lightGrey}
            onChangeText={setSearchInput}
            autoCorrect={false}
          />
        </View>
        {debouncedSearchInput.length > 0 &&
          (team ? isFetching : peopleIsFetching) && (
            <View style={styles.searchLoaderContainer}>
              <ActivityIndicator size="large" color={colors.darkBlue} />
            </View>
          )}
        <View style={styles.brRow} />
        {/* {team ? (
          isFetching
        ) : peopleIsFetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.darkBlue} />
          </View>
        ) : ( */}
        <FlatList
          data={team ? teamData : peopleData}
          extraData={team ? teamData : peopleData}
          renderItem={Item}
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            !(team ? isFetching : peopleIsFetching) ? (
              <View style={styles.centerContainer}>
                <Text style={styles.notFoundText}>
                  {`${team ? 'Team' : 'Prople'} not found!`}
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              enabled={true}
              refreshing={refreshing}
              tintColor={colors.black}
              onRefresh={handleRefreshControl}
            />
          }
        />
        {/* )} */}
        <View style={styles.brRow} />
        <FollowFooter
          isFetching={team ? isFetching : peopleIsFetching}
          teamApiData={team ? teamApiData : peopleApiData}
          onPressNext={team ? goToNextPage : peopleNextPage}
          onPressPrevious={team ? goToPreviousPage : peoplePreviousPage}
        />
      </View>
    </CustomScreenWrapper>
  );
};

export default FollowContainer;

const styles = StyleSheet.create({
  maincontainer: {
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
  centerContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  notFoundText: {fontSize: 16, color: colors.lightGrey, textAlign: 'center'},
  searchLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
