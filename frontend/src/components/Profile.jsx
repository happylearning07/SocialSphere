import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile'
import { Link, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from './ui/button'
import { Badge } from 'lucide-react'
import { AtSign } from 'lucide-react'
import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser, setUserProfile } from '@/redux/authSlice'

const getInitials = (name = '') => {
    if (!name) return ''
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

const Profile = () => {
    const params = useParams()
    const userId = params.id
    useGetUserProfile(userId)
    const [activeTab,setActiveTab] = useState('posts');
    const dispatch = useDispatch();

    const { userProfile, user } = useSelector(store => store.auth)
    
    const isLoggedInUserProfile = user?.id==userProfile?._id;
    const isFollowing = user?.following?.includes(userProfile?._id) || false;

    // Define the consistent gradient styles
    const avatarGradientBorderClass = 'p-[3px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500'; 
    
    // NEW: Updated gradient for the Edit Profile button (vibrant pink)
    const editProfileButtonGradient = 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold';
    
    // Gradient for primary buttons (Follow, Message) - kept for consistency if used elsewhere
    const primaryButtonGradient = 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold';


    const handleTabChange = (tab) =>{
        setActiveTab(tab);
    }

    const followUnfollowHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/user/followorunfollow/${userProfile?._id}`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                toast.success(res.data.message);
                
                // Update user following list
                const updatedFollowing = isFollowing 
                    ? user.following.filter(id => id !== userProfile._id)
                    : [...(user.following || []), userProfile._id];
                
                // Update user profile followers count
                const updatedFollowers = isFollowing 
                    ? userProfile.followers.filter(id => id !== user.id)
                    : [...(userProfile.followers || []), user.id];
                
                // Update Redux store
                dispatch(setAuthUser({ ...user, following: updatedFollowing }));
                dispatch(setUserProfile({ ...userProfile, followers: updatedFollowers }));
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        }
    };

    const displayedPost = activeTab == 'posts' ? userProfile?.posts : userProfile?.bookmarks;

    const username = userProfile?.username || ''
    const profilePicture = userProfile?.profilePicture || null

    return (
        <div className='flex max-w-5xl justify-center mx-auto pl-10'>
            <div className='flex flex-col gap-20 p-8 w-full'>
                <div className='grid grid-cols-1 md:grid-cols-2'>
                    <section className='flex items-center justify-center md:justify-end pr-10'>
                        {/* 1. Profile Picture with Gradient Border */}
                        <div className={avatarGradientBorderClass}>
                            <Avatar className='h-32 w-32 border-4 border-white'>
                                {profilePicture ? (
                                    <AvatarImage src={profilePicture} alt={`${username}'s avatar`} />
                                ) : (
                                    <AvatarFallback>{getInitials(username) || 'U'}</AvatarFallback>
                                )}
                            </Avatar>
                        </div>
                    </section>
                    
                    <section className='pt-8 md:pt-0'>
                        <div className='flex flex-col gap-5'>
                            
                            {/* Username and Action Buttons */}
                            <div className='flex items-center gap-2 flex-wrap'>
                                <span className='text-2xl font-light'>{userProfile?.username}</span>
                                {
                                    isLoggedInUserProfile ? (
                                        <>
                                            {/* UPDATED: Edit Profile Button with new Pink Gradient */}
                                            <Link to="/account/edit">
                                                <Button className={`h-8 cursor-pointer ${editProfileButtonGradient}`}>Edit profile</Button>
                                            </Link>
                                            
                                            {/* REMOVED: View archive and Ad tools */}
                                        </>
                                    ):( 
                                        isFollowing ? (
                                            <>
                                                {/* Unfollow button */}
                                                <Button 
                                                    onClick={followUnfollowHandler}
                                                    className={`h-8 bg-gray-200 hover:bg-gray-300 text-black`}
                                                >
                                                    Unfollow
                                                </Button>
                                                {/* Message (Primary Style) */}
                                                <Button className={`h-8 ${primaryButtonGradient}`}>Message</Button>
                                            </> 
                                        ):( 
                                            // Follow (Primary Style)
                                            <Button 
                                                onClick={followUnfollowHandler}
                                                className={`h-8 ${primaryButtonGradient}`}
                                            >
                                                Follow
                                            </Button>
                                        )
                                    )
                                }
                            </div>
                            
                            {/* Stats: Posts, Followers, Following */}
                            <div className='flex items-center gap-4 text-lg'>
                                <p> <span className='font-bold'>{userProfile?.posts.length}</span> posts</p>
                                <p> <span className='font-bold'>{userProfile?.followers.length}</span> followers</p>
                                <p> <span className='font-bold'>{userProfile?.following.length}</span> followings</p>
                            </div>

                            {/* Bio and Info */}
                            <div className='flex flex-col gap-1'>
                                <span className='font-bold'>{userProfile?.bio  || 'bio here...'}</span>
                                <Badge className='w-fit' variant='secondary'><AtSign/> <span className='pl-1'>{userProfile?.username}</span></Badge>
                                <span>Never let yourself down</span>
                                <span>Just take a step back </span>
                                <span>And hit them hard</span>
                            </div>
                        </div>
                    </section>
                </div>
                
                {/* Posts/Saved/Reels Tabs */}
                <div className='border-t border-t-gray-200'>
                    <div className='flex items-center justify-center gap-10 text-sm'>
                        {/* Tab logic remains the same */}
                        <span className={`py-3 cursor-pointer ${activeTab=='posts'?'font-bold border-t border-black':''}`} onClick={()=>handleTabChange('posts')}>
                            POSTS
                        </span>
                        <span className={`py-3 cursor-pointer ${activeTab=='saved'?'font-bold border-t border-black':''}`} onClick={()=>handleTabChange('saved')}>
                            SAVED
                        </span>
                        {/* <span className='py-3 cursor-pointer'>
                            REELS */}
                        {/* </span>
                        <span className='py-3 cursor-pointer'>
                            TAGS
                        </span> */}
                    </div>
                    
                    {/* Posts Grid */}
                    <div className='grid grid-cols-3 gap-1'>
                        {
                            displayedPost?.map((post)=>{
                                return(
                                    <div key={post?._id} className='relative group cursor-pointer'>
                                        {post.mediaType === 'video' ? (
                                            <video 
                                                src={post.video} 
                                                alt='postvideo' 
                                                className='rounded-sm my-2 w-full aspect-square object-cover'
                                                controls
                                            />
                                        ) : (
                                            <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover'/>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-black/20 hover:bg-black/30 text-white text-sm leading-none focus:outline-none appearance-none"
                                                    aria-label="likes"
                                                >
                                                    <Heart className="w-5 h-5" />
                                                    <span className="leading-none">{post?.likes.length}</span>
                                                </button>

                                                <button
                                                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-black/20 hover:bg-black/30 text-white text-sm leading-none focus:outline-none appearance-none"
                                                    aria-label="comments"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="leading-none">{post?.comments.length}</span>
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div> 
                </div>
            </div>
        </div>
    )
}

export default Profile