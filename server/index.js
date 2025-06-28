import express from 'express';
import sql from 'mssql'; // Use mssql for SQL Server
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js';

// Initialize Express app
const app = express();

// Serve images for public (public folder)
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

dotenv.config();

// SQL Server database connection
async function connectToSQLServer() {
    try {
        const pool = await sql.connect({
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            server: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            port: parseInt(process.env.MYSQL_PORT) || 1433, // Default SQL Server port
            options: {
                encrypt: true, // Use encryption (recommended for Azure SQL)
                trustServerCertificate: true // For local dev, set to false in production with proper certificates
            }
        });
        console.log('Connected to SQL Server database');
        return pool;
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        process.exit(1); // Exit the process if the connection fails
    }
}

// Start the server after connecting to SQL Server
async function startServer() {
    const db = await connectToSQLServer();

    // Make the database connection pool available to routes
    app.set('db', db);

    // Routes
    app.use('/auth', AuthRoute);
    app.use('/user', UserRoute);
    app.use('/post', PostRoute);
    app.use('/upload', UploadRoute);

    // Start the server
    app.listen(process.env.PORT, () => {
        console.log(`Listening at ${process.env.PORT}`);
    });
}

startServer();