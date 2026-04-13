import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {Routes} from '../utils/Routes';
import {screenOptions} from './styles';
import {GraphContainer} from '../screen';
import FollowContainer from '../screen/Follow/FollowContainer';

const Stack = createNativeStackNavigator();

const GraphStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.GRAPH}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.GRAPH} component={GraphContainer} />
      <Stack.Screen name={Routes.FOLLOW} component={FollowContainer} />
    </Stack.Navigator>
  );
};

export default GraphStack;
