import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const monthlyGoalApi = createApi({
  reducerPath: 'monthlyGoalApi',
  baseQuery,
  tagTypes: ['MonthlyGoal'],
  endpoints: builder => ({
    getYearlyMonthlyGoal: builder.query({
      query: params => ({
        url: '/monthly-goal/yearly',
        method: 'GET',
        params,
      }),
      providesTags: ['MonthlyGoal'],
    }),
    setMonthlyGoal: builder.mutation({
      query: body => ({
        url: '/monthly-goal',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MonthlyGoal'],
    }),
  }),
});

export const {
  useGetYearlyMonthlyGoalQuery,
  useLazyGetYearlyMonthlyGoalQuery,
  useSetMonthlyGoalMutation,
} = monthlyGoalApi;
