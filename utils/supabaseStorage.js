const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const ws = require('ws');

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured. Set SUPABASE_URL and one of: SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY, or SUPABASE_ANON_KEY.');
  }

  global.WebSocket = ws;

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

function getMimeTypeFromExtension(fileName) {
  const ext = (path.extname(fileName || '').toLowerCase() || '').replace('.', '');
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

function getObjectPathFromImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  const storageMatch = imageUrl.match(/\/storage\/v1\/object\/(?:public|signed)\/[^/]+\/(.+)$/i);
  if (storageMatch) return storageMatch[1];

  const uploadsMatch = imageUrl.match(/\/uploads\/(.+)$/i);
  if (uploadsMatch) return uploadsMatch[1];

  return null;
}

async function uploadImageToSupabase(file, folder = 'images') {
  if (!file) return null;

  const client = getSupabaseClient();
  const bucket = process.env.SUPABASE_BUCKET || 'images';
  const buffer = file.buffer || file.data || (file.path ? fs.readFileSync(file.path) : null);

  if (!buffer) {
    throw new Error('The uploaded file has no buffer content to send to Supabase.');
  }

  const safeName = `${Date.now()}-${(file.originalname || 'image').replace(/\s+/g, '-')}`;
  const objectPath = `${folder}/${safeName}`;

  const { error } = await client.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.mimetype || getMimeTypeFromExtension(file.originalname || safeName),
    upsert: false,
    cacheControl: '3600',
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = client.storage.from(bucket).getPublicUrl(objectPath);
  return publicData?.publicUrl || null;
}

async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  const objectPath = getObjectPathFromImageUrl(imageUrl);
  if (!objectPath) return false;

  if (!imageUrl.includes('/storage/v1/object/')) {
    const localPath = path.join(__dirname, '../uploads', path.basename(objectPath));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return true;
  }

  const client = getSupabaseClient();
  const bucket = process.env.SUPABASE_BUCKET || 'images';
  const { error } = await client.storage.from(bucket).remove([objectPath]);
  return !error;
}

module.exports = {
  uploadImageToSupabase,
  deleteImageFromStorage,
  getObjectPathFromImageUrl,
};
