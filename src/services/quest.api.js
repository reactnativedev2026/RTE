import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const questApi = createApi({
  reducerPath: 'questApi',
  baseQuery,
  tagTypes: ['Quests'],
  endpoints: builder => ({
    getManageQuest: builder.query({
      query: body => ({
        url: '/quests',
        params: body,
        method: 'GET',
      }),
      providesTags: ['Quests'],
    }),
    getQuestActivities: builder.query({
      query: body => ({
        url: '/quests/activities',
        params: body,
        method: 'GET',
      }),
    }),
    createScheduleQuest: builder.mutation({
      query: body => ({
        url: '/quests/create',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Quests'],
    }),
    updateQuest: builder.mutation({
      query: body => ({
        url: '/quests/update',
        method: 'POST',
        body: body,
        formData: true,
      }),
      invalidatesTags: ['Quests'],
    }),
    deleteQuest: builder.mutation({
      query: body => ({
        url: '/quests/delete',
        method: 'DELETE',
        body: body,
      }),
      invalidatesTags: ['Quests'],
    }),
    getJournalList: builder.query({
      query: body => ({
        url: '/quests/journal',
        params: body,
        method: 'GET',
      }),
    }),
    moveToHistory: builder.mutation({
      query: body => ({
        url: '/quests/archive',
        method: 'POST',
        body: body,
      }),
    }),
    getTrophyCases: builder.query({
      query: body => ({
        url: '/event/trophy-cases',
        params: body,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetManageQuestQuery,
  useLazyGetManageQuestQuery,
  useLazyGetQuestActivitiesQuery,
  useCreateScheduleQuestMutation,
  useUpdateQuestMutation,
  useDeleteQuestMutation,
  useLazyGetJournalListQuery,
  useMoveToHistoryMutation,
  useLazyGetTrophyCasesQuery,
} = questApi;
