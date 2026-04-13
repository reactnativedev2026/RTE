import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {Routes} from '../utils/Routes';
import {screenOptions} from './styles';
import {HomeContainer, MeetingMentor} from '../screen';
import FollowContainer from '../screen/Follow/FollowContainer';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.HOME}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.HOME} component={HomeContainer} />
      <Stack.Screen name={Routes.MEETING_MENTOR} component={MeetingMentor} />
      <Stack.Screen name={Routes.FOLLOW} component={FollowContainer} />
    </Stack.Navigator>
  );
};

export default HomeStack;
