import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  AttitudeList: '',
};

const authSlice = createSlice({
  name: 'TrackerReducer',
  initialState,
  reducers: {
    setAttitideList: (state, action) => {
      state.AttitudeList = action.payload;
    },
  },
});

export const {setAttitideList} = authSlice.actions;
export const TrackerReducer = authSlice.reducer;
