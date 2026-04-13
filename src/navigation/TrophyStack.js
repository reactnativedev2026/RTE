import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import TrophyScreen from '../screen/TrophyScreen/TrophyScreen';
import { Routes } from '../utils/Routes';
import { screenOptions } from './styles';

const Stack = createNativeStackNavigator();

const TrophyStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.TROPHY}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.TROPHY} component={TrophyScreen} />
     </Stack.Navigator>
  );
};

export default TrophyStack;
