import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const loginApi = createApi({
  reducerPath: 'login/api',
  baseQuery,
  endpoints: build => ({
    login: build.mutation({
      query: ({email, password}) => ({
        url: 'login',
        method: 'POST',
        body: {email, password},
      }),
    }),

    updatePassword: build.mutation({
      query: body => ({
        url: 'user/update-password',
        method: 'POST',
        body: body,
      }),
    }),
  }),
});

export const {useLoginMutation, useUpdatePasswordMutation} = loginApi;
