import {createSlice} from '@reduxjs/toolkit';

// Define the User type
interface User {
  id?: string | number;
  token?: string | undefined | null;
  time_zone_name?: string;
  has_team?: boolean | undefined;
  preferred_event_id?: string | number; // Adjust the type (string/number)
  preferred_team_id?: string | number; // Adjust the type (string/number)
  [key: string]: any; // Optional: To allow additional dynamic properties
}

// Define the AuthState interface
interface AuthState {
  user: User;
  token: string | null;
  completeProfile: any | null;
  teamAchievement: any | null;
  eventDetail: any | null;
  eventList: any[];
  teamDetail: any | null;
  refetchYears: boolean;
}

const initialState: AuthState = {
  user: {},
  token: null,
  completeProfile: null,
  teamAchievement: null,
  eventDetail: null,
  eventList: [],
  teamDetail: null,
  refetchYears: false,
};

const authSlice = createSlice({
  name: 'loginReducer',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setCompleteProfile: (state, action) => {
      state.completeProfile = action.payload;
    },
    setEventDetail: (state, action) => {
      state.eventDetail = action.payload;
    },
    setEventList: (state, action) => {
      state.eventList = action.payload;
    },
    setTeamDetail: (state, action) => {
      state.teamDetail = action.payload;
    },
    setRefetchYears: state => {
      state.refetchYears = !state.refetchYears;
    },
    setResetLogin: () => initialState,
  },
});
// Not using Right Now
export const {
  setUser,
  setToken,
  setCompleteProfile,
  setEventDetail,
  setEventList,
  setResetLogin,
  setTeamDetail,
  setRefetchYears,
} = authSlice.actions;
export const loginReducer = authSlice.reducer;
