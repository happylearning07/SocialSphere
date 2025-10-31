import express from "express";
import {editProfile,followOrUnfollow, getProfile,getSuggestedUsers,login,logout,register,searchUsers} from "../controllers/user.control.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated,getProfile); //next ka kaam hai isAuthenticated se getProfile pe jaana
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePhoto'),editProfile);
router.route('/suggested').get(isAuthenticated,getSuggestedUsers);
router.route('/followorunfollow/:id').get(isAuthenticated,followOrUnfollow); //ye id will be of target user 
router.route('/search').get(isAuthenticated,searchUsers); // Search users route


export default router;
