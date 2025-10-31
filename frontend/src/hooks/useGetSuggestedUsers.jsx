import { setSuggestedUsers } from "@/redux/authSlice";
import axios from "axios";
import React, {useEffect} from "react";
import { useDispatch } from "react-redux";

const useGetSuggestedUsers = () => {
    const dispatch  = useDispatch();
    useEffect(()=>{
        const fetchSuggetsedUsers = async() =>{
            try{
                const res = await axios.get('https://socialsphere-3i0t.onrender.com/api/v1/user/suggested',{withCredentials:true});
                if(res.data.success){
                    dispatch(setSuggestedUsers(res.data.users));
                }
            }catch(error){
                console.log(error);
            }
        }
        fetchSuggetsedUsers();
    },[]);
};

export default useGetSuggestedUsers;























