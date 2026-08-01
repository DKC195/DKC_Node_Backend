const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { uploadImageToSupabase } = require('../utils/supabaseStorage');
const Product = require('../models/productModel');
const Blog = require('../models/blogModel');
const Project = require('../models/projectModel');

dotenv.config();

async function migrateModel(model, modelName, folder) {
  const docs = await model.find({ image: { $exists: true, $ne: null } });
  console.log(`Found ${docs.length} ${modelName} documents to inspect.`);

  for (const doc of docs) {
    if (!doc.image || doc.image.includes('/storage/v1/object/')) {
      continue;
    }

    const localPath = path.join(__dirname, '../uploads', path.basename(doc.image));
    if (!fs.existsSync(localPath)) {
      console.log(`Skipping ${modelName} ${doc._id}: local file not found -> ${localPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);
    const uploadResult = await uploadImageToSupabase({
      buffer: fileBuffer,
      originalname: fileName,
      mimetype: 'image/jpeg',
    }, folder);

    if (uploadResult) {
      doc.image = uploadResult;
      await doc.save();
      console.log(`Updated ${modelName} ${doc._id} -> ${uploadResult}`);
    }
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Mongo connected');

  await migrateModel(Product, 'product', 'products');
  await migrateModel(Blog, 'blog', 'blogs');
  await migrateModel(Project, 'project', 'projects');

  await mongoose.disconnect();
  console.log('Migration complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
