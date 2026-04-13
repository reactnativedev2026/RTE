import {createSlice} from '@reduxjs/toolkit';
import {Routes} from '../../utils/Routes';

const initialState = {
  homeListingItems: {},
  activeTab: Routes.HOME_STACK,
};

const authSlice = createSlice({
  name: 'homeReducer',
  initialState,
  reducers: {
    setHomeListing: (state, action) => {
      state.homeListingItems = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {setHomeListing, setActiveTab} = authSlice.actions;
export const homeReducer = authSlice.reducer;
