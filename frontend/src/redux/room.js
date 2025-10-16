import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  room: null,
  roomParticipants: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom(state, action) {
      state.room = action.payload
    },
    clearRoom(state) {
      state.room = null
      state.roomParticipants = null
    }
  },
});

export const { setRoom , clearRoom} = roomSlice.actions;

export default roomSlice.reducer;