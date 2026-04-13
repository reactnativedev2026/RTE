import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {ForgotPasswordContainer, LoginContainer} from '../screen';
import ResetPassword from '../screen/AuthScreen/resetPassword/ResetPassword';
import SignupScreen from '../screen/SignupScreen';
import {Routes} from '../utils/Routes';
import PublicNavigator from './PublicNavigator';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.LOGIN}
      screenOptions={screenOptions}>
      <Stack.Screen name={Routes.LOGIN} component={LoginContainer} />
      <Stack.Screen name={Routes.SIGNUP} component={SignupScreen} />
      <Stack.Screen
        name={Routes.PUBLIC_NAVIGATOR}
        component={PublicNavigator}
      />
      <Stack.Screen
        name={Routes.FORGOT_PASSWORD}
        component={ForgotPasswordContainer}
      />
      <Stack.Screen name={Routes.RESET_PASSWORD} component={ResetPassword} />
    </Stack.Navigator>
  );
};
export default AuthNavigator;

const screenOptions = {
  headerShown: false,
  gestureEnabled: false,
};
