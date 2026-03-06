import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notifications: [],
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const {addNotification, removeNotification} = uiSlice.actions;
export default uiSlice.reducer;
