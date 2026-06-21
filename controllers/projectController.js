const projectModel = require("../models/projectModel");
const fs = require("fs");
const path = require("path");
const { transformImageUrl, transformImageUrls, getImageFilename } = require('../utils/imageUrl');

const baseUrl = (process.env.API_URL || 'http://localhost:8080') + '/uploads/'
const uploadDir = path.join(__dirname, "../uploads");

/* ================= CREATE PROJECT ================= */
exports.createProject = async (req, res) => {
    try {
        const { title, description, longDescription, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Project image is required" });
        }

        const project = await projectModel.create({
            title,
            description,
            longDescription,
            category,
            image: baseUrl + req.file.filename,
        });

        res.status(201).json(project);
    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= GET ALL PROJECTS ================= */
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await projectModel.find().sort({ createdAt: -1 });
        res.status(200).json(transformImageUrls(projects));
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= GET PROJECT BY ID ================= */
exports.getProjectById = async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json(transformImageUrl(project));
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= UPDATE PROJECT ================= */
exports.updateProject = async (req, res) => {
    try {
        const { title, description, longDescription, category } = req.body;

        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // ✅ If new image uploaded → delete old one
        if (req.file) {
            if (project.image) {
                const oldImage = getImageFilename(project.image);
                const oldPath = path.join(uploadDir, oldImage);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            project.image = baseUrl + req.file.filename;
        }

        project.title = title;
        project.description = description;
        project.longDescription = longDescription;
        project.category = category;

        await project.save();
        res.status(200).json(transformImageUrl(project));
    } catch (error) {
        console.error("Update Project Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= DELETE PROJECT ================= */
exports.deleteProject = async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // ✅ Delete image from server
        if (project.image) {
            const imageName = getImageFilename(project.image);
            const imagePath = path.join(uploadDir, imageName);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await project.deleteOne();
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
