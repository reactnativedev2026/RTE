import {fetchBaseQuery} from '@reduxjs/toolkit/query';
import {store} from '../core/store';

export const baseQuery = async (args, api, extraOptions) => {
  // Get dynamic baseUrl from store state each time a request is made
  const state = store.getState();
  const baseUrl = state?.baseUrlReducer?.BaseUrl;
  // const baseUrl = state?.baseUrlReducer?.BaseUrl;

  // Create a fetchBaseQuery with this dynamic baseUrl
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, {endpoint}) => {
      const token = state?.loginReducer?.token;

      const contentType =
        endpoint === 'updateQuest' ? 'multipart/form-data' : 'application/json';
      headers.set('Content-Type', contentType);

      headers.set('Accept', 'application/json');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  });

  // Run the query with provided args/api/extraOptions
  return rawBaseQuery(args, api, extraOptions);
};
