import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useAcceptPeopleFollowRequestMutation,
  useAcceptTeamFollowRequestMutation,
  useDeclinePeopleFollowRequestMutation,
  useDeclineTeamFollowRequestMutation,
} from '../../services/Home.api';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';
import {CustomAlert, CustomModal} from '../index';

const TeamAndPeopleRequestListing = ({item, team, eventId, data, setData}) => {
  const [showRespond, setShowRespond] = React.useState(false);

  // Mutations
  const [acceptPeopleRequest, {isLoading: peopleAcceptIsLoading}] =
    useAcceptPeopleFollowRequestMutation();
  const [declinePeopleRequest, {isLoading: peopleDeclineIsLoading}] =
    useDeclinePeopleFollowRequestMutation();
  const [acceptTeamRequest, {isLoading: teamAcceptIsLoading}] =
    useAcceptTeamFollowRequestMutation();
  const [declineTeamRequest, {isLoading: teamDeclineIsLoading}] =
    useDeclineTeamFollowRequestMutation();

  // Memoized loading state
  const isLoading = useMemo(
    () =>
      peopleAcceptIsLoading ||
      peopleDeclineIsLoading ||
      teamAcceptIsLoading ||
      teamDeclineIsLoading,
    [
      peopleAcceptIsLoading,
      peopleDeclineIsLoading,
      teamAcceptIsLoading,
      teamDeclineIsLoading,
    ],
  );

  // Handles both accept and decline for people and teams
  const handleRequest = async actionType => {
    const isAccept = actionType === 'accept';
    const requestFn = team
      ? isAccept
        ? acceptTeamRequest
        : declineTeamRequest
      : isAccept
      ? acceptPeopleRequest
      : declinePeopleRequest;

    const body = {
      user_id: item?.id,
      event_id: eventId,
      ...(team && {team_id: item?.team_id}),
    };

    setShowRespond(false);
    try {
      await requestFn(body).unwrap();

      setData(prevData => prevData.filter(_data => _data.id !== item?.id));
    } catch (err) {
      CustomAlert({type: 'error', message: err?.data?.message});
    }
  };

  return (
    <View style={styles.listContainer} key={item?.id}>
      <View style={styles.listView}>
        <Text numberOfLines={1} style={styles.questTitle}>
          {team ? item?.user?.display_name : item?.display_name}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowRespond(true)}>
          {isLoading ? (
            <ActivityIndicator size={'small'} color={colors.black} />
          ) : (
            <Text style={styles.editGoalTxt}>Respond</Text>
          )}
        </TouchableOpacity>
      </View>
      {showRespond && (
        <CustomModal
          visible={showRespond}
          onClose={() => handleRequest('decline')}
          onConfirm={() => handleRequest('accept')}
          title="Are you sure you want to accept the request?"
          showDescription={false}
          // description="Are you sure you want to respond?"
          cancelButtonTitle="Reject"
          confirmButtonTitle="Accept"
          onCloseIcon={() => setShowRespond(false)}
        />
      )}
    </View>
  );
};

export default TeamAndPeopleRequestListing;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listView: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(6.5),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  questTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.headerBlack,
  },
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(42),
    width: moderateScale(125),
    backgroundColor: colors.lightGrey,
  },
  editGoalTxt: {color: colors.white, fontWeight: '400'},
});
