import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const deviceConnectApi = createApi({
  reducerPath: 'deviceConnect/api',
  baseQuery,
  endpoints: build => ({
    getDeviceSync: build.query({
      query: () => ({
        url: 'source/profiles',
      }),
      providesTags: ['deviceList'],
    }),
    // Check if user is authorized for UAT
    checkUatAuthorization: build.query({
      query: () => ({
        url: '/uat/allowed-users',
      }),
    }),
    // Update Daily Steps status for a specific event
    updateUserEventDailySteps: build.mutation({
      query: ({event_id, include_daily_steps}) => ({
        url: '/user/event/daily-steps',
        method: 'POST',
        body: {event_id, include_daily_steps},
      }),
    }),
    // Data_Source
    createDataSource: build.mutation({
      query: body => ({
        url: '/user/source/profiles/create',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['deviceList'],
    }),
    deleteDataSource: build.mutation({
      query: body => ({
        url: '/user/source/profiles/delete',
        method: 'DELETE',
        body: body,
      }),
      invalidatesTags: ['deviceList'],
    }),
    // Sync Samsung Health Exercise Data
    syncSamsungExerciseData: build.mutation({
      query: body => ({
        url: 'user/points',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['deviceList', 'userPoints'],
    }),
    // Sync Samsung Health Daily Data (all data for the day - called at 2 AM)
    syncSamsungDailyData: build.mutation({
      query: body => ({
        url: 'samsung-health/daily-data-sync',
        method: 'POST',
        body: body,
      }),
    }),
    // Get Samsung Health last sync date for EOD cron
    getSamsungHealthLastSyncDate: build.query({
      query: () => ({
        url: '/samsung-health/last-sync-date',
        method: 'GET',
      }),
    }),
    // Update Samsung Health last cron date (called after each day's data is stored during EOD sync)
    updateSamsungHealthLastCron: build.mutation({
      query: body => ({
        url: '/samsung-health/last-cron',
        method: 'POST',
        body: body,
      }),
    }),
    // Push mobile app user debug data
    pushMobileAppUserData: build.mutation({
      query: body => ({
        url: '/mobile-app-user',
        method: 'POST',
        body: body,
      }),
    }),
  }),
});

export const {
  useLazyGetDeviceSyncQuery,
  useGetDeviceSyncQuery,
  useCheckUatAuthorizationQuery,
  useCreateDataSourceMutation,
  useDeleteDataSourceMutation,
  useUpdateUserEventDailyStepsMutation,
  useSyncSamsungExerciseDataMutation,
  useSyncSamsungDailyDataMutation,
  useUpdateSamsungHealthLastCronMutation,
  usePushMobileAppUserDataMutation,
} = deviceConnectApi;
