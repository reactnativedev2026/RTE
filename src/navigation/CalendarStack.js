import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Routes} from '../utils/Routes';
import AddCalendarMiles from '../screen/Calander/AddCalendarMiles';
import MonthlyGoalScreen from '../screen/Calander/MonthlyGoalScreen';
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
      <Stack.Screen
        name={Routes.MONTHLY_GOAL}
        component={MonthlyGoalScreen}
      />
    </Stack.Navigator>
  );
};

export default CalendarStack;
