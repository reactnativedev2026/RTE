import {
  useAcceptMemberRequestMutation,
  useLazyGetPendingInvitesQuery,
  useLazyGetPendingRequestsQuery,
} from '../../services/teams.api';
import React, {useEffect, useMemo} from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../utils';
import {useSelector} from 'react-redux';
import {RootState} from '../../core/store';
import {CustomAlert} from '../../components';
import {moderateScale} from '../../utils/metrics';
import {getTemplateSpecs} from '../../utils/helpers';
import {BarIndicator} from 'react-native-indicators';
import MultipleTapsPress from '../../components/MultipleTapsPress';

const PendingInvites: React.FC = ({isFetching}) => {
  const {user, eventDetail, teamDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const [userRequests, setUserRequests] = React.useState([]);
  const [userInvites, setUserInvities] = React.useState([]);
  const [pendingRequest, setPendingRequest] = React.useState(false);

  //RTK-Query
  const [getPendingRequests, {isFetching: requestsIsFetching}] =
    useLazyGetPendingRequestsQuery();
  const [
    getPendingInvites,
    {isFetching: invitesIsFetching, isError, error, data},
  ] = useLazyGetPendingInvitesQuery();
  const [acceptRequest, {isLoading}] = useAcceptMemberRequestMutation();

  useEffect(() => {
    if (user?.preferred_team_id && user?.preferred_event_id && pendingRequest) {
      getPendingRequests({
        team_id: user.preferred_team_id,
        event_id: user.preferred_event_id,
      })
        .unwrap()
        .then(res => setUserRequests(res?.data?.data))
        .catch(error => {
          CustomAlert({type: 'error', message: error?.data?.message});
        });
    }
  }, [user, getPendingRequests, pendingRequest, isFetching]);

  useEffect(() => {
    if (
      user?.preferred_team_id &&
      user?.preferred_event_id &&
      !pendingRequest
    ) {
      getPendingInvites({
        team_id: user.preferred_team_id,
        event_id: user.preferred_event_id,
      })
        .unwrap()
        .then(res => setUserInvities(res?.data?.data))
        .catch(error => {
          CustomAlert({type: 'error', message: error?.data?.message});
        });
    }
  }, [user, getPendingInvites, pendingRequest, data, isFetching]);

  useEffect(() => {
    if (isError) {
      CustomAlert({type: 'error', message: error?.data?.message});
    }
  }, [isError, error]);

  const handleAcceptRequest = userId => {
    acceptRequest({
      user_id: userId,
      team_id: user?.preferred_team_id,
      event_id: user?.preferred_event_id,
    })
      .unwrap()
      .then(() => {
        const updatedUserRequests = userRequests?.filter(
          item => item?.user?.id !== userId,
        );
        setUserRequests(updatedUserRequests);
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  const renderItem = React.useCallback(
    ({item, index}) => (
      <View style={styles.inviteItem} key={index?.toString()}>
        <Text style={styles.name}>{`${index + 1}.`}</Text>
        <Text style={styles.email}>{item?.user?.email}</Text>
      </View>
    ),
    [],
  );
  const renderRequests = React.useCallback(
    ({item, index}) => (
      <View style={styles.requestItem} key={index?.toString()}>
        <View style={styles.inviteItem}>
          <Text style={styles.name}>{`${index + 1}.`}</Text>
          <Text style={styles.email}>{item?.user?.display_name}</Text>
        </View>

        {teamDetail?.is_team_owner && (
          <MultipleTapsPress
            onPress={() => handleAcceptRequest(item?.user?.id)}>
            {!isLoading ? (
              <Text
                style={[
                  styles.accept,
                  {
                    color: getTemplateSpecs(eventDetail?.template)
                      ?.btnPrimaryColor,
                  },
                ]}>
                Accept
              </Text>
            ) : (
              <BarIndicator
                size={17}
                color={getTemplateSpecs(eventDetail?.template)?.btnPrimaryColor}
              />
            )}
          </MultipleTapsPress>
        )}
      </View>
    ),
    [isLoading, teamDetail?.is_team_owner],
  );

  const ListEmptyComponent = useMemo(
    () =>
      !invitesIsFetching && (
        <Text style={styles.textDescription}>
          Currently, there is no one invited. Invite your friends to join now.
        </Text>
      ),
    [invitesIsFetching],
  );

  const ListEmptyComponentRequests = useMemo(
    () =>
      !requestsIsFetching && (
        <Text style={styles.textDescription}>
          No one has requested to join your team yet.
        </Text>
      ),
    [requestsIsFetching],
  );

  const ListFooterComponent = useMemo(
    () =>
      invitesIsFetching && (
        <ActivityIndicator
          size="small"
          color={colors.primaryGrey}
          style={styles.loadingIndicator}
        />
      ),
    [invitesIsFetching],
  );
  const ListFooterComponentRequest = useMemo(
    () =>
      requestsIsFetching && (
        <ActivityIndicator
          size="small"
          color={colors.primaryGrey}
          style={styles.loadingIndicator}
        />
      ),
    [requestsIsFetching],
  );

  return (
    <View style={styles.secondContainer}>
      <View style={styles.inviteRow}>
        <MultipleTapsPress
          style={{flex: 0.7}}
          onPress={() => setPendingRequest(false)}>
          <Text
            style={[
              styles.pendingTxt,
              {
                color: !pendingRequest
                  ? colors.headerBlack
                  : colors.primaryGrey,
              },
            ]}>
            Pending Invites
          </Text>
        </MultipleTapsPress>

        <MultipleTapsPress
          style={{flex: 1}}
          onPress={() => setPendingRequest(true)}>
          <Text
            style={[
              styles.pendingTxt,
              {
                color: pendingRequest ? colors.headerBlack : colors.primaryGrey,
                textAlign: 'right',
              },
            ]}>
            {pendingRequest && userRequests?.length > 0
              ? `Pending Requests (${userRequests?.length})`
              : 'Pending Requests'}
          </Text>
        </MultipleTapsPress>
      </View>
      <View style={styles.inviteContent}>
        {pendingRequest ? (
          <FlatList
            data={userRequests}
            renderItem={renderRequests}
            keyExtractor={(item, index) => `${item?.user?.email}-${index}`}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={ListEmptyComponentRequests}
            ListFooterComponent={ListFooterComponentRequest}
          />
        ) : (
          <FlatList
            data={userInvites}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item?.user?.email}-${index}`}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
          />
        )}
      </View>
    </View>
  );
};

export default PendingInvites;

const styles = StyleSheet.create({
  secondContainer: {
    padding: moderateScale(20),
    backgroundColor: colors.white,
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(25),
    marginHorizontal: moderateScale(10),
  },
  inviteRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inviteContent: {marginTop: moderateScale(10)},
  pendingTxt: {fontSize: moderateScale(18), fontWeight: '700'},
  textDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primaryGrey,
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(20),
  },
  inviteItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: moderateScale(10),
    marginRight: moderateScale(20),
  },
  requestItem: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginRight: moderateScale(5),
  },
  email: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
  },
  flatListContainer: {flexGrow: 1},
  loadingIndicator: {paddingVertical: moderateScale(10)},
  accept: {fontSize: moderateScale(14), fontWeight: '700'},
});
