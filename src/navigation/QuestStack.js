import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Routes} from '../utils/Routes';
import QuestOptionsContainer from '../screen/QuestOptions/QuestOptionsContainer';
import AddCalendarMiles from '../screen/Calander/AddCalendarMiles';
import JournelContainer from '../screen/Journel/JournelContainer';
import ScheduleQuestContainer from '../screen/ScheduleQuest/ScheduleQuestContainer';
import {
  ManageQuestContainer,
  MeetingMentor,
  QuestHistoryContainer,
  RegisteredQuest,
} from '../screen';
import {screenOptions} from './styles';

const Stack = createNativeStackNavigator();

const QuestStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.QUEST_OPTIONS}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={Routes.QUEST_OPTIONS}
        component={QuestOptionsContainer}
      />
      <Stack.Screen
        name={Routes.ADD_CALENDAR_MILES}
        component={AddCalendarMiles}
      />
      <Stack.Screen name={Routes.JOURNEL} component={JournelContainer} />
      <Stack.Screen
        name={Routes.SCHEDULE_QUEST}
        component={ScheduleQuestContainer}
      />
      <Stack.Screen
        name={Routes.REGISTERED_QUEST}
        component={RegisteredQuest}
      />
      <Stack.Screen
        name={Routes.MANAGE_QUEST}
        component={ManageQuestContainer}
      />
      <Stack.Screen name={Routes.MEETING_MENTOR} component={MeetingMentor} />
      <Stack.Screen
        name={Routes.QUEST_HISTORY}
        component={QuestHistoryContainer}
      />
    </Stack.Navigator>
  );
};

export default QuestStack;
