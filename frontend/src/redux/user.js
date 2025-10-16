import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  token:null,
  loading: false,
  error: null,
  roomParticipants: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.loading = false;
      state.userInfo = action.payload;
    },
    logout(state) {
      state.userInfo = null;
      state.token = null
      state.error = null;
      localStorage.clear()
    },
    setToken(state, action) {
      state.token = action.payload
    },
    setRoomParticipants(state, action) {
      state.roomParticipants = action.payload
    }
  },
});

export const { loginSuccess, logout, setToken, setRoomParticipants } = userSlice.actions;

export default userSlice.reducer;