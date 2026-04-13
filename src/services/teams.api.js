import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const TeamsApi = createApi({
  reducerPath: 'teams/api',
  baseQuery,
  tagTypes: ['PendingInvites', 'acceptRequest'],
  endpoints: builder => ({
    getTeamAchievements: builder.query({
      query: body => ({
        url: 'teams/achievements',
        params: body,
      }),
      providesTags: ['acceptRequest'],
    }),

    createATeam: builder.mutation({
      query: body => ({
        url: 'teams/create',
        method: 'POST',
        body: body,
      }),
    }),

    getATeams: builder.query({
      query: body => {
        return {
          url: 'teams',
          params: body,
        };
      },
    }),
    getFollowTeams: builder.query({
      query: body => {
        return {
          url: 'teams/follow-to/list',
          params: body,
        };
      },
    }),

    requestJoinAteam: builder.mutation({
      query: body => ({
        url: 'teams/join-request',
        method: 'POST',
        body: body,
      }),
    }),

    leaveATeam: builder.mutation({
      query: body => ({
        url: 'teams/leave',
        method: 'POST',
        body: body,
      }),
    }),

    inviteAMembership: builder.mutation({
      query: body => ({
        url: 'teams/invite/membership',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['PendingInvites'],
    }),

    dissolveTeam: builder.mutation({
      query: body => ({
        url: 'teams/dissolve',
        method: 'POST',
        body: body,
      }),
    }),

    transferAdminRole: builder.mutation({
      query: body => ({
        url: 'teams/transfer-admin-role',
        method: 'POST',
        body: body,
      }),
    }),
    updateTeam: builder.mutation({
      query: ({teamId, body}) => ({
        url: `teams/update/${teamId}`,
        method: 'PATCH',
        body: body,
      }),
    }),
    getTeamDetail: builder.query({
      query: ({teamId, body}) => ({
        url: `/teams/team/${teamId}`,
        method: 'GET',
        params: body,
      }),
    }),
    getUsersToInvite: builder.query({
      query: body => ({
        url: '/teams/invitation/users/search',
        method: 'GET',
        params: body,
      }),
    }),
    getPendingInvites: builder.query({
      query: body => ({
        url: '/teams/membership/invites',
        method: 'GET',
        params: body,
      }),
      providesTags: ['PendingInvites'],
    }),
    removeTeamMember: builder.mutation({
      query: body => ({
        url: '/teams/member/remove',
        method: 'POST',
        body: body,
      }),
    }),
    getPendingRequests: builder.query({
      query: body => ({
        url: '/teams/membership/requests',
        method: 'GET',
        params: body,
      }),
    }),
    acceptMemberRequest: builder.mutation({
      query: body => ({
        url: '/teams/membership-request/accept',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['acceptRequest'],
    }),
    cancelMemberRequest: builder.mutation({
      query: body => ({
        url: '/teams/cancel-request',
        method: 'POST',
        body: body,
      }),
    }),
    acceptTeamMemberRequest: builder.mutation({
      query: body => ({
        url: '/user/team/membership-request/accept',
        method: 'POST',
        body: body,
      }),
    }),
    declineTeamMemberRequest: builder.mutation({
      query: body => ({
        url: '/user/team/membership-request/decline',
        method: 'POST',
        body: body,
      }),
    }),
    followingTeam: builder.query({
      query: body => ({
        url: '/user/teams/following',
        params: body,
      }),
      providesTags: ['acceptRequest'],
    }),
    getTeamInvitations: builder.query({
      query: body => {
        return {
          url: 'user/team/membership/invites',
          params: body,
        };
      },
    }),
  }),
});

export const {
  useGetTeamAchievementsQuery,
  useLazyGetTeamAchievementsQuery,
  useCreateATeamMutation,
  useLazyGetATeamsQuery,
  useRequestJoinAteamMutation,
  useLeaveATeamMutation,
  useInviteAMembershipMutation,
  useDissolveTeamMutation,
  useTransferAdminRoleMutation,
  useUpdateTeamMutation,
  useLazyGetTeamDetailQuery,
  useLazyGetUsersToInviteQuery,
  useLazyGetPendingInvitesQuery,
  useGetPendingInvitesQuery,
  useRemoveTeamMemberMutation,
  useLazyGetPendingRequestsQuery,
  useAcceptMemberRequestMutation,
  useAcceptTeamMemberRequestMutation,
  useDeclineTeamMemberRequestMutation,
  useFollowingTeamQuery,
  useLazyGetFollowTeamsQuery,
  useLazyGetTeamInvitationsQuery,
  useCancelMemberRequestMutation,
} = TeamsApi;
