import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from '../config/environment.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Helper to set httpOnly cookie for JWT
const sendTokenCookie = (res, token) => {
  const isProd = config.nodeEnv === 'production' || process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, track } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      track: track ? track.trim() : 'DSA & CS Prep'
    });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        track: user.track,
        settings: user.settings || { darkMode: false, reminder: false }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        track: user.track,
        settings: user.settings || { darkMode: false, reminder: false }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user by clearing httpOnly cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const isProd = config.nodeEnv === 'production' || process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user password (Forgot Password)
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your registered email and a new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        track: user.track
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        track: req.user.track,
        settings: req.user.settings || { darkMode: false, reminder: false }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user's profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, track, settings } = req.body;
    const userId = req.userId || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (track && track.trim()) {
      user.track = track.trim();
    }

    if (settings && typeof settings === 'object') {
      user.settings = {
        ...(user.settings ? user.settings.toObject ? user.settings.toObject() : user.settings : {}),
        ...settings
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        track: user.track,
        settings: user.settings
      }
    });
  } catch (error) {
    next(error);
  }
};


