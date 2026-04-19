import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import _ from 'lodash';
import {batchedSubscribe} from 'redux-batched-subscribe';
import {persistReducer, persistStore} from 'redux-persist';
import {
  CalanderApi,
  forgotApi,
  HomeFullfilmentApi,
  monthlyGoalApi,
  notificationsApi,
  statsApi,
  loginApi,
  questApi,
  deviceConnectApi,
  deviceTokenApi,
} from '../services';
import {profileApi} from '../services/profile.api';
import {TeamsApi} from '../services/teams.api';
import rootReducer from './rootReducer';
import {settingApi} from '../services/setting.api';

// Persist configuration for loginReducer
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['loginReducer', 'TrackerReducer'],
  // blacklist: ['homeReducer'],
};

// Apply persistReducer to loginReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const debounceNotify = _.debounce(notify => notify(), 100);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat([
      loginApi.middleware,
      HomeFullfilmentApi.middleware,
      // FollowApi.middleware,
      forgotApi.middleware,
      deviceConnectApi.middleware,
      CalanderApi.middleware,
      profileApi.middleware,
      TeamsApi.middleware,
      settingApi.middleware,
      statsApi.middleware,
      questApi.middleware,
      deviceTokenApi.middleware,
      monthlyGoalApi.middleware,
      notificationsApi.middleware,
    ]),
  devTools: process.env.NODE_ENV !== 'production',
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers({
      autoBatch: false,
    }).concat(batchedSubscribe(debounceNotify)),
});

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore['getState']>;

export type AppDispatch = AppStore['dispatch'];

export const persistor = persistStore(store);
