import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CustomAlert } from '../components';
import { RootState } from '../core/store';
import { useLazyGetFollowTeamsQuery } from '../services/teams.api';

const useFollowTeam = () => {
  const [getATeams, {isFetching, data}] = useLazyGetFollowTeamsQuery();
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [search, setSearch] = useState('');
  const [teamData, setTeamData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const previousPageRef = useRef(1);

  const fetchTeams = useCallback(() => {
    const formData = {
      list_type: 'other',
      event_id: user?.preferred_event_id,
      page,
      page_limit: 10,
      term: search,
    };

    getATeams(formData)
      .unwrap()
      .then(res => {
        setTeamData(res?.data?.data);
      })
      .catch(err => CustomAlert({type: 'error', message: err?.data?.message}));
  }, [page, getATeams, user, search]);

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
    fetchTeams();
  }, [page, fetchTeams]);

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
    goToNextPage,
    goToPreviousPage,
    search,
    setSearch,
    setTeamData,
    teamApiData: data?.data,
    resetTeams,
    pullToRefreshTeams,
    setPage: setPage,
  };
};

export default useFollowTeam;
