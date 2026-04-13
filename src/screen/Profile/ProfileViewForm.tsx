import React from 'react';
import { View } from 'react-native';
import ProfileCredentials from './ProfileCredentials';

interface ProfileViewFormProps {
  userProfileData?: object | undefined;
}

const ProfileViewForm = ({userProfileData}: ProfileViewFormProps) => {
  return (
    <View>
      <ProfileCredentials
        heading={'Email'}
        label={userProfileData?.email ?? ''}
      />
      <ProfileCredentials
        heading={'Name'}
        label={
          userProfileData?.first_name + ' ' + userProfileData?.last_name ??
          'Add Name'
        }
      />

      <ProfileCredentials
        heading={'Display Name'}
        label={userProfileData?.name ?? 'Add Display Name'}
      />

      <ProfileCredentials
        heading={'Bio'}
        label={userProfileData?.bio ?? 'Add Bio'}
      />

      <ProfileCredentials
        heading={'Timezone'}
        label={userProfileData?.time_zone ?? 'Add Timezone'}
      />
    </View>
  );
};

export default ProfileViewForm;
