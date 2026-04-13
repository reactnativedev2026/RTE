import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import {useLazyGetManageQuestQuery} from '../services/quest.api';
import {CustomAlert} from '../components';
import {templateName} from '../utils/helpers';

const useGetQuest = ({listType, is_archived}) => {
  const [questData, setQuestData] = useState([]);
  const [page, setPage] = useState(1);
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const [getQuestList, {isFetching: questIsFetching, data}] =
    useLazyGetManageQuestQuery();
  const isHerosTemplate = Boolean(
    eventDetail?.template == templateName?.HEROS_JOURNEY,
  );

  const handleGetQuest = async () => {
    if (user?.preferred_event_id && isHerosTemplate) {
      const getQuestObj = {
        event_id: user?.preferred_event_id,
        page_limit: 10,
        is_archived: is_archived || false,
        page: page,
        list_type: listType,
      };
      await getQuestList(getQuestObj)
        .unwrap()
        .then(res => {
          if (page > 1) {
            setQuestData([...questData, ...res?.data?.data]);
          } else {
            setQuestData(res?.data?.data || []);
          }
        })
        .catch(err => {
          CustomAlert({
            type: 'error',
            message:
              err?.data?.message || 'An error occurred while fetching quests.',
          });
        });
    }
  };
  const handleOnEndReached = () => {
    if (data?.data?.next_page_url) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    handleGetQuest();
  }, [user?.preferred_event_id, eventDetail?.quest_statistics?.total_quests]);

  const resetQuestData = () => {
    setQuestData([]);
    setPage(1);
  };

  return {
    questData,
    handleGetQuest,
    questIsFetching,
    handleOnEndReached,
    resetQuestData,
  };
};

export default useGetQuest;
