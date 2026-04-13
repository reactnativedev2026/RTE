import React from 'react';
import {StyleSheet} from 'react-native';
import {CustomScreenWrapper, CustomSettingMain} from '../../components';
import {useEventData} from '../../hooks';

interface SettingContainerProps {
  userHaveTeam: boolean;
}

const SettingContainer = ({}: SettingContainerProps) => {
  const {fetchEventData} = useEventData();

  return (
    <CustomScreenWrapper onRefresh={fetchEventData}>
      <CustomSettingMain />
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({});

export default SettingContainer;
