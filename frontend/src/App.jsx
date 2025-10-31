// src/App.jsx
import React, { useEffect, useRef } from "react";
import ChatPage from './components/ChatPage';
import EditProfile from './components/EditProfile';
import Home from './components/Home';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import Profile from './components/Profile';
import Search from './components/Search';
import Signup from './components/Signup';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice'; // <-- add this
import { addNotification } from './redux/chatSlice';
import ProtectedRoutes from "./components/ProtectedRoutes";



const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes> <MainLayout /> </ProtectedRoutes>,
    children: [
      { path: "/", element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: "/profile/:id", element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: "/account/edit", element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: "/chat", element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
      { path: "/search", element: <ProtectedRoutes><Search /></ProtectedRoutes> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  


  useEffect(() => {
    if (!user?.id && !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const uid = user?.id ?? user?._id;
    console.log("Connecting socket with user id:", uid);

    socketRef.current = io('https://socialsphere-3i0t.onrender.com', {
      query: { userId: uid },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('getOnlineUsers', (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketRef.current.on('notification', (notification) => {
      console.log('Received notification:', notification); // debug
      dispatch(setLikeNotification(notification));
    });

    socketRef.current.on('newNotification', (notification) => {
      console.log('Received message notification:', notification);
      dispatch(addNotification(notification));
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, dispatch]);




  return <RouterProvider router={browserRouter} />;
}

export default App;
















