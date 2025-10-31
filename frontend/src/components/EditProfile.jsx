import { useDispatch, useSelector } from 'react-redux';
import React, { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectItem, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const getInitials = (name = '') => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const EditProfile = () => {
  const imageRef = useRef();
  const {user} = useSelector(store=>store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto:user?.profilePicture,
    bio:user?.bio,
    gender:user?.gender
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e)=>{
    const file = e.target.files?.[0];
    if(file) setInput({...input,profilePhoto:file});
  }

  const selectChangeHandler = (value)=>{
    setInput({...input,gender:value});
  }




const editProfileHandler = async () => {
  console.log(">>> editProfileHandler called");
  console.log("Submitting input:", input);

  const formData = new FormData();
  formData.append("bio", input.bio ?? "");
  formData.append("gender", input.gender ?? "");

  // append only when a File object is selected (not a URL string)
  if (input.profilePhoto instanceof File) {
    formData.append("profilePhoto", input.profilePhoto);
  }

  try {
    setLoading(true);

    // IMPORTANT: DO NOT set Content-Type manually. Let the browser add the boundary.
    const res = await axios.post(
      "https://socialsphere-3i0t.onrender.com/api/v1/user/profile/edit",
      formData,
      {
        withCredentials: true
      }
    );

    console.log("server response:", res?.data);

    if (res.data?.success) {
      const updatedUserData = {
        ...user,
        bio: res.data.user?.bio ?? user?.bio,
        profilePicture: res.data.user?.profilePicture ?? user?.profilePicture,
        gender: res.data.user?.gender ?? user?.gender
      };
      dispatch(setAuthUser(updatedUserData));
      navigate(`/profile/${updatedUserData._id ?? updatedUserData.id ?? user?._id ?? user?.id}`);
      toast.success(res.data?.message ?? "Profile updated");
    } else {
      toast.error(res.data?.message ?? "Update failed");
    }
  } catch (err) {
    console.error("Edit profile error:", err);
    const serverMessage =
      typeof err?.response?.data === "string"
        ? err.response.data
        : err?.response?.data?.message ?? err?.message;
    toast.error(String(serverMessage));
  } finally {
    setLoading(false);
  }
};



  return (
    <div className='flex max-w-2xl mx-auto pl-10'>
        <section className='flex flex-col gap-6 w-full my-8' >
            <h1 className='font-bold text-xl'>Edit Profile</h1>
            <div className='flex items-center justify-between bg-gray-100 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                    <Avatar>
                        {user?.profilePicture ? (
                            <AvatarImage src={user?.profilePicture} alt={`${user?.username}'s avatar`} />
                        ) : (
                            <AvatarFallback>{getInitials(user?.username ?? '')}</AvatarFallback>
                        )}
                    </Avatar>
         
        
                    <div>
                        <h1 className='font-bold text-sm'>{user?.username}</h1>
                        <span className='text-gray-600'>{user?.bio || 'Bio here...'}</span>
                    </div>
                </div>
                <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' />
                <Button onClick={()=>imageRef?.current.click()} className='bg-[#0095F6] h-8 hover:bg-[#318bc7]'>Change Photo</Button>
            </div>
            <div>
                <h1 className='font-semibold text-xl mb-2'>Bio</h1>
                <Textarea value={input.bio} onChange={(e)=> setInput({...input,bio:e.target.value})} name='bio' className='focus-visible:ring-transparent' />
            </div>
            <div>
                <h1 className='font-semibold mb-2'>Gender</h1>
                <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className='w-full'>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                </Select>
            </div>
            <div className='flex justify-end'>{

                    loading?(
                        <Button className='w-fit bg-[#0095F6] hover:bg-[#2a8ccd]'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            Please wait
                        </Button>
                    ):(
                        <Button onClick={editProfileHandler} className='w-fit bg-[#0095F6] hover:bg-[#2a8ccd]'>Submit</Button>
                    )
                }
            </div>
        </section>
    </div>
  )
}

export default EditProfile



































