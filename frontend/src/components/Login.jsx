

// login.jsx

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // keep your working path
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";


const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });

    const [loading,setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Define the gradient classes based on your app's theme
    const mainBackgroundGradient = 'bg-gradient-to-br from-[#00CED1] via-[#87CEEB] to-[#FFB6C1]';
    // Subtle, lighter gradient for the modal box
    const boxBackgroundGradient = 'bg-gradient-to-br from-[#e0f7fa] to-[#ffe0f5]'; 
    // Primary button color to match your Follow/Message buttons
    const primaryButtonColor = 'bg-blue-600 hover:bg-blue-700';


    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        try{
            setLoading(true);
            const res = await axios.post('https://socialsphere-3i0t.onrender.com/api/v1/user/login',input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email:"",
                    password:""
                });
            }
        }catch(error){
            console.log(error);
            toast.error(error.response.data.message);
        }finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])


    return (
        // 1. Apply the main gradient to the entire page background
        <div className={`flex items-center justify-center w-screen h-screen ${mainBackgroundGradient}`}>
            
            {/* 2. Apply the subtle gradient to the form container/box */}
            <form onSubmit={signupHandler} className={`w-full max-w-sm shadow-2xl rounded-xl border border-gray-300 p-8 space-y-5 ${boxBackgroundGradient}`}>
                
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold">LOGO</h1>
                    <p className="text-sm text-gray-700">
                        Login to see photos and videos from your friends
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-gray-800">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={input.email} 
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white/70 border-gray-400" // Subtle input styling
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium text-gray-800">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-white/70 border-gray-400" // Subtle input styling
                    />
                </div>
                
                {loading ? (
                    <Button className={`w-full ${primaryButtonColor}`}>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </Button>
                ) : (
                    // 3. Update the Login button color
                    <Button type="submit" className={`w-full ${primaryButtonColor} font-bold`}>
                        Login
                    </Button>
                )}
        
                <span className="text-center block text-gray-700">
                    Don't have an account? 
                    <Link to="/signup" className="text-pink-600 hover:text-pink-800 font-semibold ml-1">Signup</Link>
                </span>
            </form>
        </div>
    );
};

export default Login;