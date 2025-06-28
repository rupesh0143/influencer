import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

// Configure dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/'); // Store images in uploads/ directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename with original extension
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Serve uploaded images statically
app.use('/uploads', express.static('Uploads'));

// SQL Server configuration
const dbConfig = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  server: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Endpoint to execute usp_getLoginDetails
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Connect to SQL Server
    let pool = await sql.connect(dbConfig);

    // Execute stored procedure
    let result = await pool.request()
      .input('email', sql.VarChar(255), email)
      .input('password', sql.VarChar(255), password)
      .execute('usp_getLoginDetails');

    // Check if login is successful
    if (result.recordset.length > 0) {
      res.status(200).json({
        success: true,
        data: result.recordset
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    sql.close();
  }
});

// Endpoint to handle user signup with image upload
app.post('/signUp', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validate input
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password and full name are required'
      });
    }

    // Connect to SQL Server
    let pool = await sql.connect(dbConfig);

    // Execute stored procedure for signup
    let result = await pool.request()
      .input('Username', sql.VarChar(255), username)
      .input('Email', sql.VarChar(255), email)
      .input('PasswordHash', sql.VarChar(255), password)
      .input('googleId',sql.VarChar(255)," ") 
      .input('FullName', sql.VarChar(255), fullName)
      .output('NewInfluencerID', sql.Int)
      .execute('USP_SimpleUserSignUp');

    // Get the new influencer ID from output parameter
    const newInfluencerID = result.output.NewInfluencerID;

    // Fetch the new user's profile details
    if (!newInfluencerID){
            return res.status(400).json({
        success: false,
        error: 'User alreay exits'
      });
    }

    let profileResult = await pool.request()
      .input('InfluencerID', sql.Int, newInfluencerID)
      .execute('sp_GetInfluencerDetails');

    

    // Check if profile exists
    if (profileResult.recordset.length > 0) {
      const profile = profileResult.recordset[0];
      const availableServices = profile.AvailableServices
        ? profile.AvailableServices.split(',').map(s => s.trim())
        : [];

      res.status(201).json({
        success: true,
        data: [{
          InfluencerID: newInfluencerID,
          username: profile.Username,
          email: profile.Email,
          fullName: profile.FullName,
          socialMediaPlatform: profile.SocialMediaPlatform,
          followerCount: profile.FollowerCount,
          engagementRate: profile.EngagementRate,
          niche: profile.Niche,
          bio: profile.Bio,
          serviceCount: profile.ServiceCount,
          averageRating: profile.AverageRating,
          availableServices,
        }]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Failed to retrieve new user profile'
      });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    sql.close();
  }
});

// Endpoint to fetch influencer profile details
app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Valid influencer ID is required' });
    }

    // Connect to SQL Server
    let pool = await sql.connect(dbConfig);

    // Execute stored procedure
    let result = await pool.request()
      .input('InfluencerID', sql.Int, parseInt(id))
      .execute('sp_GetInfluencerDetails');

    // Check if profile exists
    if (result.recordset.length > 0) {
      const profile = result.recordset[0];
      const availableServices = profile.AvailableServices
        ? profile.AvailableServices.split(',').map(s => s.trim())
        : [];

      res.status(200).json({
        success: true,
        data: {
          InfluencerID: id,
          username: profile.Username,
          email: profile.Email,
          fullName: profile.FullName,
          socialMediaPlatform: profile.SocialMediaPlatform,
          followerCount: profile.FollowerCount,
          engagementRate: profile.EngagementRate,
          niche: profile.Niche,
          bio: profile.Bio,
          serviceCount: profile.ServiceCount,
          averageRating: profile.AverageRating,
          availableServices,
          profileImage: profile.ProfileImage ? `http://localhost:${port}/${profile.ProfileImage}` : null // Full URL
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    sql.close();
  }
});

// Endpoint to fetch all influencer profiles
app.get('/profiles', async (req, res) => {
  try {
    // Connect to SQL Server
    let pool = await sql.connect(dbConfig);

    // Execute stored procedure or query to get all profiles
    let result = await pool.request()
      .execute('USP_GetInfluencerDetailsPageWise'); // Assumes a stored procedure exists

    // Check if profiles exist
    if (result.recordset.length > 0) {
      const profiles = result.recordset.map(profile => ({
        InfluencerID: profile.InfluencerID,
        username: profile.Username,
        email: profile.Email,
        fullName: profile.FullName,
        socialMediaPlatform: profile.SocialMediaPlatform,
        followerCount: profile.FollowerCount,
        engagementRate: profile.EngagementRate,
        niche: profile.Niche,
        bio: profile.Bio,
        serviceCount: profile.ServiceCount,
        averageRating: profile.AverageRating,
        availableServices: profile.AvailableServices
          ? profile.AvailableServices.split(',').map(s => s.trim())
          : [],
        profileImage: profile.ProfileImage ? `http://localhost:${port}/${profile.ProfileImage}` : null // Full URL
      }));

      res.status(200).json({
        success: true,
        data: profiles
      });
    } else {
      res.status(200).json({
        success: true,
        data: []
      });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    sql.close();
  }
});

app.post('/googlelogin', async (req, res) => {
  try {
    const { fullName, email, googleId } = req.body;

    const username = email;


    // Validate input
    if (!email || !googleId) {
      return res.status(400).json({ success: false, error: 'Email and Google ID are required' });
    }

    // Connect to SQL Server
    let pool = await sql.connect(dbConfig);

    // Check if user exists with the provided Google ID or email
    let checkResult = await pool.request()
      .input('Email', sql.VarChar(255), email)
      .input('GoogleId', sql.VarChar(255), googleId)
      .execute('usp_getLoginDetails'); // Replace with actual stored procedure name

    if (checkResult.recordset.length > 0) {
      // User exists, fetch their profile
      const profile = checkResult.recordset[0];
      let profileResult = await pool.request()
        .input('InfluencerID', sql.Int, profile.InfluencerID)
        .execute('sp_GetInfluencerDetails');

      if (profileResult.recordset.length > 0) {
        const userProfile = profileResult.recordset[0];
        const availableServices = userProfile.AvailableServices
          ? userProfile.AvailableServices.split(',').map(s => s.trim())
          : [];

        res.status(200).json({
          success: true,
          data: {
            InfluencerID: userProfile.InfluencerID,
            username: userProfile.Username,
            email: userProfile.Email,
            fullName: userProfile.FullName,
            socialMediaPlatform: userProfile.SocialMediaPlatform,
            followerCount: userProfile.FollowerCount,
            engagementRate: userProfile.EngagementRate,
            niche: userProfile.Niche,
            bio: userProfile.Bio,
            serviceCount: userProfile.ServiceCount,
            averageRating: userProfile.AverageRating,
            availableServices,
            profileImage: userProfile.ProfileImage
              ? `http://localhost:${port}/${userProfile.ProfileImage}`
              : null
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Failed to retrieve user profile'
        });
      }
    } else {
      // User doesn't exist, create a new user
      let signupResult = await pool.request()
        .input('Username',sql.VarChar(255),username)
        .input('Email', sql.VarChar(255), email)
        .input('FullName', sql.VarChar(255), fullName || '')
        .input('PasswordHash',sql.VarChar(255),'')
        .input('googleId', sql.VarChar(255), googleId)
        .output('NewInfluencerID', sql.Int)
        .execute('USP_SimpleUserSignUp')

      const newInfluencerID = signupResult.output.NewInfluencerID;

      // Fetch the new user's profile
      let profileResult = await pool.request()
        .input('InfluencerID', sql.Int, newInfluencerID)
        .execute('sp_GetInfluencerDetails');

      if (profileResult.recordset.length > 0) {
        const userProfile = profileResult.recordset[0];
        const availableServices = userProfile.AvailableServices
          ? userProfile.AvailableServices.split(',').map(s => s.trim())
          : [];

        res.status(201).json({
          success: true,
          data: {
            InfluencerID: newInfluencerID,
            username: userProfile.Username,
            email: userProfile.Email,
            fullName: userProfile.FullName,
            socialMediaPlatform: userProfile.SocialMediaPlatform,
            followerCount: userProfile.FollowerCount,
            engagementRate: userProfile.EngagementRate,
            niche: userProfile.Niche,
            bio: userProfile.Bio,
            serviceCount: userProfile.ServiceCount,
            averageRating: userProfile.AverageRating,
            availableServices,
            profileImage: userProfile.ProfileImage
              ? `http://localhost:${port}/${userProfile.ProfileImage}`
              : null
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Failed to retrieve new user profile'
        });
      }
    }
  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    sql.close();
  }
});

// Endpoint to check if user exists
app.post('/checkUser', async (req, res) => {
  try {
    const { email, username } = req.body;
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('Email', sql.VarChar(255), email)
      .input('Username', sql.VarChar(255), username)
      .execute('usp_getLoginDetails');

    res.status(200).json({ exists: result.recordset.length > 0 });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    sql.close();
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Error handling for SQL connection
sql.on('error', err => {
  console.error('SQL Connection error:', err);
});