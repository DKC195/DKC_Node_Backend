const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    readTime: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
},{timestamps: true});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;