import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const profileApi = createApi({
  reducerPath: 'profile/api',
  baseQuery,
  endpoints: build => ({
    getUserProfile: build.query({
      query: () => ({
        url: 'user/profile/basic',
      }),
    }),
    updateUserProfile: build.query({
      query: body => ({
        url: 'user/profile',
        body: body,
        method: 'PATCH',
      }),
    }),
    getCompleteProfile: build.query({
      query: body => ({
        url: 'user/profile/complete',
        params: body,
        method: 'GET',
      }),
    }),
    getEvent: build.query({
      query: ({eventId}) => ({
        url: `/events/event/${eventId}`,
      }),
    }),
    getEventListing: build.query({
      query: body => ({
        url: '/events',
        params: body,
        method: 'GET',
      }),
    }),

    getBroadcastUnseen: build.query({
      query: () => ({
        url: '/broadcasts/unseen',
        method: 'GET',
      }),
    }),

    readBroadcast: build.mutation({
      query: () => ({
        url: '/broadcasts/read',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLazyGetUserProfileQuery,
  useLazyUpdateUserProfileQuery,
  useLazyGetCompleteProfileQuery,
  useLazyGetEventQuery,
  useLazyGetEventListingQuery,
  useGetEventListingQuery,
  useGetEventQuery,
  useGetBroadcastUnseenQuery,     // ✅ auto-fetch version
  useLazyGetBroadcastUnseenQuery, // ✅ lazy version
  useReadBroadcastMutation,       // ✅ POST
} = profileApi;
