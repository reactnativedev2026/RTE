import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const settingApi = createApi({
  reducerPath: 'settingApi',
  baseQuery,
  endpoints: build => ({
    getSetting: build.query({
      query: body => ({
        url: '/user/setting',
        params: body,
      }),
    }),
    updateManualEntry: build.mutation({
      query: body => ({
        url: '/user/manual-entry/update',
        method: 'POST',
        body: body,
      }),
    }),
    updateNotifications: build.mutation({
      query: body => ({
        url: '/user/notifications/update',
        method: 'POST',
        body: body,
      }),
    }),
    updateTrackerAttitude: build.mutation({
      query: body => ({
        url: '/user/tracker-attitude/update',
        method: 'POST',
        body: body,
      }),
    }),
    updateRtyGoals: build.mutation({
      query: body => ({
        url: '/user/rty-mileage-goal/update',
        method: 'POST',
        body: body,
      }),
    }),
    updateImports: build.mutation({
      query: body => ({
        url: '/event/miles/import',
        method: 'POST',
        body: body,
      }),
    }),
    getEventParticipations: build.query({
      query: body => ({
        url: '/user/events/participants',
        params: body,
      }),
    }),

    updatePrivacy: build.mutation({
      query: body => ({
        url: '/user/event/privacy',
        method: 'POST',
        body: body,
      }),
    }),
    updateSyncDevices: build.mutation({
      query: body => ({
        url: '/user/event/sync-points',
        method: 'POST',
        body: body,
      }),
    }),
    getTutorials: build.query({
      query: body => ({
        url: '/event/tutorials',
        params: body,
        method: 'GET',
      }),
    }),
    getRTYList: build.query({
      query: body => ({
        url: '/event/goals',
        params: body,
        method: 'GET',
      }),
    }),
    extraMilesSync: build.mutation({
      query: body => ({
        url: '/user/event/modality',
        method: 'POST',
        body: body,
      }),
    }),
    getOuraRingSettings: build.query({
      query: () => ({
        url: '/user/setting',
        params: { setting: 'ouraring_settings' },
      }),
    }),
    updateOuraRingSettings: build.mutation({
      query: body => ({
        url: '/user/setting',
        method: 'POST',
        body: {
          setting: 'ouraring_settings',
          ...body,
        },
      }),
    }),
  }),
});

export const {
  useLazyGetSettingQuery,
  useUpdateManualEntryMutation,
  useUpdateNotificationsMutation,
  useUpdateTrackerAttitudeMutation,
  useUpdateRtyGoalsMutation,
  useUpdateImportsMutation,
  useUpdatePrivacyMutation,
  useLazyGetEventParticipationsQuery,
  useGetEventParticipationsQuery,
  useUpdateSyncDevicesMutation,
  useLazyGetTutorialsQuery,
  useLazyGetRTYListQuery,
  useExtraMilesSyncMutation,
  useGetOuraRingSettingsQuery,
  useLazyGetOuraRingSettingsQuery,
  useUpdateOuraRingSettingsMutation,
} = settingApi;
