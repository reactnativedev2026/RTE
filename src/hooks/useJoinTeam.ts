import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CustomAlert } from '../components';
import { RootState, store } from '../core/store';
import { setUser } from '../screen/AuthScreen/login/login.slice';
import { replace } from '../services/NavigationService';
import {
  useCancelMemberRequestMutation,
  useLazyGetATeamsQuery,
  useRequestJoinAteamMutation,
} from '../services/teams.api';
import { Routes } from '../utils';

const useJoinTeam = () => {
  const [getATeams, {isFetching, data}] = useLazyGetATeamsQuery();
  const [cancelMemberRequest, {isLoading}] = useCancelMemberRequestMutation();
  const [requestToJoinTeam, {isLoading: requestIsLoading}] =
    useRequestJoinAteamMutation();
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [search, setSearch] = useState('');
  const [teamData, setTeamData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const previousPageRef = useRef(1);

  const fetchTeams = useCallback(async () => {
    const formData = {
      list_type: 'other',
      event_id: user?.preferred_event_id,
      page,
      page_limit: 10,
      term: search,
    };
    await getATeams(formData)
      .unwrap()
      .then(res => {
        setTeamData(res?.data?.data);
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  }, [page, getATeams, user, search]);

  const handleJoinTeam = useCallback(
    async (teamId, isPublic) => {
      const formData = {
        team_id: teamId,
        event_id: user?.preferred_event_id,
      };
      requestToJoinTeam(formData)
        .unwrap()
        .then(res => {
          if (isPublic) {
            store.dispatch(
              setUser({...user, has_team: true, preferred_team_id: teamId}),
            );
            replace(Routes.MEMEBR_ON_TEAM);
          } else {
            const updatedData = teamData?.map(team =>
              team?.id == teamId
                ? {...team, membership_status: 'RequestedJoin'}
                : team,
            );

            setTeamData(updatedData);
          }
        })
        .catch(error => {
          CustomAlert({type: 'error', message: error?.data?.message});
        });
    },
    [requestToJoinTeam, user, teamData],
  );
  const cancelMemberRequest_action = useCallback(
    async teamId => {
      const formData = {
        team_id: teamId,
        event_id: user?.preferred_event_id,
      };
      await cancelMemberRequest(formData)
        .unwrap()
        .then(() => {
          const updatedData = teamData?.map(team =>
            team?.id == teamId ? {...team, membership_status: null} : team,
          );
          setTeamData(updatedData);
        })
        .catch(error => {
          CustomAlert({type: 'error', message: error?.data?.message});
        });
    },
    [cancelMemberRequest, user, teamData],
  );

  const goToNextPage = () => {
    if (data?.data?.next_page_url) {
      setTeamData([]);
      setPage(prevPage => prevPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (data?.data?.prev_page_url && page > 1) {
      setTeamData([]);
      setPage(prevPage => prevPage - 1);
    }
  };

  // Effect to handle search term changes
  useEffect(() => {
    if (search) {
      // When a new search term is entered, reset to the first page
      previousPageRef.current = page;
      setPage(1);
    } else if (previousPageRef.current) {
      // When the search is cleared, go back to the previous page
      setPage(previousPageRef.current);
    }
  }, [search]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchTeams();
    }, 400); // Adjust delay as needed

    return () => clearTimeout(debounceTimeout);
  }, [page, search]);

  const pullToRefreshTeams = () => {
    setPage(1);
  };

  const resetTeams = () => {
    setTeamData([]);
    setPage(1);
  };

  return {
    teamData,
    isFetching,
    requestIsLoading: requestIsLoading || isLoading,
    goToNextPage,
    goToPreviousPage,
    handleJoinTeam,
    search,
    setSearch,
    setTeamData,
    teamApiData: data?.data,
    resetTeams,
    pullToRefreshTeams,
    cancelMemberRequest_action,
  };
};

export default useJoinTeam;
