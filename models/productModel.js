const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
            required: true,
        },
        shortDescription: {
            type: String,
        },
        longDescription: {
            type: String,
        },
        bestFor: {
            type: String,
        },
        provide: [{ type: String }],
        advantages: [{ type: String }],
        secondaryLink: {
            type: String,
        },
        secondaryLabel: {
            type: String,
        },
    },
    { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;