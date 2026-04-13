import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {CustomHomeWrapper} from '../../components';
import {SamsungHealthPermissionDialog} from '../../components/SamsungHealthPermissionDialog';
import {RootState} from '../../core/store';
import {useLazyGetEventListingQuery} from '../../services/profile.api';
import {setEventList} from '../AuthScreen/login/login.slice';
import {useSamsungHealthPermissionCheck} from '../../hooks/useSamsungHealthPermissionCheck';

const HomeContainer = () => {
  const {completeProfile, user} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const dispatch = useDispatch();
  const [getEventList, {isLoading}] = useLazyGetEventListingQuery();

  const {
    showPermissionDialog,
    missingPermissions,
    requestMissingPermissions,
    dismissPermissionDialog,
  } = useSamsungHealthPermissionCheck();

  React.useEffect(() => {
    handleEventListing();
  }, []);

  const handleEventListing = () => {
    getEventList({list_type: 'active'})
      .unwrap()
      .then(res => {
        const preferredEventId = user?.preferred_event_id;
        const dataArray = [...(res?.data?.data || [])];

        if (preferredEventId) {
          const index = dataArray.findIndex(
            item => item.id == preferredEventId,
          );
          if (index > 0) {
            dataArray.unshift(dataArray.splice(index, 1)[0]);
          }
        }
        dispatch(setEventList(dataArray));
      })
      .catch(err => console.log('error', err));
  };

  return (
    <>
      <CustomHomeWrapper
        isLoading={isLoading}
        userHaveTeam={user?.has_team}
        completeProfile={completeProfile}
        preferredTeamId={user?.preferred_team_id}
        preferredEventId={user?.preferred_event_id}
      />
      <SamsungHealthPermissionDialog
        visible={showPermissionDialog}
        missingPermissions={missingPermissions}
        onRequestPermissions={requestMissingPermissions}
        onDismiss={dismissPermissionDialog}
      />
    </>
  );
};

export default HomeContainer;
