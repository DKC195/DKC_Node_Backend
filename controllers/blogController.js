const blogModel = require('../models/blogModel');
const path = require('path');
const fs = require('fs');
const { transformImageUrl, transformImageUrls, getImageFilename } = require('../utils/imageUrl');

const baseUrl = (process.env.API_URL || 'http://localhost:8080') + '/uploads/'
const uploadDir = path.join(__dirname, '../uploads');

/* ================= CREATE BLOG ================= */
exports.createBlog = async (req, res) => {
    try {
        const { title, content, category, excerpt, readTime } = req.body;

        const image = req.file ? baseUrl + req.file.filename : null;

        const newBlog = await blogModel.create({
            title,
            content,
            category,
            excerpt,
            readTime,
            image,
        });

        res.status(201).json(transformImageUrl(newBlog));
    } catch (error) {
        console.error("Create Blog Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= GET ALL BLOGS ================= */
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find().sort({ createdAt: -1 });
        res.status(200).json(transformImageUrls(blogs));
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= GET BLOG BY ID ================= */
exports.getBlogById = async (req, res) => {
    try {
        const blog = await blogModel.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(transformImageUrl(blog));
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= UPDATE BLOG ================= */
exports.updateBlog = async (req, res) => {
    try {
        const { title, content, category, excerpt, readTime } = req.body;

        const blog = await blogModel.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // ✅ If new image uploaded
        if (req.file) {
            if (blog.image) {
                const oldImage = getImageFilename(blog.image);
                const oldPath = path.join(uploadDir, oldImage);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            blog.image = baseUrl + req.file.filename;
        }

        blog.title = title;
        blog.content = content;
        blog.category = category;
        blog.excerpt = excerpt;
        blog.readTime = readTime;

        await blog.save();
        res.status(200).json(transformImageUrl(blog));
    } catch (error) {
        console.error("Update Blog Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= DELETE BLOG ================= */
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await blogModel.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // ✅ Delete image from server
        if (blog.image) {
            const imageName = getImageFilename(blog.image);
            const imagePath = path.join(uploadDir, imageName);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await blog.deleteOne();
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Delete Blog Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
