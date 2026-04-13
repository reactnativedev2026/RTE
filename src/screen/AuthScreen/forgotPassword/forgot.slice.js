import {createSlice} from '@reduxjs/toolkit';

const initialState = {forgot: {}};

const authSlice = createSlice({
  name: 'forgot',
  initialState,
  reducers: {
    setForgot: (state, action) => {
      state.forgot = action.payload;
    },
  },
});
// Not using Right Now
export const {setForgot} = authSlice.actions;
export const loginReducer = authSlice.reducer;
