import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery,
  endpoints: build => ({
    getLastThirtyDays: build.query({
      query: body => ({
        url: '/user/points/last-30-days',
        params: body,
      }),
    }),
    getMileageByActivityType: build.query({
      query: body => ({
        url: '/user/points/by-modality',
        params: body,
      }),
    }),
    getMileageByMonth: build.query({
      query: body => ({
        url: '/user/stats',
        params: body,
      }),
    }),
  }),
});

export const {
  useLazyGetLastThirtyDaysQuery,
  useLazyGetMileageByActivityTypeQuery,
  useLazyGetMileageByMonthQuery,
} = statsApi;
