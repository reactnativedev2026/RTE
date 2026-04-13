import React from 'react';
import {StyleSheet, View} from 'react-native';
import {CustomAlert, CustomScreenWrapper} from '../../components';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import TeamWrapper from './TeamWrapper';
import {
  useLazyGetATeamsQuery,
  useLazyGetTeamInvitationsQuery,
} from '../../services/teams.api';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, store} from '../../core/store';
import {setTeamDetail, setUser} from '../AuthScreen/login/login.slice';
import {replace} from '../../services/NavigationService';
import {Routes} from '../../utils';
import {useIsFocused} from '@react-navigation/native';

interface TeamsContainerProps {
  userHaveTeam: boolean;
}

const TeamsContainer = ({}: TeamsContainerProps) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [loading, setLoading] = React.useState(false);
  const [requestedTeams, setRequestedTeam] = React.useState([]);
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [getTeam, {isFetching: teamIsFetching}] = useLazyGetATeamsQuery();
  const [fetchTeamRequests, {isFetching}] = useLazyGetTeamInvitationsQuery();

  React.useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      onRefresh().finally(() => setLoading(false));
    }, 1000);
  }, [isFocused]);

  const onRefresh = async () => {
    const ownBody = {list_type: 'own', event_id: user?.preferred_event_id};
    const joinBody = {list_type: 'joined', event_id: user?.preferred_event_id};
    const joinResponse = await getTeam(joinBody)
      .unwrap()
      .catch(err => CustomAlert({type: 'error', message: err?.data?.message}));
    const ownResponse = await getTeam(ownBody)
      .unwrap()
      .catch(err => CustomAlert({type: 'error', message: err?.data?.message}));

    if (ownResponse?.data?.data?.length > 0) {
      dispatch(setTeamDetail(ownResponse?.data?.data[0]));
      store.dispatch(
        setUser({
          ...user,
          has_team: true,
          preferred_team_id: ownResponse?.data?.data[0]?.id,
        }),
      );
      replace(Routes.MEMEBR_ON_TEAM);
    } else if (joinResponse?.data?.data?.length > 0) {
      dispatch(setTeamDetail(joinResponse?.data?.data[0]));
      store.dispatch(
        setUser({
          ...user,
          has_team: true,
          preferred_team_id: joinResponse?.data?.data[0]?.id,
        }),
      );
      replace(Routes.MEMEBR_ON_TEAM);
    } else {
      store.dispatch(
        setUser({
          ...user,
          has_team: false,
          preferred_team_id: null,
          preferred_team: null,
        }),
      );
    }

    GetTeamInvitationRequest();
  };

  const GetTeamInvitationRequest = async () => {
    const body = {event_id: user?.preferred_event_id};
    await fetchTeamRequests(body)
      .unwrap()
      .then(res => setRequestedTeam(res?.data))
      .catch(err => CustomAlert({type: 'error', message: err?.data?.message}));
  };
  return (
    <CustomScreenWrapper
      isLoading={loading}
      loadingIndicator={teamIsFetching || isFetching}
      onRefresh={onRefresh}
      removeScroll={false}>
      <View style={styles.Maincontainer}>
        <TeamWrapper requestList={requestedTeams} />
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  Maincontainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(60),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(20),
    flex: 1,
  },
});

export default TeamsContainer;
