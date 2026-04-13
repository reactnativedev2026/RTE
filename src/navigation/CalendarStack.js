import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Routes} from '../utils/Routes';
import AddCalendarMiles from '../screen/Calander/AddCalendarMiles';
import {CalanderContainer} from '../screen';
import {screenOptions} from './styles';

const Stack = createNativeStackNavigator();

const CalendarStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.CALANDER}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.CALANDER} component={CalanderContainer} />
      <Stack.Screen
        name={Routes.ADD_CALENDAR_MILES}
        component={AddCalendarMiles}
      />
    </Stack.Navigator>
  );
};

export default CalendarStack;
