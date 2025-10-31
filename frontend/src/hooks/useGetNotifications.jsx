import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNotifications } from '@/redux/chatSlice'
import axios from 'axios'

const useGetNotifications = () => {
    const dispatch = useDispatch()
    const { notifications } = useSelector(store => store.chat)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('https://socialsphere-3i0t.onrender.com/api/v1/message/notifications', {
                    withCredentials: true
                })
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications))
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchNotifications()
    }, [dispatch])

    return { notifications }
}

export default useGetNotifications
