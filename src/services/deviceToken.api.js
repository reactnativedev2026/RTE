import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const deviceTokenApi = createApi({
  reducerPath: 'deviceToken/api',
  baseQuery,
  endpoints: build => ({
    saveDeviceToken: build.mutation({
      query: body => ({
        url: 'user/device-token',
        method: 'POST',
        body,
      }),
    }),

    deactivateDeviceToken: build.mutation({
      query: token => ({
        url: 'user/device-token/deactivate',
        method: 'POST',
        body: {token},
      }),
    }),
  }),
});

export const {useSaveDeviceTokenMutation, useDeactivateDeviceTokenMutation} =
  deviceTokenApi;
