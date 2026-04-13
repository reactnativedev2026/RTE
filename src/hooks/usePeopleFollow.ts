import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {CustomAlert} from '../components';
import {RootState} from '../core/store';
import {useLazyUserParticipationsListingQuery} from '../services/Home.api';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const usePeopleFollow = () => {
  // States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [peopleData, setPeopleData] = useState<any[]>([]);
  //Redux
  const {user} = useSelector((state: RootState) => state.loginReducer);
  //RTK_Query
  const [getPeople, {isFetching, data}] =
    useLazyUserParticipationsListingQuery();

  const debouncedSearch = useDebounce(search, 300);

  const fetchPeople = React.useCallback(
    async (_page: number, _search: string) => {
      const formData = {
        event_id: user?.preferred_event_id,
        page_limit: 10,
        page: _page,
        term: _search,
      };
      await getPeople(formData)
        .unwrap()
        .then(res => {
          setPeopleData(
            Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
              ? res
              : [],
          );
        })
        .catch(err =>
          CustomAlert({type: 'error', message: err?.data?.message}),
        );
    },
    [user, getPeople],
  );

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch people when page or search changes
  useEffect(() => {
    fetchPeople(page, debouncedSearch);
  }, [page, debouncedSearch, fetchPeople]);

  const pullToRefreshPeople = () => {
    setPage(1);
  };

  const resetTeams = () => {
    setPeopleData([]);
    setPage(1);
  };

  return {
    peopleData,
    peopleIsFetching: isFetching,
    peopleNextPage: () => {
      if (data?.data?.next_page_url) {
        setPeopleData([]);
        setPage(prevPage => prevPage + 1);
      }
    },
    peoplePreviousPage: () => {
      if (data?.data?.prev_page_url && page > 1) {
        setPeopleData([]);
        setPage(prevPage => prevPage - 1);
      }
    },
    searchPeople: search,
    searchSetPeople: setSearch,
    setPeopleData,
    peopleApiData: data?.data,
    resetPeopleList: resetTeams,
    pullToRefreshPeople,
    setPage: setPage,
  };
};

export default usePeopleFollow;
