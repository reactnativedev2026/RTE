import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  calanderData: {},
  eventData: {},
};

const authSlice = createSlice({
  name: 'calanderData',
  initialState,
  reducers: {
    setCalanderData: (state, action) => {
      state.calanderData = action.payload;
    },
    setEventData: (state, action) => {
      state.eventData = action.payload;
    },
  },
});

export const {setCalanderData, setEventData} = authSlice.actions;
export const calanderReducer = authSlice.reducer;
