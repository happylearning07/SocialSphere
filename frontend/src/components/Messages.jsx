


//css-----------------
// Messages.jsx

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'


const getInitials = (name = '') => {
  const parts = (name || '').trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const formatTime = (timestamp) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return messageTime.toLocaleDateString();
}


// Accept the new prop: avatarGradientBorderClass
const Messages = ({ selectedUser, avatarGradientBorderClass }) => {
    useGetRTM();
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    return (    
        <div className='overflow-y-auto flex-1 p-4'>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    {/* Apply Gradient Border for the Avatar here */}
                    <div className={`${avatarGradientBorderClass}`}>
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                            <AvatarFallback>{getInitials(selectedUser?.username ?? '')}</AvatarFallback>
                        </Avatar>
                    </div>
                    <span>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}>
                        {/* NEW: Updated View Profile Button Color */}
                        <Button className="h-8 my-2 bg-pink-600 hover:bg-pink-700 text-white">View profile</Button>
                    </Link>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                {
                    messages && messages.map((msg, index) => {
                        const showDate = index === 0 || 
                            new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                        
                        return (
                            <div key={msg._id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                
                                <div className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className="flex flex-col max-w-xs">
                                        <div className={`p-2 rounded-lg break-words ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                            {msg.message}
                                        </div>
                                        <span className={`text-xs text-gray-500 mt-1 ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div> 
    )
}

export default Messages