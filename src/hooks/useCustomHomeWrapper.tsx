import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CustomAlert } from '../components';
import { RootState, store } from '../core/store';
import {
  setCompleteProfile,
  setUser,
} from '../screen/AuthScreen/login/login.slice';
import {
  useLazyGetAchivementsQuery,
  useLazyGetAmerithonDistanceQuery,
} from '../services/Calander.api';
import { useLazyGetCompleteProfileQuery } from '../services/profile.api';
import { useGetManageQuestQuery } from '../services/quest.api';
import { useLazyGetTeamAchievementsQuery } from '../services/teams.api';
import { templateName } from '../utils/helpers';
import useEventData from './getNewEventData';
import useGetQuest from './useGetQuest';

interface UseCustomHomeWrapperProps {
  preferredEventId?: number | null | undefined | string;
  preferredTeamId?: number | null | undefined | string;
  onRefresh?: () => void;
}

const useCustomHomeWrapper = ({
  preferredEventId,
  preferredTeamId,
  onRefresh,
}: UseCustomHomeWrapperProps) => {
  const [questResponse, setQuestResponse] = useState([]);
  const {user, eventDetail, refetchYears} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const isHerosTemplate = Boolean(
    eventDetail?.template == templateName?.HEROS_JOURNEY,
  );

  const {
    isFetching: questFetching,
    isSuccess: questIsSuccess,
    data: questIsData,
  } = useGetManageQuestQuery({
    list_type: 'all',
    event_id: user?.preferred_event_id,
  });
  const {questData, questIsFetching, handleGetQuest} = useGetQuest({
    is_archived: false,
    listType: 'upcoming',
  });
  const {fetchEventData} = useEventData();

  const [distance, setDistance] = useState({});
  const [isTeam, setIsTeam] = useState(false);
  const [achievementsData, setAchievementsData] = useState(null);
  const [chartMiles, setChartMiles] = useState(null);
  const [teamAchievementsData, setTeamAchievementsData] = useState(null);

  const [getAchievements, {isFetching: achievementsFetching}] =
    useLazyGetAchivementsQuery();
  const [getTeamAchievements, {isFetching: teamFetching}] =
    useLazyGetTeamAchievementsQuery();
  const [getCompleteProfile, {isFetching: completeProfileFetching}] =
    useLazyGetCompleteProfileQuery();
  const [getCoordinates, {isFetching}] = useLazyGetAmerithonDistanceQuery();

  const getAchievementsAction = useCallback(() => {
    const getTeam = {
      event_id: preferredEventId,
      ...(preferredTeamId && {team_id: preferredTeamId}),
      action: isTeam && preferredTeamId ? 'team' : 'user',
    };

    if (user?.id) {
      getAchievements(getTeam)
        .unwrap()
        .then(res => {
           // HEREEEE
          setAchievementsData(res?.data?.achievement);
          setChartMiles(res?.data);
          if (isTeam && preferredTeamId) {
            const array = res?.data?.achievement;
            const myIndex = array?.findIndex(item => item.id === user?.id);
            if (myIndex >= 0) {
              setAchievementsData(
                res?.data?.achievement?.[myIndex]?.achievement,
              );
            }
          }
        });
    }
  }, [isTeam, preferredEventId, preferredTeamId, getAchievements, user]);

  const getTeamAchievementsAction = useCallback(async () => {
    const getTeam = {
      event_id: preferredEventId,
      team_id: preferredTeamId,
    };
    if (isTeam && preferredTeamId) {
      await getTeamAchievements(getTeam)
        .unwrap()
        .then(res =>{
           setTeamAchievementsData(res?.data)
          })
        .catch(err => {
          CustomAlert({type: 'error', message: err?.data?.message});
        });
    }
  }, [isTeam, preferredEventId, preferredTeamId, getTeamAchievements]);

  const getCoordinates_action = async () => {
    await getCoordinates({
      distance:
        eventDetail?.statistics?.completed_miles > 3521
          ? 3521
          : eventDetail?.statistics?.completed_miles,
    })
      .unwrap()
      .then(res => {
        setDistance(JSON.parse(res?.data?.nearest?.coordinates));
      })
      .catch(err => {
        console.log('Error', err);
      });
  };

  const getCompleteProfile_action = async () => {
    await getCompleteProfile({})
      .unwrap()
      .then(res => {
        store.dispatch(
          setUser({
            ...store.getState().loginReducer.user,
            name: res?.data?.name,
            email: res?.data?.email,
            time_zone: res?.data?.time_zone,
            display_name: res?.data?.display_name,
          }),
        );
        store.dispatch(
          setCompleteProfile({
            ...store.getState().loginReducer.user,
            name: res?.data?.name,
            email: res?.data?.email,
            time_zone: res?.data?.time_zone,
            display_name: res?.data?.display_name,
          }),
        );
      })
      .catch(err => {
        console.log('Error', err);
      });
  };

  useEffect(() => {
    if (isHerosTemplate) {
      if (questIsSuccess && !questFetching) {
        setQuestResponse(questIsData?.data?.data);
      }
    }
  }, [questIsData, questFetching, questIsSuccess, isHerosTemplate]);

  useEffect(() => {
    getCoordinates_action();
    getAchievementsAction();
    if (preferredTeamId) {
      getTeamAchievementsAction();
    }
  }, [getAchievementsAction, getTeamAchievementsAction, refetchYears]);

  const onRefreshAction = () => {
    onRefresh && onRefresh();
    getAchievementsAction();
    getCoordinates_action();
    getCompleteProfile_action();
    fetchEventData();
    if (preferredTeamId) {
      getTeamAchievementsAction();
      isHerosTemplate && handleGetQuest();
    }
  };

  return {
    isHerosTemplate,
    isTeam,
    setIsTeam,
    achievementsData,
    chartMiles,
    teamAchievementsData,
    questData: questResponse ?? questData,
    questIsFetching: questFetching || questFetching,
    achievementsFetching,
    teamFetching,
    completeProfileFetching,
    onRefreshAction,
    distance,
  };
};

export default useCustomHomeWrapper;
