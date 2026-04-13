import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CustomScreenWrapper } from '../../components';
import { RootState } from '../../core/store';
import { useUserSetting } from '../../hooks';
import {
  useExtraMilesSyncMutation,
  useLazyGetRTYListQuery,
} from '../../services/setting.api';
import { settingTypes } from '../Setting/helper';
import RtyGoalsForm from './RtyGoalsForm';

interface GoalsContainerProps {}

const GoalsContainer = ({}: GoalsContainerProps) => {
  const [value, setValue] = React.useState('');
  const [rtyPoints, setRTYPoints] = React.useState([]);
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [getRTYArray] = useLazyGetRTYListQuery();
  const [extraMilesSync] = useExtraMilesSyncMutation();

  const errorCallback = () => {
    setValue('');
  };
  const updateCallback = () => {
    getUserSettingsCall();
  };
  const {
    isFetching,
    settingData,
    handleUpdateRtyGoals,
    isLoading,
    getSettingIsLoading,
    getUserSettingsCall,
  } = useUserSetting({
    type: settingTypes.RTY_GOALS,
    errorCallback,
    updateCallback,
  });

  const fetchData = () => {
    getRTYArray({event_id: user.preferred_event_id})
      .then(res => {
        const fetchResponse = handleApiResponse(res?.data);
        if (fetchResponse) {
          setRTYPoints(fetchResponse?.values);
        }
      })
      .catch(err => {
        console.log('error', err);
      });
  };

  const goalsData = settingData?.data;
  useEffect(() => {
    if (goalsData?.rty_mileage_goal) {
      setValue(goalsData?.rty_mileage_goal);
    }
    fetchData();
  }, [goalsData?.rty_mileage_goal]);

  const handleApiResponse = response => {
    if (response?.success && response?.data) {
      const key = Object.keys(response.data)[0]; // Get the first key
      const valuesArray = response.data[key]; // Get the corresponding array
      return {id: key, values: valuesArray};
    }
    return null;
  };

  const toggleExtraMiles = async (activity, state) => {
    await extraMilesSync({
      event_id: user.preferred_event_id,
      name: activity,
      notification_enabled: state,
    })
      .unwrap()
      .then(res => {
        getUserSettingsCall();
      })
      .catch(err => {});
  };

  return (
    <CustomScreenWrapper loadingIndicator={isFetching || isLoading}>
      <RtyGoalsForm
        initiallySelectedValue={value}
        onSelectItem={(value: any) => {
          handleUpdateRtyGoals(value?.value);
        }}
        goalsData={goalsData}
        loading={isFetching}
        rtyPoints={rtyPoints}
        toggleExtraMiles={(activity, state) => {
          toggleExtraMiles(activity, state);
        }}
      />
    </CustomScreenWrapper>
  );
};

export default GoalsContainer;
