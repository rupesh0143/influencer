import express from 'express';
import { createPost, deletePost, getPost, likeDislikePost, timeline, updatePost } from '../Controllers/PostController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

// Routes for post operations
router.post('/', authMiddleWare, createPost); // Create a post
router.get('/:id', getPost); // Get a post
router.put('/:id', authMiddleWare, updatePost); // Update a post
router.delete('/:id', authMiddleWare, deletePost); // Delete a post
router.put('/:id/like', authMiddleWare, likeDislikePost); // Like or dislike a post
router.get('/timeline/:id', authMiddleWare, timeline); // Get timeline posts

export default router;