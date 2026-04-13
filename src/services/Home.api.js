import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const HomeFullfilmentApi = createApi({
  reducerPath: 'homeApi',
  baseQuery,
  endpoints: builder => ({
    getHomeInfo: builder.query({
      query: ({start_date, end_date}) => ({
        url: 'user/points',
        params: {start_date, end_date},
      }),
      invalidatesTags: ['Achievements'],
    }),
    getTeamFollowers: builder.query({
      query: body => ({
        url: 'teams/followers',
        params: body,
      }),
    }),
    getPeopleFollowers: builder.query({
      query: body => ({
        url: 'follow/followers',
        params: body,
      }),
    }),
    getPeopleFollowing: builder.query({
      query: body => ({
        url: 'follow/followings',
        params: body,
      }),
    }),
    sentPeopleFollowRequest: builder.mutation({
      query: data => ({
        url: 'follow/following/request',
        method: 'POST',
        body: data,
      }),
    }),
    acceptPeopleFollowRequest: builder.mutation({
      query: data => ({
        url: 'follow/follow-request/accept',
        method: 'POST',
        body: data,
      }),
    }),
    declinePeopleFollowRequest: builder.mutation({
      query: data => ({
        url: 'follow/follow-request/decline',
        method: 'POST',
        body: data,
      }),
    }),
    cancelPeopleFollowRequest: builder.mutation({
      query: body => ({
        url: 'follow/follow-request/cancel',
        method: 'POST',
        body: body,
      }),
    }),
    cancelTeamFollowRequest: builder.mutation({
      query: body => ({
        url: 'user/follow/team/request/undo',
        method: 'POST',
        body: body,
      }),
    }),
    userParticipationsListing: builder.query({
      query: body => ({
        url: 'follow/user-participations',
        params: body,
      }),
    }),
    getTeamFollowing: builder.query({
      query: body => ({
        url: 'user/teams/following',
        params: body,
      }),
    }),
    teamRequestList: builder.query({
      query: body => ({
        url: 'user/teams/following/requests',
        params: body,
      }),
    }),
    peopleRequestList: builder.query({
      query: body => ({
        url: 'follow/following/requests',
        params: body,
      }),
    }),
    unfollowPerson: builder.mutation({
      query: data => ({
        url: 'follow/undo-following',
        method: 'POST',
        body: data,
      }),
    }),
    acceptTeamFollowRequest: builder.mutation({
      query: data => ({
        url: 'teams/follow/request/accept',
        method: 'POST',
        body: data,
      }),
    }),
    declineTeamFollowRequest: builder.mutation({
      query: data => ({
        url: 'teams/follow/request/decline',
        method: 'POST',
        body: data,
      }),
    }),
    sentTeamFollowRequest: builder.mutation({
      query: data => ({
        url: 'user/follow/team/request',
        method: 'POST',
        body: data,
      }),
    }),
    getFlag: builder.query({
      query: () => ({
        url: 'flag-banner',
      }),
    }),
  }),
});

export const {
  useLazyGetHomeInfoQuery,
  useLazyGetPeopleFollowersQuery,
  useLazyGetTeamFollowersQuery,
  useAcceptPeopleFollowRequestMutation,
  useDeclinePeopleFollowRequestMutation,
  useSentPeopleFollowRequestMutation,
  useCancelPeopleFollowRequestMutation,
  useLazyUserParticipationsListingQuery,
  useLazyTeamRequestListQuery,
  useLazyPeopleRequestListQuery,
  useAcceptTeamFollowRequestMutation,
  useDeclineTeamFollowRequestMutation,
  useSentTeamFollowRequestMutation,
  useGetFlagQuery,
  useLazyGetPeopleFollowingQuery,
  useLazyGetTeamFollowingQuery,
  useCancelTeamFollowRequestMutation,
  useUnfollowPersonMutation,
} = HomeFullfilmentApi;
