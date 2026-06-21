/**
 * Rewrites image URLs that use localhost to the public API URL.
 * Fixes existing DB records that were saved with localhost before API_URL was configured.
 */
function toPublicImageUrl(url) {
    if (!url || typeof url !== 'string') return url;
    const apiBase = (process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '');
    return url.replace(/^https?:\/\/[^/]+/, apiBase);
}

/** Extracts filename from image URL (handles both localhost and API_URL formats). */
function getImageFilename(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') return '';
    const match = imageUrl.match(/\/uploads\/(.+)$/);
    return match ? match[1] : imageUrl;
}

function transformImageUrl(doc) {
    if (!doc) return doc;
    const transformed = doc.toObject ? doc.toObject() : { ...doc };
    if (transformed.image) {
        transformed.image = toPublicImageUrl(transformed.image);
    }
    return transformed;
}

function transformImageUrls(docs) {
    if (!Array.isArray(docs)) return transformImageUrl(docs);
    return docs.map((doc) => transformImageUrl(doc));
}

module.exports = { toPublicImageUrl, getImageFilename, transformImageUrl, transformImageUrls };
