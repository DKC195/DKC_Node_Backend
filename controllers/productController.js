const productModel = require('../models/productModel');
const fs = require("fs");
const path = require("path");
const { transformImageUrl, transformImageUrls, getImageFilename } = require('../utils/imageUrl');
const { uploadImageToSupabase, deleteImageFromStorage } = require('../utils/supabaseStorage');

const baseUrl = (process.env.API_URL || 'http://localhost:8080') + '/uploads/'


// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            longDescription,
            bestFor,
            secondaryLink,
            secondaryLabel,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Product image is required" });
        }

        const imageUrl = await uploadImageToSupabase(req.file, 'products');

        const product = await productModel.create({
            title,
            description,
            shortDescription,
            longDescription,
            bestFor,
            image: imageUrl || (baseUrl + req.file.filename),
            provide: JSON.parse(req.body.provide || "[]"),
            advantages: JSON.parse(req.body.advantages || "[]"),
            secondaryLink,
            secondaryLabel,
        });

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });
        res.status(200).json(transformImageUrls(products));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(transformImageUrl(product));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Update normal fields
        product.title = req.body.title;
        product.shortDescription = req.body.shortDescription;
        product.description = req.body.description;
        product.longDescription = req.body.longDescription;
        product.bestFor = req.body.bestFor;

        if (req.body.provide) {
            product.provide = JSON.parse(req.body.provide);
        }

        if (req.body.advantages) {
            product.advantages = JSON.parse(req.body.advantages);
        }

        if (req.body.secondaryLink !== undefined) {
            product.secondaryLink = req.body.secondaryLink;
        }
        if (req.body.secondaryLabel !== undefined) {
            product.secondaryLabel = req.body.secondaryLabel;
        }

        // ✅ If new image uploaded
        if (req.file) {
            if (product.image) {
                await deleteImageFromStorage(product.image);
            }

            const imageUrl = await uploadImageToSupabase(req.file, 'products');
            product.image = imageUrl || `${baseUrl + req.file.filename}`;
        }

        await product.save();
        res.status(200).json(transformImageUrl(product));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product by ID (DB + Image file)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Delete image from server
        if (product.image) {
            await deleteImageFromStorage(product.image);
        }

        // ✅ Delete product from DB
        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product and image deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: error.message });
    }
};
