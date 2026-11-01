import express from 'express';
import { getOAuthUrl, handleCallback, getMe, sendMagicLink, logout } from '../controllers/authController.js';

const router = express.Router();

// OAuth initiation (Google / GitHub)
router.get('/login/:provider', getOAuthUrl);

// OAuth code exchange callback
router.post('/callback', handleCallback);

// Retrieve active user profile
router.get('/me', getMe);

// Send magic link
router.post('/magic-link', sendMagicLink);

// Logout session
router.post('/logout', logout);

export default router;
