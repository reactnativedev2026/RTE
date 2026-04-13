import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const CalanderApi = createApi({
  reducerPath: 'calanderApi',
  baseQuery,
  tagTypes: ['userPoints'],
  endpoints: builder => ({
    getCalandernfo: builder.query({
      query: body => ({
        url: 'user/points',
        method: 'GET',
        params: body,
      }),
      providesTags: ['userPoints'],
    }),
    createCalanderEvent: builder.mutation({
      query: data => ({
        url: 'user/points',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['userPoints'],
    }),
    updateUserPoints: builder.mutation({
      query: body => ({
        url: 'user/points',
        body: body,
        method: 'PATCH',
      }),
      invalidatesTags: ['userPoints'],
    }),
    getUserPointDetail: builder.query({
      query: body => ({
        url: '/user/points/view',
        method: 'GET',
        params: body,
      }),
    }),
    getCalendarPoints: builder.query({
      query: body => ({
        url: '/user/points/listing',
        method: 'GET',
        params: body,
      }),
    }),
    getAchivements: builder.query({
      query: body => ({
        url: 'achievements',
        method: 'GET',
        params: body,
      }),
      invalidatesTags: ['userPoints'],
    }),
    getAmerithonDistance: builder.query({
      query: body => ({
        url: '/event/amerithon-distances',
        method: 'GET',
        params: body,
      }),
      invalidatesTags: ['userPoints'],
    }),
    getEventModalities: builder.query({
      query: body => ({
        url: '/event/modalities',
        method: 'GET',
        params: body,
      }),
      invalidatesTags: ['userPoints'],
    }),
  }),
});

export const {
  useLazyGetCalandernfoQuery,
  useCreateCalanderEventMutation,
  useLazyGetUserPointDetailQuery,
  useLazyGetCalendarPointsQuery,
  useLazyGetAchivementsQuery,
  useLazyGetAmerithonDistanceQuery,
  useLazyGetEventModalitiesQuery,
  useUpdateUserPointsMutation,
} = CalanderApi;
