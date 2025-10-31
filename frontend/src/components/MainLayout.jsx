
//------css--------



// MainLayout.jsx

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import LeftSideBar from './LeftSideBar'
import RightSidebar from './RightSidebar' 

const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/'; 

    // **IDENTIFY THE CHAT PAGE**
    const isChatPage = location.pathname.startsWith('/chat');

    // The right sidebar space is only needed for the Home page
    const contentPaddingClass = isHomePage ? 'lg:pr-80' : 'lg:pr-0';
    
    // **NEW: Adjust main content margin based on whether the LeftSideBar is visible**
    const chatPageMarginClass = isChatPage ? 'md:pl-0' : 'md:pl-64';

    // The main container gradient
    const mainGradient = 'bg-gradient-to-br from-[#00CED1] via-[#87CEEB] to-[#FFB6C1]';

    return (
        <div className={`flex h-screen ${mainGradient}`}>
            
            {/* **NEW: Conditionally render LeftSideBar** */}
            {/* Left sidebar: fixed - only show if NOT on the chat page */}
            {!isChatPage && <LeftSideBar />}

            {/* Main content wrapper */}
            <div className={`flex-1 ${chatPageMarginClass} ${contentPaddingClass} overflow-y-auto bg-transparent`}> 
                <Outlet />
            </div>
            
            {/* Right sidebar: Fixed, shown only on Home page */}
            {isHomePage && (
                <div className='hidden lg:block fixed right-0 top-0 h-screen w-80 p-4 pt-10 overflow-y-auto no-scrollbar'>
                    <RightSidebar />
                </div>
            )}
            
        </div>
    )
}

export default MainLayout