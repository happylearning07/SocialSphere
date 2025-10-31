import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";
// import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption, mediaType } = req.body;
        const file = req.file;
        const authorId = req.id;

        if (!file) return res.status(400).json({ message: 'File required' });
        if (!mediaType || !['image', 'video'].includes(mediaType)) {
            return res.status(400).json({ message: 'Invalid media type' });
        }

        let cloudResponse;
        
        if (mediaType === 'image') {
            // image upload 
            const optimizedImageBuffer = await sharp(file.buffer)
                .resize({ width: 800, height: 800, fit: 'inside' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();

            // buffer to data uri
            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        } else if (mediaType === 'video') {
            // video upload with increased limits
            const fileUri = `data:video/mp4;base64,${file.buffer.toString('base64')}`;
            cloudResponse = await cloudinary.uploader.upload(fileUri, {
                resource_type: "video",
                chunk_size: 6000000,
                timeout: 120000, // 2 minutes timeout
                upload_preset: "ml_default", // Use upload preset if available
            });
        }

        const postData = {
            caption,
            mediaType,
            author: authorId
        };

        if (mediaType === 'image') {
            postData.image = cloudResponse.secure_url;
        } else {
            postData.video = cloudResponse.secure_url;
        }

        const post = await Post.create(postData);
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // Create persistent notification for LIKE and emit realtime
        const liker = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            try {
                await Notification.create({
                    userId: postOwnerId,
                    senderId: likeKrneWalaUserKiId,
                    type: 'like',
                    message: `${liker.username} liked your post`,
                    relatedPostId: post._id,
                });
            } catch (e) { /* ignore */ }

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('newNotification', {
                    type: 'like',
                    message: `${liker.username} liked your post`,
                    sender: liker,
                });
            }
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {

    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // No persistent notification on dislike; optionally could mark previous like as read



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}

// at top of file keep your existing imports
// import { getReceiverSocketId, io } from "../socket/socket.js";

// export const likePost = async (req, res) => {
//   try {
//     const likeUserId = req.id;
//     const postId = req.params.id;

//     // update and return new document in one step
//     const updatedPost = await Post.findByIdAndUpdate(
//       postId,
//       { $addToSet: { likes: likeUserId } },
//       { new: true }
//     )
//       .populate({ path: 'author', select: '-password username profilePicture' })
//       .populate({
//         path: 'comments',
//         options: { sort: { createdAt: -1 } },
//         populate: { path: 'author', select: 'username profilePicture' }
//       });

//     if (!updatedPost) {
//       return res.status(404).json({ message: 'Post not found', success: false });
//     }

//     // send real-time notification to post owner (optional)
//     const user = await User.findById(likeUserId).select('username profilePicture');
//     const postOwnerId = updatedPost.author._id.toString();
//     if (postOwnerId !== likeUserId) {
//       const notification = {
//         type: 'like',
//         userId: likeUserId,
//         userDetails: user,
//         postId,
//         message: 'Your post was liked'
//       };
//       const postOwnerSocketId = getReceiverSocketId(postOwnerId);
//       if (postOwnerSocketId) {
//         io.to(postOwnerSocketId).emit('notification', notification);
//       }
//     }

//     // IMPORTANT: broadcast the updated post to all connected clients (or a room)
//     // choose event name like 'post:updated'
//     io.emit('post:updated', updatedPost);

//     return res.status(200).json({ message: 'Post liked', success: true, post: updatedPost });
//   } catch (error) {
//     console.error('likePost error:', error);
//     return res.status(500).json({ message: 'Server error', success: false });
//   }
// };

// export const dislikePost = async (req, res) => {
//   try {
//     const likeUserId = req.id;
//     const postId = req.params.id;

//     const updatedPost = await Post.findByIdAndUpdate(
//       postId,
//       { $pull: { likes: likeUserId } },
//       { new: true }
//     )
//       .populate({ path: 'author', select: '-password username profilePicture' })
//       .populate({
//         path: 'comments',
//         options: { sort: { createdAt: -1 } },
//         populate: { path: 'author', select: 'username profilePicture' }
//       });

//     if (!updatedPost) {
//       return res.status(404).json({ message: 'Post not found', success: false });
//     }

//     const user = await User.findById(likeUserId).select('username profilePicture');
//     const postOwnerId = updatedPost.author._id.toString();
//     if (postOwnerId !== likeUserId) {
//       const notification = {
//         type: 'dislike',
//         userId: likeUserId,
//         userDetails: user,
//         postId,
//         message: 'Your post was disliked'
//       };
//       const postOwnerSocketId = getReceiverSocketId(postOwnerId);
//       if (postOwnerSocketId) {
//         io.to(postOwnerSocketId).emit('notification', notification);
//       }
//     }

//     // broadcast updated post
//     io.emit('post:updated', updatedPost);

//     return res.status(200).json({ message: 'Post disliked', success: true, post: updatedPost });
//   } catch (error) {
//     console.error('dislikePost error:', error);
//     return res.status(500).json({ message: 'Server error', success: false });
//   }
// };


export const addComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const { text } = req.body;

        if(!text) return res.status(400).json({message:'Text is required', success:false});

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        });

        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        // Link comment to post without triggering validation on legacy posts
        await Post.updateOne(
            { _id: postId },
            { $push: { comments: comment._id } },
            { runValidators: false }
        );

        // Log the comment in backend
        console.log("New Comment Added:", comment);

        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: true
        });

    } catch (error) {
        console.log("Error adding comment:", error);
        res.status(500).json({message:'Internal server error', success:false});
    }
};



export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}