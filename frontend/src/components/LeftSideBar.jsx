// ---------- css ---------------
// LeftSideBar.jsx



import React, { useState } from 'react';
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setSelectedPost, setPosts } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

// IMPORTANT: Ensure this path is correct and the action is exported in rtnSlice.js
import { clearLikeNotification } from '@/redux/rtnSlice'; 
import { addNotification, markNotificationAsRead } from '@/redux/chatSlice';
import LogoIcon from "@/assets/logo.png"; 
import useGetNotifications from '@/hooks/useGetNotifications'; 

const SIDEBAR_GRADIENT_CLASS = 'bg-gradient-to-br from-lime-200 to-pink-200';

const LeftSideBar = () => {
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const { notifications } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    // State to control Popover visibility (managed by Radix/Shadcn)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Fetch notifications
    useGetNotifications(); 

    const avatarGradientBorderClass = 'p-[2px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500';

    // FIX 1: Function to handle popover visibility change, clear badge, and ensure standard close behavior
    const handlePopoverOpenChange = (newOpenState) => {
        setIsPopoverOpen(newOpenState);

        // Logic to clear the badge when the popover OPENS
        if (newOpenState === true && likeNotification.length > 0) {
             dispatch(clearLikeNotification()); 
        }
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get('https://socialsphere-3i0t.onrender.com/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        }
        else if (textType === "Create") {
            setOpen(true);
        } else if (textType == "Profile") {
            navigate(`/profile/${user?.id}`);
        } else if (textType == "Home") {
            navigate("/");
        } else if (textType == "Messages") {
            navigate("/chat");
        } else if (textType == "Search") {
            navigate("/search");
        }
    }

    const initials = (() => {
        if (!user?.username) return "U";
        const namePart = user.username.includes("@")
            ? user.username.split("@")[0].trim()
            : user.username.trim();
        return namePart.slice(0, 2).toUpperCase();
    })();

    const sidebarItems = [
        { element: <Home className='w-6 h-6' />, text:"Home" },
        { element: <Search className='w-6 h-6' />, text:"Search" },
        // { element: <TrendingUp className='w-6 h-6' />, text:"Explore" },
        { element: <MessageCircle className='w-6 h-6' />, text:"Messages", hasNotification: true },
        // { element: <Heart className='w-6 h-6' />, text:"Notification" },
        { element: <PlusSquare className='w-6 h-6' />, text:"Create" },
        {
            element:(
                <div className={avatarGradientBorderClass}>
                    <Avatar className='w-6 h-6 border-2 border-white'>
                        {user?.profilePicture ? (
                            <AvatarImage src={user.profilePicture} alt={user.username || "user"} />
                        ) : (
                            <AvatarFallback>{initials}</AvatarFallback>
                        )}
                    </Avatar>
                </div>
            ),
            text:"Profile"
        },
        { element: <LogOut className='w-6 h-6' />, text:"Logout" },
    ];

    // derived counts
    const unreadMessages = (notifications || []).filter(n => n.type === 'message' && !n.isRead).length;
    const unreadLikesPersistent = (notifications || []).filter(n => n.type === 'like' && !n.isRead).length;
    const unreadLikesTotal = (likeNotification?.length || 0) + unreadLikesPersistent;

    return (
        <aside className={`hidden md:block fixed top-0 left-0 z-20 h-screen w-64 px-4 pt-4 pb-6 shadow-lg ${SIDEBAR_GRADIENT_CLASS} rounded-r-xl`}>
            <div className='flex flex-col h-full'>
                
                <img 
                    src={LogoIcon} 
                    alt="InstaClone Logo" 
                    className='h-44 w-44' 
                />

                <nav className='flex-1 mt-4'>
                    {sidebarItems.map((item, index) => {
                        const isNotificationItem = item.text === "Notification";
                        const isMessageItem = item.text === "Messages";
                        
                        // Handler logic: Only allow navigation on non-Notification items.
                        const clickHandler = !isNotificationItem
                            ? () => sidebarHandler(item.text) 
                            : () => {}; // No-op for the outer div of notification

                        return (
                            <div
                                onClick={clickHandler}
                                key={index}
                                className='flex items-center gap-3 hover:bg-pink-100/50 text-gray-700 font-medium cursor-pointer rounded-xl p-2 my-1.5 relative transition-colors duration-150'
                            >
                                {item.element} 
                                <span className='text-sm'>{item.text}</span>

                                {item.text === "Messages" && (
                                    <Popover onOpenChange={async (open) => {
                                        if (open) {
                                            // mark only message notifications as read
                                            const msgs = (notifications || []).filter(n => n.type === 'message' && !n.isRead);
                                            for (const n of msgs) {
                                                try { await axios.patch(`https://socialsphere-3i0t.onrender.com/api/v1/message/notifications/${n._id}/read`, {}, { withCredentials: true }); } catch(e) {}
                                                dispatch(markNotificationAsRead(n._id));
                                            }
                                        }
                                    }}>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="ghost"
                                                className="p-0 h-auto relative ml-auto flex items-center justify-center"
                                                onClick={async () => {
                                                    // mark only message notifications as read
                                                    const msgs = (notifications || []).filter(n => n.type === 'message' && !n.isRead);
                                                    for (const n of msgs) {
                                                        try { await axios.patch(`https://socialsphere-3i0t.onrender.com/api/v1/message/notifications/${n._id}/read`, {}, { withCredentials: true }); } catch(e) {}
                                                        dispatch(markNotificationAsRead(n._id));
                                                    }
                                                    navigate("/chat")
                                                }}
                                            >
                                                <MessageCircle className='w-6 h-6 text-gray-700' />
                                                {unreadMessages > 0 && (
                                                    <span className='rounded-full h-5 w-5 bg-blue-600 text-white text-xs absolute -top-1 right-1 z-10 flex items-center justify-center'>
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        
                                        <PopoverContent className={`p-0 ${SIDEBAR_GRADIENT_CLASS} border-none w-72`}>
                                            <div className='max-h-64 overflow-y-auto rounded-md'>
                                                {(notifications || []).filter(n => n.type === 'message').map((notification) => (
                                                    <div 
                                                        key={notification._id} 
                                                        className='flex items-center gap-3 p-3 border-b border-gray-300 hover:bg-black/5'
                                                    >
                                                        <div className={avatarGradientBorderClass}>
                                                            <Avatar className='w-8 h-8'>
                                                                <AvatarImage src={notification.senderId?.profilePicture} />
                                                                <AvatarFallback>{notification.senderId?.username?.slice(0, 1).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                        <p className='text-sm text-gray-800'>
                                                            <span className='font-bold text-black'>{notification.senderId?.username}</span> 
                                                            <span className='ml-1'>sent you a message.</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {(notifications || []).filter(n => n.type === 'message').length === 0 && (
                                                <div className='p-4 text-center text-sm text-gray-600'>
                                                    No new messages.
                                                </div>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                )}

                                {isNotificationItem && (
                                    // Unified notifications popover (likes + messages)
                                    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                                        <PopoverTrigger asChild>
                                            {/* Combined Heart Icon and Badge into a single, functional trigger */}
                                            <Button 
                                                variant="ghost" // Makes the button look transparent/like an icon
                                                className="p-0 h-auto relative ml-auto flex items-center justify-center"
                                            >
                                                <Heart className='w-6 h-6 text-gray-700' />
                                                {/* Badge: only likes (socket + persistent unread likes) */}
                                                {(unreadLikesTotal) > 0 && (
                                                    <span className='rounded-full h-5 w-5 bg-red-600 text-white text-xs absolute -top-1 right-1 z-10 flex items-center justify-center'>
                                                        {unreadLikesTotal}
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        
                                        <PopoverContent className={`p-0 ${SIDEBAR_GRADIENT_CLASS} border-none w-72`}>
                                            <div className='max-h-64 overflow-y-auto rounded-md'>
                                                {/* Socket like notifications (non-persistent) */}
                                                {(likeNotification || []).map((n) => {
                                                    const username = n.userDetails?.username || n.sender?.username || 'Unknown User'
                                                    const profilePicture = n.userDetails?.profilePicture || n.sender?.profilePicture
                                                    return (
                                                        <div key={n.timestamp || username} className='flex items-center gap-3 p-3 border-b border-gray-300 hover:bg-black/5'>
                                                            <div className={avatarGradientBorderClass}>
                                                                <Avatar className='w-8 h-8'>
                                                                    <AvatarImage src={profilePicture} />
                                                                    <AvatarFallback>{username.slice(0,1).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                            <p className='text-sm text-gray-800'>
                                                                <span className='font-bold text-black'>{username}</span>
                                                                <span className='ml-1'>liked your post.</span>
                                                            </p>
                                                        </div>
                                                    )
                                                })}

                                                {/* Persistent notifications (likes only here) */}
                                                {(notifications || []).filter(n => n.type === 'like').map((n) => {
                                                    const username = n.senderId?.username || n.sender?.username || 'Unknown User'
                                                    const profilePicture = n.senderId?.profilePicture || n.sender?.profilePicture
                                                    return (
                                                        <div
                                                            key={n._id}
                                                            className='flex items-center gap-3 p-3 border-b border-gray-300 hover:bg-black/5 cursor-pointer'
                                                            onClick={async () => {
                                                                try { await axios.patch(`https://socialsphere-3i0t.onrender.com/api/v1/message/notifications/${n._id}/read`, {}, { withCredentials: true }); } catch (e) {}
                                                                dispatch(markNotificationAsRead(n._id));
                                                            }}
                                                        >
                                                            <div className={avatarGradientBorderClass}>
                                                                <Avatar className='w-8 h-8'>
                                                                    <AvatarImage src={profilePicture} />
                                                                    <AvatarFallback>{username.slice(0,1).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <p className='text-sm text-gray-800'>
                                                                    <span className='font-bold text-black'>{username}</span>
                                                                    <span className='ml-1'>liked your post.</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            
                                            {((likeNotification?.length || 0) + unreadLikesPersistent) === 0 && (
                                                <div className='p-4 text-center text-sm text-gray-600'>
                                                    No likes yet.
                                                </div>
                                            )}
                                        </PopoverContent>
                                        
                                    </Popover>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className='mt-auto'>
                    <CreatePost open={open} setOpen={setOpen}/>
                </div>
            </div>
        </aside>
    );
}

export default LeftSideBar;