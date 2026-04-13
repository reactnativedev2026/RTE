import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  BaseUrl: '',
};

const BaseUrlSlice = createSlice({
  name: 'BaseUrlSlice',
  initialState,
  reducers: {
    setBaseUrl: (state, action) => {
      state.BaseUrl = action.payload;
    },
  },
});

export const {setBaseUrl} = BaseUrlSlice.actions;
export const baseUrlReducer = BaseUrlSlice.reducer;
