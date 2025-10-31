//-----after css----------------
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'

const getInitials = (name = '') => {
    const parts = (name || '').trim().split(/\s+/)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

const RightSidebar = () => {
    const { user } = useSelector(store => store.auth || {})

    return (
        // The outer container handles the full height of the fixed panel
        <div className='text-gray-800 h-full'> 
            {/* The inner container gets background, rounded corners, and uses flex-col */}
            <div className='rounded-xl p-4 bg-gradient-to-br from-lime-200 to-pink-200 h-full flex flex-col'>
                
                {/* User Mini-Profile */}
                <div className='flex items-center gap-2 mb-6 text-gray-900'>
                    <Link to={`/profile/${user?.id}`}>
                        <div className='p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600'> 
                            <Avatar className="w-12 h-12 border-2 border-white">
                                {user?.profilePicture ? (
                                    <AvatarImage src={user?.profilePicture} alt={`${user?.username}'s avatar`} />
                                ) : (
                                    <AvatarFallback>{getInitials(user?.username ?? '')}</AvatarFallback>
                                )}
                            </Avatar>
                        </div>
                    </Link>

                    <div>
                        <h1 className='font-bold text-base text-gray-900'>
                            <Link to={`/profile/${user?.id}`}>{user?.username}</Link>
                        </h1>
                        <span className='text-gray-600 text-sm block truncate w-40'>{user?.bio || 'Bio here...'}</span>
                    </div>
                </div>

                {/* Suggested Users Section Heading */}
                <h2 className='text-md font-semibold text-gray-900'>Suggested for you</h2>
                
                {/* Suggested Users Component: THE SCROLLABLE CONTAINER */}
                {/* KEY CHANGE: Added 'no-scrollbar' class here */}
                <div className='mt-3 flex-grow overflow-y-auto no-scrollbar'>
                    <SuggestedUsers defaultCount={5} isDarkBackground={false} /> 
                </div>
            </div>
        </div>
    )
}

export default RightSidebar