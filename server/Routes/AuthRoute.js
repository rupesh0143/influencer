// import express from 'express';
// import { loginUser, registerUser } from '../Controllers/AuthController.js';

// const router = express.Router();


// router.post('/register', registerUser);
// router.post('/login', loginUser);

// export default router;


import express from 'express';
import { loginUser, registerUser } from '../Controllers/AuthController.js';

const router = express.Router();

// Routes for user registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;