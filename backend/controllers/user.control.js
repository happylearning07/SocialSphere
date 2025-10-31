import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import { Post } from "../models/post.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";



export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "Try different email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    // ❌ was useTransition → ✅ use User model
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password!",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    };

    // jwt.sign is synchronous → no await
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    //populate each post ifin the post array
    
    // prepare safe object
    //populate each post in the post array

    const populatedPosts = await Promise.all(
      user.posts.map(async (postId)=>{
        const post = await Post.findById(postId);
        if(post.author.equals(user._id)){
          return post;
        }
        return null;
      })
    )
    // const safeUser = {
    //   id: user._id,
    //   username: user.username,
    //   email: user.email,
    //   profilePicture: user.profilePicture,
    //   bio: user.bio,
    //   followers: user.followers,
    //   following: user.following, // ✅ fixed typo
    //   posts: populatedPosts,
    // };




    // -----------------------------
    // inside login controller, replace safeUser creation with:
    const safeUser = {
      _id: user._id,            // add canonical mongo id
      id: String(user._id),     // keep convenience id (string)
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };


    

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: safeUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = async (_, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 8 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // let user = await User.findById(userId).select("-password");
    let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// export const editProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { bio, gender } = req.body;
//     const profilePicture = req.file;

//     let cloudResponse;
//     if (profilePicture) {
//       const fileUri = getDataUri(profilePicture);
//       cloudResponse = await cloudinary.uploader.upload(fileUri);
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     if (bio) user.bio = bio;
//     if (gender) user.gender = gender;
//     if (profilePicture) user.profilePicture = cloudResponse.secure_url;

//     await user.save();

//     return res.status(200).json({
//       message: "Profile Updated",
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Server error", success: false });
//   }
// };


export const editProfile = async (req, res) => {
  try {
    const userId = req.user.id; // now works
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile Updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Re-introduced: follow or unfollow a user
export const followOrUnfollow = async (req, res) => {
  try {
    const followKarnewala = req.id;
    const jiskoFollowKrungi = req.params.id;

    if (followKarnewala === jiskoFollowKrungi) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKarnewala);
    const targetUser = await User.findById(jiskoFollowKrungi);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = user.following.includes(jiskoFollowKrungi);
    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followKarnewala },
          { $pull: { following: jiskoFollowKrungi } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrungi },
          { $pull: { followers: followKarnewala } }
        ),
      ]);

      return res
        .status(200)
        .json({ message: "Unfollow successfully", success: true });
    } else {
      await Promise.all([
        User.updateOne(
          { _id: followKarnewala },
          { $push: { following: jiskoFollowKrungi } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrungi },
          { $push: { followers: followKarnewala } }
        ),
      ]);

      return res
        .status(200)
        .json({ message: "followed successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        message: "Search query is required",
        success: false,
      });
    }

    // Search users by username (case insensitive)
    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      username: { $regex: query, $options: 'i' }
    }).select('-password').limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
