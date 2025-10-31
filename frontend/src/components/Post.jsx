
// //----------------------after css----------------------
import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { setAuthUser } from '@/redux/authSlice'
import { Badge } from './ui/badge'

const getInitials = (name = '') => {
  const parts = (name || '').trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const Post = ({ post }) => {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const { user } = useSelector((store) => store.auth)
  const { posts } = useSelector((store) => store.post)
  const dispatch = useDispatch()

  // Local UI state derived from post; we will keep these in sync with Redux `posts`
  const [postLike, setPostLike] = useState(post.likes.length)
  const currentUserId = user?.id ?? user?._id
  const [liked, setLiked] = useState(post?.likes?.includes(currentUserId) || false)
  const [comment, setComment] = useState(post?.comments ?? [])
  const [bookmarked, setBookmarked] = useState(false)

  // --- SYNC: whenever the global `posts` slice updates, sync this post's local state ---
  useEffect(() => {
    if (!posts || !Array.isArray(posts)) return
    const updated = posts.find((p) => String(p._id) === String(post._id))
    if (updated) {
      setComment(updated.comments ?? [])
      setPostLike(updated.likes?.length ?? (post.likes?.length ?? 0))
      setLiked(Array.isArray(updated.likes) ? updated.likes.includes(currentUserId) : liked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, post._id, user?.id])

  // Check if post is bookmarked by current user
  useEffect(() => {
    if (user?.bookmarks && Array.isArray(user.bookmarks)) {
      setBookmarked(user.bookmarks.includes(post._id))
    }
  }, [user?.bookmarks, post._id])

  const changeEventHandler = (e) => {
    const inputText = e.target.value
    if (inputText.trim()) {
      setText(inputText)
    } else {
      setText('')
    }
  }

  const likeOrDislikeHandler = async () => {
    // Optimistic UI update
    const prevLiked = liked
    const prevPostLike = postLike
    const prevPosts = posts

    const nextLiked = !prevLiked
    const nextPostLike = prevLiked ? prevPostLike - 1 : prevPostLike + 1

    setLiked(nextLiked)
    setPostLike(nextPostLike)

    const optimisticPosts = posts.map((p) =>
      p._id === post._id
        ? {
            ...p,
            likes: prevLiked
              ? p.likes.filter((id) => String(id) != String(currentUserId))
              : [...p.likes, currentUserId]
          }
        : p
    )
    dispatch(setPosts(optimisticPosts))

    try {
      const action = prevLiked ? 'dislike' : 'like'
      const res = await axios.get(`https://socialsphere-3i0t.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true })
      if (res.data.success) {
        toast.success(res.data.message)
      } else {
        throw new Error('Failed')
      }
    } catch (error) {
      // rollback on failure
      setLiked(prevLiked)
      setPostLike(prevPostLike)
      dispatch(setPosts(prevPosts))
      toast.error('Something went wrong. Please try again.')
    }
  }



  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://socialsphere-3i0t.onrender.com/api/v1/post/${post._id}/comment`,
        { text },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      )

      if (res.data.success) {
        // push the actual comment object to local state
        const updatedCommentData = [...comment, res.data.comment]
        setComment(updatedCommentData)

        // update the post in redux
        const updatedPostData = posts.map((p) => (p._id === post._id ? { ...p, comments: updatedCommentData } : p))
        dispatch(setPosts(updatedPostData))

        // show toast and clear input
        toast.success(res.data.message || 'Comment added')
        setText('')
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Failed to add comment')
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`https://socialsphere-3i0t.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })

      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id != post?._id)
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      const message = error.response?.data?.message || error.message || 'Something went wrong'
      toast.error(message)
    }
  }

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(`https://socialsphere-3i0t.onrender.com/api/v1/post/${post?._id}/bookmark`, { withCredentials: true })
      if (res.data.success) {
        const saved = res.data.type === 'saved'
        setBookmarked(saved)

        const currentBookmarks = Array.isArray(user?.bookmarks) ? user.bookmarks : []
        const updatedBookmarks = saved
          ? [...currentBookmarks, post._id]
          : currentBookmarks.filter(id => id !== post._id)

        dispatch(setAuthUser({ ...user, bookmarks: updatedBookmarks }))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const unfollowHandler = async () => {
    try {
      const res = await axios.get(`https://socialsphere-3i0t.onrender.com/api/v1/user/followorunfollow/${post.author._id}`, {
        withCredentials: true
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        
        // Update user following list
        const updatedFollowing = user.following.filter(id => id !== post.author._id);
        
        // Update Redux store
        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }
  };

  return (
    // Post Card Container
    <div className="
      my-8 w-full max-w-sm mx-auto p-4 rounded-xl shadow-md 
      bg-gradient-to-br from-lime-200/90 to-pink-200/90
      border-2 border-gray-300
      hover:border-pink-400 
      hover:shadow-xl transition-all duration-300 ease-in-out
    ">
      {/* Post Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          
          {/* PROFILE IMAGE WITH THICKER, HARMONIZED HIGHLIGHTED CIRCLE */}
          <div className="
              relative p-1.5 rounded-full 
              bg-gradient-to-br from-teal-400 to-pink-500
              transform transition-all duration-300 ease-in-out
              hover:scale-105 hover:shadow-md
          ">
            <Avatar className="h-10 w-10">
              {post.author?.profilePicture ? (
                <AvatarImage src={post.author.profilePicture} alt={`${post.author?.username}'s avatar`} />
              ) : (
                <AvatarFallback>{getInitials(post.author?.username ?? '')}</AvatarFallback>
              )}
            </Avatar>
          </div>

          <div className='flex items-center gap-3'>
            {/* USERNAME STYLING */}
            <h1 className="
                font-extrabold text-lg tracking-wide 
                text-teal-700 cursor-pointer 
                hover:text-pink-600 transition-colors duration-200 
            ">{post.author?.username}</h1>
            
            {user?.id == post.author._id && <Badge className='bg-black text-white' variant='secondary'>Author</Badge>}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className='cursor-pointer text-gray-700 hover:text-gray-900' />
          </DialogTrigger>

          {/* STYLED DIALOG CONTENT WITH VIRGIN GRADIENT */}
          <DialogContent className='
            flex flex-col items-center text-sm text-center p-4 rounded-2xl 
            shadow-2xl border-none 
            bg-gradient-to-br from-lime-200 to-pink-200 
            w-[300px] sm:max-w-[420px]
          '>
            {post?.author?._id != user?.id && (
              // Styled Unfollow Button
              <Button 
                onClick={unfollowHandler}
                variant='ghost' 
                className='cursor-pointer w-full text-red-500 font-bold hover:bg-red-100/70 bg-transparent'
              >
                Unfollow
              </Button>
            )}

            {/* Styled Add to favorites Button */}
            <Button 
                variant='ghost' 
                className='cursor-pointer w-full text-gray-700 hover:bg-gray-200/70 bg-transparent'
            >
              Add to favorites
            </Button>

            {user && String(user.id) === String(post?.author?._id) && (
              // Styled Delete Button
              <Button 
                onClick={deletePostHandler} 
                variant='ghost' 
                className='cursor-pointer w-full text-gray-700 hover:bg-gray-200/70 bg-transparent'
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Media */}
      {post.mediaType === 'video' ? (
        <video 
          className='rounded-sm my-4 w-full aspect-square object-cover' 
          src={post.video} 
          controls
          alt='post_video' 
        />
      ) : (
        <img className='rounded-sm my-4 w-full aspect-square object-cover' src={post.image} alt='post_img' />
      )}

      {/* Post Actions (LIKE, COMMENT, SEND, BOOKMARK) */}
      <div className='flex items-center justify-between my-2'>
        <div className='flex items-center gap-3'>
          {liked ? (
            <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' />
          ) : (
            // Styled empty heart icon
            <FaRegHeart onClick={likeOrDislikeHandler} className='cursor-pointer text-gray-700 hover:text-red-500 transition-colors duration-200' size={'22px'} />
          )}
          
          {/* Styled Comment Icon */}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post))
              setOpen(true)
            }}
            className='cursor-pointer text-gray-700 hover:text-teal-500 transition-colors duration-200' 
          />
          
          {/* Styled Send Icon */}
          <Send className='cursor-pointer text-gray-700 hover:text-teal-500 transition-colors duration-200' /> 
        </div>
        
        {/* Styled Bookmark Icon */}
        {bookmarked ? (
          <Bookmark onClick={bookmarkHandler} className='cursor-pointer text-black fill-black hover:text-gray-600 transition-colors duration-200' />
        ) : (
          <Bookmark onClick={bookmarkHandler} className='cursor-pointer text-gray-700 hover:text-pink-600 transition-colors duration-200' />
        )} 
      </div>

      {/* Likes and Caption */}
      <span className='font-medium block mb-2 text-gray-800'>{postLike} likes</span>
      
      {/* CRITICAL FIX: Removed the gray color from p tag to ensure child span colors work */}
      <p>
        {/* Username styling */}
        <span className='font-semibold mr-2 text-teal-700 hover:text-pink-600 cursor-pointer'>
          {post.author?.username}
        </span>
        
        {/* CRITICAL FIX: Caption text with guaranteed Dark Teal color and increased weight */}
        <span className='text-red-500 font-medium'>
          {post.caption}
        </span>
      </p>

      {/* View Comments Link */}
      {comment.length > 0 && (
        // CRITICAL FIX: Applied strong color to the comment link
        <span
          onClick={() => {
            dispatch(setSelectedPost(post))
            setOpen(true)
          }}
          className='cursor-pointer text-sm text-teal-700 hover:text-pink-600 font-medium'
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      {/* Comment Input */}
      <div className='flex items-center justify-between pt-4 border-t border-gray-300 mt-4'>
        <input 
          type='text' 
          placeholder='Add a comment...' 
          value={text} 
          onChange={changeEventHandler} 
          className='outline-none text-sm w-full bg-transparent text-gray-700 placeholder-gray-500' 
        />
        {text && (
          // Post text button styled for prominence
          <span onClick={commentHandler} className='text-teal-500 cursor-pointer font-semibold hover:text-teal-700'>
            Post
          </span>
        )}
      </div>
    </div>
  )
}

export default Post