import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  connections: []
}

const connectionSlice = createSlice({
  name: "connection",
  initialState: initialValue,
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    addConnections: (state, action) => {
      state.connections.push(action.payload);
    },
    clearConnections: (state) => {
      state.connections = [];
    }
  }
})

export default connectionSlice.reducer;

export const {setConnections, addConnections, clearConnections} = connectionSlice.actions;