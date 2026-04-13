import React from 'react';
import ProfileForm from './ProfileForm';
import {useAdjustKeyboard} from '../../hooks';

interface ProfileContainerProps {}

const ProfileContainer = ({}: ProfileContainerProps) => {
  useAdjustKeyboard();
  return <ProfileForm />;
};

export default ProfileContainer;
