import React, {useCallback, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {CustomAlert} from '../components';
import {RootState, store} from '../core/store';
import {setEventDetail, setUser} from '../screen/AuthScreen/login/login.slice';
import {settingTypes} from '../screen/Setting/helper';
import {useLazyGetEventQuery} from '../services/profile.api';
import {
  useLazyGetSettingQuery,
  useUpdateManualEntryMutation,
  useUpdateNotificationsMutation,
  useUpdateRtyGoalsMutation,
  useUpdateTrackerAttitudeMutation,
} from '../services/setting.api';
import {setAttitideList} from '../services/slice/TrackerAttitude.slice';

interface useUserSettingProps {
  type: string;
  updateCallback?: (val: any) => void;
  finalCallback?: (val: any) => void;
  errorCallback?: () => void;
}

const useUserSetting = ({
  type,
  updateCallback,
  finalCallback,
  errorCallback,
}: useUserSettingProps) => {
  const [getManualEntry, {isFetching, isLoading: getSettingIsLoading}] =
    useLazyGetSettingQuery();
  const [updateManualEntry, {isLoading: entryisLoading}] =
    useUpdateManualEntryMutation();
  const [updateNotifications, {isLoading: notificationisLoading}] =
    useUpdateNotificationsMutation();
  const [updateTrackerAttitude, {isLoading: trackerAttitudeisLoading}] =
    useUpdateTrackerAttitudeMutation();
  const [updateRtyGoals, {isLoading: rtyGoalsisLoading}] =
    useUpdateRtyGoalsMutation();

  const [getEventDetails] = useLazyGetEventQuery();

  const [settingData, setSettingData] = React.useState(null);
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  useEffect(() => {
    getUserSettingsCall();
  }, [eventDetail?.id, user.preferred_event_id]);

  const getUserSettingsCall = () => {
    if (eventDetail?.id && type) {
      getManualEntry({
        setting: type,
        event_id: user.preferred_event_id ?? eventDetail?.id,
      })
        .then(res => {
          setSettingData(res?.data);
        })
        .catch(err => {
          CustomAlert({type: 'error', message: err?.data?.message});
        });
    }
  };

  const handleUpdateManualEntry = (val: boolean) => {
    updateManualEntry({manual_entry: val})
      .unwrap()
      .then(() => {
        if (updateCallback && type == settingTypes?.MANUAL_ENTRY) {
          updateCallback(val);
        }
      })
      .catch(err => {
        CustomAlert({
          type: 'error',
          message: err?.data?.message,
        });
      });
  };

  const handleUpdateNotifications = (val: any) => {
    const notificationObj = {
      name: val?.key,
      notification_enabled: val?.value,
    };
    updateNotifications(notificationObj)
      .unwrap()
      .then(() => {
        if (updateCallback && type == settingTypes?.NOTIFICATION) {
          updateCallback(val);
        }
      })
      .catch(err => {
        CustomAlert({
          type: 'error',
          message: err?.data?.message,
        });
      })
      .finally(() => {
        if (finalCallback && type == settingTypes?.NOTIFICATION) {
          finalCallback(val);
        }
      });
  };

  const handleUpdateTrackerAttitude = (val: any) => {
    updateTrackerAttitude({attitude: val})
      .unwrap()
      .then(() => {
        store.dispatch(setAttitideList(val));
        if (updateCallback && type == settingTypes?.TRACKER_ATTITUDE) {
          updateCallback(val);
        }
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
        if (errorCallback && type == settingTypes?.TRACKER_ATTITUDE) {
          errorCallback();
        }
      })
      .finally(() => {
        if (finalCallback && type == settingTypes?.TRACKER_ATTITUDE) {
          finalCallback(val);
        }
      });
  };
  const getNewEventData = useCallback(
    (id: number) => {
      getEventDetails({eventId: id})
        .unwrap()
        .then(eventResponse => {
          store.dispatch(setEventDetail(eventResponse?.data));
          store.dispatch(
            setUser({
              ...user,
              preferred_event_id: id,
              has_team: Boolean(eventResponse?.data?.preferred_team_id),
              preferred_team_id: eventResponse?.data?.preferred_team_id,
            }),
          );
        })
        .catch(err => {
          CustomAlert({
            type: 'error',
            message: err?.data?.message,
          });
        });
    },
    [getEventDetails],
  );

  const handleUpdateRtyGoals = (val: any) => {
    if (user?.preferred_event_id) {
      const goalObj = {event_id: user?.preferred_event_id, mileage_goal: val};
      updateRtyGoals(goalObj)
        .unwrap()
        .then(() => {
          if (updateCallback && type == settingTypes?.RTY_GOALS) {
            updateCallback(val);
            getNewEventData(eventDetail?.id);
          }
        })
        .catch(err => {
          CustomAlert({type: 'error', message: err?.data?.message});
          if (errorCallback && type == settingTypes?.RTY_GOALS) {
            errorCallback();
          }
        })
        .finally(() => {
          if (finalCallback && type == settingTypes?.RTY_GOALS) {
            finalCallback(val);
          }
        });
    }
  };

  return {
    isFetching,
    settingData,
    isLoading:
      entryisLoading ||
      notificationisLoading ||
      trackerAttitudeisLoading ||
      rtyGoalsisLoading,
    handleUpdateManualEntry,
    handleUpdateNotifications,
    handleUpdateTrackerAttitude,
    handleUpdateRtyGoals,
    getUserSettingsCall,
    getSettingIsLoading,
  };
};

export default useUserSetting;
