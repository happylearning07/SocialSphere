import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        notifications:[],
        unreadCount: 0,
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        setNotifications:(state,action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification:(state,action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markNotificationAsRead:(state,action) => {
            const notification = state.notifications.find(n => n._id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount -= 1;
            }
        },
        markAllNotificationsAsRead:(state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        }
    }
});
export const {setOnlineUsers, setMessages, setNotifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead} = chatSlice.actions;
export default chatSlice.reducer;






