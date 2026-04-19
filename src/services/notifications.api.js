import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery,
  tagTypes: ['NotificationPreferences'],
  endpoints: builder => ({
    getNotificationPreferences: builder.query({
      query: () => ({
        url: '/user/notification-preferences',
        method: 'GET',
      }),
      providesTags: ['NotificationPreferences'],
    }),
    updateNotificationPreferences: builder.mutation({
      query: body => ({
        url: '/user/notification-preferences',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),
  }),
});

export const {
  useLazyGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
