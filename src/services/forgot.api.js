import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const forgotApi = createApi({
  reducerPath: 'Forgot/api',
  baseQuery,
  endpoints: build => ({
    forgot: build.mutation({
      query: body => ({
        url: 'forgot-password',
        method: 'POST',
        body: body,
      }),
    }),
  }),
});

export const {useForgotMutation} = forgotApi;
