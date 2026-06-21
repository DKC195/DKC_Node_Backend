const express = require('express');
const { registerUser, loginUser, logoutUser, checkAuth } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/admin/check-auth', authMiddleware,checkAuth);

module.exports = router;