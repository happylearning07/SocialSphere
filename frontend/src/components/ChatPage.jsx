import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, ArrowLeft } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import { Link } from 'react-router-dom';


const getInitials = (name = '') => {
    const parts = (name || '').trim().split(/\s+/)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const mainGradientClass = 'bg-gradient-to-br from-[#00CED1] via-[#87CEEB] to-[#FFB6C1]';
    // Define the gradient for the avatar borders
    const avatarGradientBorderClass = 'p-[2px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500'; 
    
    // NEW: Gradient to match the LeftSideBar visual style (Pale Lime -> Pink/Purple)
    const contactsGradientClass = 'bg-gradient-to-br from-[#d4f8b9] via-[#f7e3e9] to-[#d8b4e2]'; // Example colors matching the image


    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`https://socialsphere-3i0t.onrender.com/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[]);

    return (
        <div className='flex h-screen w-full'>
            {/* UPDATED: Apply the LeftSidebar-matching gradient to the contacts section */}
            <section className={`w-full md:w-[350px] my-0 border-r border-r-gray-200 ${contactsGradientClass}`}> 
                
                {/* Back Button / User Header - Set text/icon to black for light background */}
                <div className='flex items-center p-3 border-b border-gray-300'>
                    <Link to="/" className="mr-3"> 
                        <Button variant="ghost" className="p-0 h-auto text-black">
                            <ArrowLeft className='w-6 h-6' /> 
                        </Button>
                    </Link>
                    <h1 className='font-bold text-xl text-black'>{user?.username}</h1>
                </div>
                
                {/* Contacts List */}
                <div className='overflow-y-auto h-[90vh] no-scrollbar'> 
                    {
                        suggestedUsers.map((suggestedUser) => {
                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            return (
                                <div 
                                    key={suggestedUser?._id}
                                    onClick={() => dispatch(setSelectedUser(suggestedUser))} 
                                    // Use dark hover for light background
                                    className='flex gap-3 items-center p-3 hover:bg-black/5 cursor-pointer transition-colors duration-100'
                                >
                                    {/* Gradient Border for Avatars in Contacts List */}
                                    <div className={`${avatarGradientBorderClass}`}>
                                        <Avatar className='w-14 h-14'>
                                            <AvatarImage src={suggestedUser?.profilePicture} />
                                            <AvatarFallback>{getInitials(suggestedUser?.username ?? '')}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className='flex flex-col'>
                                        {/* Set contact names to black */}
                                        <span className='font-medium text-black'>{suggestedUser?.username}</span>
                                        {/* Set status text to standard dark colors */}
                                        <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'} `}>{isOnline ? 'online' : 'offline'}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>
            {
                selectedUser ? (
                    <section className='flex-1 flex flex-col h-full'>
                        {/* Chat Header */}
                        <div className={`flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 z-10 ${mainGradientClass}`}>
                            {/* Gradient Border for Selected User Avatar in Chat Header */}
                            <div className={`${avatarGradientBorderClass}`}>
                                <Avatar>
                                    <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                    <AvatarFallback>{getInitials(selectedUser?.username ?? '')}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className='flex flex-col'>
                                <span className='font-bold text-white'>{selectedUser?.username}</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <Messages selectedUser={selectedUser} avatarGradientBorderClass={avatarGradientBorderClass} /> 

                        <div className='flex items-center p-4 border-t border-t-gray-300'>
                            <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className='flex-1 mr-2 focus-visible:ring-transparent' placeholder="Messages..." />
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)} className="bg-purple-600 hover:bg-purple-700 text-white">Send</Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center mx-auto'>
                        <MessageCircleCode className='w-32 h-32 my-4' />
                        <h1 className='font-medium'>Your messages</h1>
                        <span>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage