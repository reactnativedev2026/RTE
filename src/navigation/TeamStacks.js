/* eslint-disable react/react-in-jsx-scope */
import {
  MemberOnTeam,
  TeamsContainer,
  JoinTeamContainer,
  CreateTeamContainer,
  ManageTeamContainer,
} from '../screen';
import {Routes} from '../utils/Routes';
import {screenOptions} from './styles';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const TeamStacks = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.TEAMS}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.TEAMS} component={TeamsContainer} />
      <Stack.Screen name={Routes.CREATE_TEAM} component={CreateTeamContainer} />
      <Stack.Screen name={Routes.JOIN_TEAM} component={JoinTeamContainer} />
      <Stack.Screen name={Routes.MEMEBR_ON_TEAM} component={MemberOnTeam} />
      <Stack.Screen name={Routes.MANAGE_TEAM} component={ManageTeamContainer} />
    </Stack.Navigator>
  );
};

export default TeamStacks;
