import sql from 'mssql';

// Get user profile
export const getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const db = req.app.get('db');

        // Get user using sp_GetInfluencerDetails
        const user = await db.request()
            .input('InfluencerID', sql.Int, id)
            .input('Username', sql.VarChar, null)
            .input('email', sql.VarChar, null)
            .execute('sp_GetInfluencerDetails');

        if (user.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.recordset[0]);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleWare
        const { username, email } = req.body;
        const db = req.app.get('db');

        // Check if user exists using sp_GetInfluencerDetails
        const user = await db.request()
            .input('InfluencerID', sql.Int, userId)
            .input('Username', sql.VarChar, null)
            .input('email', sql.VarChar, null)
            .execute('sp_GetInfluencerDetails');

        if (user.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user using hypothetical sp_UpdateInfluencer
        await db.request()
            .input('InfluencerID', sql.Int, userId)
            .input('Username', sql.VarChar, username || user.recordset[0].username)
            .input('email', sql.VarChar, email || user.recordset[0].email)
            .execute('sp_UpdateInfluencer');

        // Retrieve updated user
        const updatedUser = await db.request()
            .input('InfluencerID', sql.Int, userId)
            .input('Username', sql.VarChar, null)
            .input('email', sql.VarChar, null)
            .execute('sp_GetInfluencerDetails');

        res.status(200).json({ message: 'User updated successfully!', user: updatedUser.recordset[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Follow a user
export const followUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From authMiddleWare
        const followingId = req.params.id;
        const db = req.app.get('db');

        // Prevent self-follow
        if (followerId === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if following user exists
        const followingUser = await db.request()
            .input('InfluencerID', sql.Int, followingId)
            .input('Username', sql.VarChar, null)
            .input('email', sql.VarChar, null)
            .execute('sp_GetInfluencerDetails');

        if (followingUser.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Follow user using hypothetical sp_FollowInfluencer
        await db.request()
            .input('followerId', sql.Int, followerId)
            .input('followingId', sql.Int, followingId)
            .execute('sp_FollowInfluencer');

        res.status(200).json({ message: `You are now following user ${followingId}` });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From authMiddleWare
        const followingId = req.params.id;
        const db = req.app.get('db');

        // Prevent self-unfollow
        if (followerId === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot unfollow yourself' });
        }

        // Check if following user exists
        const followingUser = await db.request()
            .input('InfluencerID', sql.Int, followingId)
            .input('Username', sql.VarChar, null)
            .input('email', sql.VarChar, null)
            .execute('sp_GetInfluencerDetails');

        if (followingUser.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Unfollow user using hypothetical sp_UnfollowInfluencer
        await db.request()
            .input('followerId', sql.Int, followerId)
            .input('followingId', sql.Int, followingId)
            .execute('sp_UnfollowInfluencer');

        res.status(200).json({ message: `You have unfollowed user ${followingId}` });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get followers
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = req.app.get('db');

        // Get followers using hypothetical sp_GetInfluencerFollowers
        const followers = await db.request()
            .input('userId', sql.Int, userId)
            .execute('sp_GetInfluencerFollowers');

        res.status(200).json(followers.recordset);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get following
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = req.app.get('db');

        // Get following using hypothetical sp_GetInfluencerFollowing
        const following = await db.request()
            .input('userId', sql.Int, userId)
            .execute('sp_GetInfluencerFollowing');

        res.status(200).json(following.recordset);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: error.message });
    }
};