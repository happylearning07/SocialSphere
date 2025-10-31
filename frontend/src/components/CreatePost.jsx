// import React from 'react'
// import {Dialog, DialogContent, DialogHeader} from './ui/dialog'
// import {Avatar, AvatarFallback,AvatarImage} from './ui/avatar';
// import { Textarea } from './ui/textarea';
// import { Button } from './ui/button';
// import { readFileAsDataURL } from '@/lib/utils';
// import { useRef, useState } from 'react';
// import { toast } from 'sonner';
// import { Loader2 } from 'lucide-react';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPosts } from '@/redux/postSlice';




// const CreatePost =({open,setOpen}) =>{
//   const imageRef = useRef();
//   const [file,setFile] = useState("");
//   const [caption,setCaption] = useState("");
//   const [imagePreview,setImagePreview] = useState("");
//   const [loading,setLoading] = useState(false);
//   const {user} = useSelector(store=>store.auth);
//   const {posts} = useSelector(store=>store.post);
//   const dispatch = useDispatch();

//   const fileChangeHandler = async (e)=>{
//     const file = e.target.files?.[0];
//     if(file){
//       setFile(file);
//       const dataUrl = await readFileAsDataURL(file);
//       setImagePreview(dataUrl);
//     }
//   }

//   const createPostHandler = async(e)=>{
//     const formData = new FormData();
//     formData.append("caption",caption);
//     if(imagePreview) formData.append("image",file);
//     try{
//       setLoading(true);
//       const res = await axios.post('http://localhost:8000/api/v1/post/addpost',formData,{
//         headers:{
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials:true
//       });
//       if(res.data.success){
//         dispatch(setPosts([res.data.post, ...posts]))
//         toast.success(res.data.message);
//         setOpen(false);
//       }
//     }catch(error){
//       toast.error(error.response.data.message);
//     }finally{
//       setLoading(false);
//     }
//   }
//   return(
//     <Dialog open={open}>
//       <DialogContent onInteractOutside = {()=>setOpen(false)}>
//         <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>
//         <div className='flex gap3 items-center'>
//           <Avatar>
//             <AvatarImage src={user?.profilePicture} alt="img" />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className='font-semibold text-xs'>{user?.username}</h1>
//             <span className='text-gray-600 text-xs'>Bio here...</span>
//           </div>
//         </div>
//         <Textarea value={caption} onChange={(e)=> setCaption(e.target.value) }className="focus-visible:ring-transparent border-none" placeholder="Write a caption..."/>
//         {
//           imagePreview && (
//             <div className='w-full h-64 flex items-center justify-center'>
//               <img src={imagePreview} alt="preview_img" className="object-cover h-full w-full rounded-md"/>
//             </div>
//           )
//         }
//         <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler}/>
//         <Button onClick={()=>imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select from Computer</Button>
//         {
//           imagePreview && (
//             loading ? (
//               <Button>
//                 <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
//                 Please Wait
//               </Button>
//             ):(
//             <Button onClick={createPostHandler} type ="submit" className="w-full bg-black text-white hover:bg-gray-800">Post</Button>
//             )
//           )
//         }
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default CreatePost




//css-----------------------------------------
// CreatePost.jsx

import React from 'react'
import {Dialog, DialogContent, DialogHeader} from './ui/dialog'
import {Avatar, AvatarFallback,AvatarImage} from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';


const CreatePost =({open,setOpen}) =>{
    const fileRef = useRef();
    const [file,setFile] = useState("");
    const [caption,setCaption] = useState("");
    const [mediaPreview,setMediaPreview] = useState("");
    const [mediaType,setMediaType] = useState("image");
    const [loading,setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const {posts} = useSelector(store=>store.post);
    const dispatch = useDispatch();

    // Define the consistent gradient styles
    const avatarGradientBorderClass = 'p-[2px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500'; 
    
    // NEW: Define a subtle gradient for the Dialog background, matching your app's style
    const dialogBackgroundClass = 'bg-gradient-to-br from-[#c8e6e8] via-[#e2f4f7] to-[#fce4ec]'; 

    const fileChangeHandler = async (e)=>{
        const selectedFile = e.target.files?.[0];
        if(selectedFile){
            setFile(selectedFile);
            
            // Determine media type based on file type
            if(selectedFile.type.startsWith('video/')){
                setMediaType('video');
                const dataUrl = await readFileAsDataURL(selectedFile);
                setMediaPreview(dataUrl);
            } else if(selectedFile.type.startsWith('image/')){
                setMediaType('image');
                const dataUrl = await readFileAsDataURL(selectedFile);
                setMediaPreview(dataUrl);
            } else {
                alert('Please select an image or video file');
                return;
            }
        }
    }

    const createPostHandler = async(e)=>{
        const formData = new FormData();
        formData.append("caption",caption);
        formData.append("mediaType",mediaType);
        if(mediaPreview) formData.append("image",file);
        try{
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/post/addpost',formData,{
                headers:{
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                dispatch(setPosts([res.data.post, ...posts]))
                toast.success(res.data.message);
                setOpen(false);
                // Reset form
                setCaption("");
                setMediaPreview("");
                setFile("");
                setMediaType("image");
            }
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            setLoading(false);
        }
    }
    return(
        <Dialog open={open}>
            {/* CORRECTED: Applied gradient background and kept minimal changes to DialogContent */}
            <DialogContent 
                onInteractOutside = {()=>setOpen(false)}
                className={`${dialogBackgroundClass} shadow-xl`} // Added gradient and shadow
            >
                {/* Header uses Tailwind's default dialog padding */}
                <DialogHeader className='text-center font-semibold border-b pb-3'>Create New Post</DialogHeader>
                
                {/* Profile Info Section */}
                <div className='flex gap-3 items-center'>
                    
                    {/* NEW: Gradient Border around the Avatar */}
                    <div className={`${avatarGradientBorderClass}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profilePicture} alt="img" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </div>
                    
                    {/* User Text */}
                    <div>
                        <h1 className='font-semibold text-sm'>{user?.username}</h1>
                        <span className='text-gray-600 text-xs italic'>Bio here...</span>
                    </div>
                </div>
                
                {/* Textarea: Kept original classes */}
                <Textarea 
                    value={caption} 
                    onChange={(e)=> setCaption(e.target.value) }
                    className="focus-visible:ring-transparent border-none bg-transparent" 
                    placeholder="Write a caption..."
                />
                
                {/* Media Preview Section */}
                {
                    mediaPreview && (
                        <div className='w-full h-64 flex items-center justify-center border rounded-md overflow-hidden'>
                            {mediaType === 'image' ? (
                                <img src={mediaPreview} alt="preview_img" className="object-cover h-full w-full"/>
                            ) : (
                                <video src={mediaPreview} controls className="h-full w-full object-cover"/>
                            )}
                        </div>
                    )
                }
                
                <input ref={fileRef} type='file' accept="image/*,video/*" className='hidden' onChange={fileChangeHandler}/>
                
                {/* Select from Computer Button */}
                <Button 
                    onClick={()=>fileRef.current.click()} 
                    className='w-fit mx-auto bg-blue-600 hover:bg-blue-700 text-white' // Updated button color for visibility
                >
                    Select Image or Video
                </Button>
                
                {/* Post Button Section */}
                {
                    mediaPreview && (
                        loading ? (
                            <Button disabled className="w-full bg-gray-400">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                Please Wait
                            </Button>
                        ):(
                        <Button 
                            onClick={createPostHandler} 
                            type ="submit" 
                            className="w-full bg-green-600 text-white hover:bg-green-700 font-bold" // Updated button color for visibility
                        >
                            Post
                        </Button>
                        )
                    )
                }
            </DialogContent>
        </Dialog>
    )
}

export default CreatePost