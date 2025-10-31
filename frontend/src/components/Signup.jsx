import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // keep your working path
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2} from "lucide-react";
import { useSelector } from "react-redux";


const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading,setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try{
setLoading(true);
        const res = await axios.post('https://socialsphere-3i0t.onrender.com/api/v1/user/register',input,{
            headers:{
                'Content-Type':'application/json'
            },
            withCredentials:true
        });
        if(res.data.success){
            navigate("/login");
            toast.success(res.data.message);
            setInput({
                username:"",
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
    <div className="flex items-center justify-center w-screen h-screen">
      <form onSubmit={signupHandler} className="w-full max-w-sm shadow-lg rounded-xl border p-8 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">LOGO</h1>
          <p className="text-sm text-muted-foreground">
            Signup to see photos and videos from your friends
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="font-medium">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={input.email}          
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button className="w-full bg-black text-white hover:bg-black/90">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
            Signup
          </Button>
        )}

        <span className="text-center">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></span>
      </form>
    </div>
  );
};

export default Signup;
