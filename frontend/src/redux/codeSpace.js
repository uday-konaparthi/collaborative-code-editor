import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  selected: false
};

const codeSpaceSlice = createSlice({
  name: 'codeSpace',
  initialState,
  reducers: {
    setSelected(state, action) {
      state.selected = action.payload;
      state.userId = action.payload;
    },
    clearSelected(state) {
      state.selected = false;
      state.userId = null;
    },
  },
});

export const { setSelected, clearSelected } = codeSpaceSlice.actions;

export default codeSpaceSlice.reducer;