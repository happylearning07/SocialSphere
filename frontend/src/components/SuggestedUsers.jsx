//----------------------css---------------------------------------
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const getInitials = (name = '') => {
    const parts = (name || '').trim().split(/\s+/)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Since RightSidebar passes isDarkBackground=false, we use dark text for a light background.
const SuggestedUsers = ({ defaultCount = 5, isDarkBackground = false }) => {
    const { suggestedUsers = [] } = useSelector(store => store.auth || {});

    // Color logic for the light background of RightSidebar (lime/pink gradient)
    const textColorClass = 'text-gray-900';        // Dark text for usernames
    const subTextColorClass = 'text-gray-600';     // Lighter dark text for bio
    const actionColorClass = 'text-blue-600';      // Strong blue for 'See All' and 'Follow' actions

    const users = Array.isArray(suggestedUsers) ? suggestedUsers : []
    const [showAll, setShowAll] = useState(false)
    const renderedUsers = showAll ? users : users.slice(0, defaultCount)

    return (
        <div className=''> 
            <div className='flex items-center justify-end text-sm mb-2'> 
                {/* Toggle link color: Only show if there are more users than defaultCount */}
                {users.length > defaultCount && (
                    <button
                        onClick={() => setShowAll(prev => !prev)}
                        className={`font-medium cursor-pointer text-sm ${actionColorClass} hover:text-blue-800 transition`}
                    >
                        {showAll ? 'Show less' : 'See All'}
                    </button>
                )}
            </div>

            {renderedUsers.map((user) => {
                const id = user?._id ?? user?.id ?? user?.username
                return (
                    <div key={id} className='flex items-center justify-between my-3'>
                        <div className='flex items-center gap-3 min-w-0'> {/* min-w-0 added for better truncation */}
                            <Link to={`/profile/${user?._id ?? user?.id}`}>
                                {/* START: Gradient Avatar Boundary */}
                                <div className='p-[1.5px] rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600'> 
                                    <Avatar className="w-10 h-10 border-2 border-white">
                                        {user?.profilePicture ? (
                                            <AvatarImage src={user.profilePicture} alt={`${user?.username}'s avatar`} />
                                        ) : (
                                            <AvatarFallback>{getInitials(user?.username ?? '')}</AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>
                                {/* END: Gradient Avatar Boundary */}
                            </Link>

                            <div className='min-w-0 flex-1'> {/* flex-1 ensures it takes available space before follow button */}
                                {/* Username is dark and bold */}
                                <h1 className={`font-semibold text-sm truncate ${textColorClass}`}>
                                    <Link to={`/profile/${user?._id ?? user?.id}`}>{user?.username}</Link>
                                </h1>
                                {/* Bio is a slightly lighter dark text */}
                                <span className={`text-xs ${subTextColorClass} block truncate`}>{user?.bio || 'Bio here...'}</span>
                            </div>
                        </div>

                        {/* Follow button is strong blue */}
                        {/* <span className={`text-xs font-bold cursor-pointer flex-shrink-0 ${actionColorClass} hover:text-blue-800 transition`}>Follow</span> */}
                    </div>
                )
            })}

            {/* Small note when there are no users */}
            {users.length === 0 && <div className={`text-sm mt-3 ${subTextColorClass}`}>No suggestions yet</div>}
        </div>
    )
}

export default SuggestedUsers