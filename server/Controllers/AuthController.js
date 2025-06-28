import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from 'mssql';


export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const db = req.app.get('db');

        
        const existingUsers = await db.request()
            .input('email', sql.VarChar, email)
            .execute('sp_GetInfluencerDetails');

        if (existingUsers.recordset.length > 0) {
            return res.status(400).json({ message: 'This User already exists!' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password.toString(), salt);

        // Insert new user using a hypothetical sp_InsertInfluencer stored procedure
        const insertResult = await db.request()
            .input('Username', sql.VarChar, username || email) // Use email as username if not provided
            .input('Email', sql.VarChar, email)
            .input('Password', sql.VarChar, hashedPass)
            .output('inserted_id', sql.Int)
            .execute('sp_InsertInfluencer');

        // Retrieve the inserted ID
        const insertId = insertResult.output.inserted_id;

        // Retrieve the newly created user
        const newUser = await db.request()
            .input('email', sql.VarChar, email)
            .execute('sp_GetInfluencerDetails');

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.recordset[0].id, email: newUser.recordset[0].email },
            process.env.JWT_SECRET
        );

        res.status(200).json({ user: newUser.recordset[0], token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = req.app.get('db');

        // Check if user exists using stored procedure
        const users = await db.request()
            .input('email', sql.VarChar, email)
            .execute('sp_GetInfluencerDetails');

        if (users.recordset.length === 0) {
            return res.status(404).json({ message: 'Sorry, please enter the correct email or password!' });
        }

        const user = users.recordset[0];

        // Verify password
        const validity = await bcrypt.compare(password, user.password);
        if (!validity) {
            return res.status(400).json({ message: 'Sorry, please enter the correct email or password!' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET
        );

        // Return user data (excluding password)
        res.status(200).json({
            user: { id: user.id, username: user.username, email: user.email },
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: error.message });
    }
};