import express from 'express';
import { getUser, updateUser, followUser, unfollowUser, getFollowers, getFollowing } from '../Controllers/UserController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

// Routes for user operations
router.get('/:id', getUser); // Public route to get user profile
router.put('/', authMiddleWare, updateUser); // Authenticated route to update user
router.post('/:id/follow', authMiddleWare, followUser); // Authenticated route to follow a user
router.post('/:id/unfollow', authMiddleWare, unfollowUser); // Authenticated route to unfollow a user
router.get('/:id/followers', getFollowers); // Public route to get followers
router.get('/:id/following', getFollowing); // Public route to get following

export default router;