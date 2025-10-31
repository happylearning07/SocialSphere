
// rtnSlice.js

import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[],
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(action.payload.type ==='like'){
                state.likeNotification.push(action.payload);
            }else if(action.payload.type==='dislike'){
                state.likeNotification = state.likeNotification.filter((item)=>item.userId !=action.payload.userId);
            }
        },
        
        // FIX: Add the reducer to clear all notifications
        clearLikeNotification: (state) => {
            state.likeNotification = [];
        }
    }
});

// FIX: Export the new clear action
export const { setLikeNotification, clearLikeNotification } = rtnSlice.actions;
export default rtnSlice.reducer;