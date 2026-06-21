const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadProductImage = require("../config/multer");
const {createProject, getAllProjects, getProjectById, updateProject, deleteProject} = require("../controllers/projectController");

const router = express.Router();


router.post("/create", authMiddleware,uploadProductImage.single('image'), createProject);
router.get("/all", getAllProjects);
router.get("/:id", getProjectById);
router.put("/update/:id", authMiddleware,uploadProductImage.single('image'), updateProject);
router.delete("/delete/:id", deleteProject);

module.exports = router;