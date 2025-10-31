import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/message.control.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticated,sendMessage);
router.route('/all/:id').get(isAuthenticated,getMessage);
router.route('/notifications').get(isAuthenticated, getNotifications);
router.route('/notifications/:notificationId/read').patch(isAuthenticated, markNotificationAsRead);
router.route('/notifications/read-all').patch(isAuthenticated, markAllNotificationsAsRead);

export default router;