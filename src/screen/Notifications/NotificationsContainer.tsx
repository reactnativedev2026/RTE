import React, {useEffect} from 'react';
import {CustomScreenWrapper} from '../../components';
import {useUserSetting} from '../../hooks';

import {settingTypes} from '../Setting/helper';
import NotificationsForm from './NotificationsForm';

interface NotificationsContainerProps {}
const NotificationsContainer = ({}: NotificationsContainerProps) => {
  const [toggles, setToggles] = React.useState({
    bibs: false,
    follow_requests: false,
    team_bibs: false,
    team_follow_requests: false,
    team_updates: false,
  });
  const [loadingToggles, setLoadingToggles] = React.useState({
    bibs: false,
    follow_requests: false,
    team_bibs: false,
    team_follow_requests: false,
    team_updates: false,
  });

  const updateNotificationCallback = (values: any) => {
    setToggles(prevState => ({
      ...prevState,
      [values.key]: values?.value,
    }));
  };
  const finalNotificationCallback = (values: any) => {
    setLoadingToggles(prevState => ({
      ...prevState,
      [values?.key]: false,
    }));
  };

  const {
    isFetching,
    settingData,
    handleUpdateNotifications,
    getUserSettingsCall,
  } = useUserSetting({
    type: settingTypes.NOTIFICATION,
    updateCallback: updateNotificationCallback,
    finalCallback: finalNotificationCallback,
  });

  useEffect(() => {
    transformApiArrayNotifications();
  }, [settingData?.data?.notifications]);

  const transformApiArrayNotifications = () => {
    if (Array.isArray(settingData?.data?.notifications)) {
      const togglesObject = settingData?.data?.notifications?.reduce(
        (acc, item) => {
          acc[item.name] = item.notification_enabled;
          return acc;
        },
        {},
      );
      setToggles(togglesObject);
    }
  };

  const updateNotifications = (values: any) => {
    setLoadingToggles(prevState => ({
      ...prevState,
      [values.key]: true,
    }));
    handleUpdateNotifications(values);
  };

  return (
    <CustomScreenWrapper onRefresh={getUserSettingsCall}>
      <NotificationsForm
        toggles={toggles}
        onToggle={(values: any) => {
          updateNotifications(values);
        }}
        isLoading={isFetching}
        loadingToggle={loadingToggles}
      />
    </CustomScreenWrapper>
  );
};
export default NotificationsContainer;
