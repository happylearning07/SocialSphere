import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"
import {Notification} from "../models/notification.model.js"
import {User} from "../models/user.model.js"

// for chatting
export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {textMessage:message} = req.body;
      
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        });
        // establish the conversation if not started yet.
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        if(newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(),newMessage.save()])

        // Create notification for the receiver
        const sender = await User.findById(senderId).select('username profilePicture');
        await Notification.create({
            userId: receiverId,
            senderId: senderId,
            type: 'message',
            message: `${sender.username} sent you a message`,
            relatedMessageId: newMessage._id
        });

        // implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage);
            // Send notification to receiver
            io.to(receiverSocketId).emit('newNotification', {
                type: 'message',
                message: `${sender.username} sent you a message`,
                sender: sender
            });
        }

        return res.status(201).json({
            success:true,
            newMessage
        })
    } catch (error) {
        console.log(error);
    }
}
export const getMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, receiverId]}
        }).populate('messages');
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        return res.status(200).json({success:true, messages:conversation?.messages});
        
    } catch (error) {
        console.log(error);
    }
}

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ userId })
            .populate('senderId', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found", success: false });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.id;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}