const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadProductImage = require('../config/multer');
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');

// Create a new blog post
router.post('/create', authMiddleware, uploadProductImage.single('image'), createBlog);

// Get all blog posts
router.get('/all', getAllBlogs);

// Get a single blog post by ID
router.get('/:id', getBlogById);

// Update a blog post by ID
router.put('/update/:id', uploadProductImage.single('image'), authMiddleware, updateBlog);

// Delete a blog post by ID
router.delete('/delete/:id', authMiddleware, deleteBlog);

module.exports = router;