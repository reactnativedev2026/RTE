import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const FollowApi = createApi({
  reducerPath: 'followApi',
  baseQuery,
  endpoints: builder => ({
    getFollowings: builder.query({
      query: ({event_id}) => ({
        url: 'follow/followings',
        params: {event_id},
      }),
    }),
  }),
});

export const {} = FollowApi;
