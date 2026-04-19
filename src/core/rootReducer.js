import {combineReducers} from '@reduxjs/toolkit';
import {homeReducer, loginReducer} from '../screen';
import {
  CalanderApi,
  deviceConnectApi,
  deviceTokenApi,
  forgotApi,
  HomeFullfilmentApi,
  loginApi,
  monthlyGoalApi,
  notificationsApi,
  questApi,
  statsApi,
  TeamsApi,
} from '../services';
import {profileApi} from '../services/profile.api';
import {settingApi} from '../services/setting.api';
import {baseUrlReducer} from '../services/slice/Base.slice';
import {TrackerReducer} from '../services/slice/TrackerAttitude.slice';

const rootReducer = combineReducers({
  loginReducer: loginReducer,
  homeReducer: homeReducer,
  trackerReducer: TrackerReducer,
  baseUrlReducer: baseUrlReducer,
  [loginApi.reducerPath]: loginApi.reducer,
  [forgotApi.reducerPath]: forgotApi.reducer,
  [deviceConnectApi.reducerPath]: deviceConnectApi.reducer,
  [HomeFullfilmentApi.reducerPath]: HomeFullfilmentApi.reducer,
  // [FollowApi.reducerPath]: FollowApi.reducer,
  [CalanderApi.reducerPath]: CalanderApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [TeamsApi.reducerPath]: TeamsApi.reducer,
  [settingApi.reducerPath]: settingApi.reducer,
  [statsApi.reducerPath]: statsApi.reducer,
  [questApi.reducerPath]: questApi.reducer,
  [deviceTokenApi.reducerPath]: deviceTokenApi.reducer,
  [monthlyGoalApi.reducerPath]: monthlyGoalApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
});

export default rootReducer;
