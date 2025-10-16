import { createSlice } from "@reduxjs/toolkit";

const codeSlice = createSlice({
  name: "code",
  initialState: {
    code: "",
    codeResult: null,
    stdin: null,
    runningStatus: {
      username: null,
      status: false, // true when someone is running code
    },
  },
  reducers: {
    saveCode: (state, action) => {
      state.code = action.payload;
    },
    setResult: (state, action) => {
      state.codeResult = action.payload;
    },
    setStdIn: (state, action) => {
      state.stdin = action.payload;
    },
    setRunningStatus: (state, action) => {
      state.runningStatus = action.payload; // { username, status }
    },
  },
});

export const { saveCode, setResult, setStdIn, setRunningStatus } = codeSlice.actions;
export default codeSlice.reducer;
