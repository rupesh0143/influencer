import { query } from 'express';

// Create new post
export const createPost = async (req, res) => {
    try {
        const { description, image } = req.body;
        const userId = req.user.id; // From authMiddleWare
        const db = req.app.get('db');

        // Create post using stored procedure
        const [result] = await db.query('CALL CreatePost(?, ?, ?, @inserted_id); SELECT @inserted_id AS insertId', [
            userId,
            description || null,
            image || null,
        ]);

        // Retrieve the newly created post
        const insertId = result[1][0].insertId;
        const [newPost] = await db.query('CALL GetPostById(?)', [insertId]);

        res.status(200).json(newPost[0][0]);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a post
export const getPost = async (req, res) => {
    try {
        const id = req.params.id;
        const db = req.app.get('db');

        // Get post using stored procedure
        const [post] = await db.query('CALL GetPostById(?)', [id]);
        if (post[0].length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post[0][0]);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { description, image } = req.body;
        const userId = req.user.id; // From authMiddleWare
        const db = req.app.get('db');

        // Get post to check ownership
        const [post] = await db.query('CALL GetPostById(?)', [postId]);
        if (post[0].length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post[0][0].userId !== userId) {
            return res.status(403).json({ message: 'Action forbidden' });
        }

        // Update post using stored procedure
        await db.query('CALL UpdatePost(?, ?, ?)', [postId, description || null, image || null]);

        res.status(200).json({ message: 'Post updated successfully!' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id; // From authMiddleWare
        const db = req.app.get('db');

        // Get post to check ownership
        const [post] = await db.query('CALL GetPostById(?)', [id]);
        if (post[0].length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post[0][0].userId !== userId) {
            return res.status(403).json({ message: 'Action forbidden' });
        }

        // Delete post using stored procedure
        await db.query('CALL DeletePost(?)', [id]);

        res.status(200).json({ message: 'Post deleted successfully!' });
    } catch (error){
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Like/Dislike a post
export const likeDislikePost = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id; // From authMiddleWare
        const db = req.app.get('db');

        // Get post to check if already liked
        const [post] = await db.query('CALL GetPostById(?)', [id]);
        if (post[0].length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user has already liked the post
        const likes = post[0][0].likes ? JSON.parse(post[0][0].likes) : [];
        const action = likes.includes(userId) ? 'dislike' : 'like';

        // Update likes using stored procedure
        await db.query('CALL LikeDislikePost(?, ?, ?)', [id, userId, action]);

        res.status(200).json({ message: `Post ${action}d.` });
    } catch (error) {
        console.error('Error liking/disliking post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get timeline posts
export const timeline = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleWare
        const db = req.app.get('db');

        // Get timeline posts using stored procedure
        const [posts] = await db.query('CALL GetTimelinePosts(?)', [userId]);

        res.status(200).json(posts[0]);
    } catch (error) {
        console.error('Error getting timeline posts:', error);
        res.status(500).json({ message: error.message });
    }
};