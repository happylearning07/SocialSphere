import React from 'react'
import Feed from './Feed'
// import RightSidebar from './RightSidebar' // <--- REMOVE: No longer needed here
import { Outlet } from 'react-router-dom'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost()
    useGetSuggestedUsers()

    return (
        // The max-w-6xl mx-auto centers the feed, which is good.
        // We will remove the gap-8 as the layout is now handled by MainLayout.
        <div className='flex justify-center max-w-6xl mx-auto py-4'> 
            {/* Main feed */}
            {/* We use w-full to let it take up all available space within its container */}
            <div className='w-full min-w-0'> 
                <Feed />
                <Outlet />
            </div>

            {/* Right sidebar: REMOVED from here, as it's now in MainLayout and fixed. */}
        </div>
    )
}

export default Home

