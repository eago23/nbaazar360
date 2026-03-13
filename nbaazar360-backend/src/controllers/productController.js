const Product = require('../models/Product');
const User = require('../models/User');
const { sendSuccess, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFile } = require('../middleware/upload');
const logger = require('../utils/logger');

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Get all products for a vendor (public)
 * GET /api/vendors/:id/products
 */
const getVendorProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify vendor exists and is active
  const vendor = await User.findById(parseInt(id, 10));
  if (!vendor || vendor.role !== 'vendor' || vendor.status !== 'active') {
    return sendNotFound(res, 'Vendor');
  }

  const products = await Product.getByVendorId(parseInt(id, 10));

  return sendSuccess(res, { products });
});

// ============================================
// VENDOR SELF-MANAGEMENT ENDPOINTS
// ============================================

/**
 * Get own products (vendor)
 * GET /api/vendor/products
 */
const getOwnProducts = asyncHandler(async (req, res) => {
  const products = await Product.getByVendorId(req.user.id);
  return sendSuccess(res, { products });
});

/**
 * Create product (vendor)
 * POST /api/vendor/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image_url } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return sendError(res, 'Emri i produktit është i detyrueshëm', 'VALIDATION_ERROR', 400);
  }

  if (price === undefined || price === null || isNaN(price) || parseFloat(price) <= 0) {
    return sendError(res, 'Çmimi duhet të jetë një numër pozitiv', 'VALIDATION_ERROR', 400);
  }

  const product = await Product.create({
    vendor_id: req.user.id,
    name: name.trim(),
    price: parseFloat(price),
    image_url: image_url || null
  });

  logger.info('Product created', { productId: product.id, vendorId: req.user.id });

  return sendSuccess(res, product, 'Produkti u krijua me sukses', 201);
});

/**
 * Update product (vendor)
 * PUT /api/vendor/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, image_url } = req.body;

  const product = await Product.findById(parseInt(id, 10));
  if (!product) {
    return sendNotFound(res, 'Product');
  }

  // Check ownership
  if (product.vendor_id !== req.user.id) {
    return sendError(res, 'Ky produkt nuk ju përket', 'FORBIDDEN', 403);
  }

  const updateData = {};

  if (name !== undefined) {
    if (!name.trim()) {
      return sendError(res, 'Emri i produktit është i detyrueshëm', 'VALIDATION_ERROR', 400);
    }
    updateData.name = name.trim();
  }

  if (price !== undefined) {
    if (isNaN(price) || parseFloat(price) <= 0) {
      return sendError(res, 'Çmimi duhet të jetë një numër pozitiv', 'VALIDATION_ERROR', 400);
    }
    updateData.price = parseFloat(price);
  }

  if (image_url !== undefined) {
    // Delete old image if replacing with new one
    if (product.image_url && image_url !== product.image_url) {
      await deleteFile(product.image_url);
    }
    updateData.image_url = image_url;
  }

  const updatedProduct = await Product.update(parseInt(id, 10), updateData);

  logger.info('Product updated', { productId: id, vendorId: req.user.id });

  return sendSuccess(res, updatedProduct, 'Produkti u përditësua me sukses');
});

/**
 * Delete product (vendor)
 * DELETE /api/vendor/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(parseInt(id, 10));
  if (!product) {
    return sendNotFound(res, 'Product');
  }

  // Check ownership
  if (product.vendor_id !== req.user.id) {
    return sendError(res, 'Ky produkt nuk ju përket', 'FORBIDDEN', 403);
  }

  // Delete product image from storage
  if (product.image_url) {
    await deleteFile(product.image_url);
  }

  await Product.delete(parseInt(id, 10));

  logger.info('Product deleted', { productId: id, vendorId: req.user.id });

  return sendSuccess(res, null, 'Produkti u fshi me sukses');
});

/**
 * Upload product image (vendor)
 * POST /api/vendor/products/upload-image
 */
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  // Get file URL (Cloudinary HTTPS URL or local relative path)
  let imageUrl;
  if (req.file.path && req.file.path.startsWith('http')) {
    imageUrl = req.file.path;
  } else {
    imageUrl = `/uploads/products/${req.file.filename}`;
  }

  logger.info('Product image uploaded', { vendorId: req.user.id, url: imageUrl });

  return sendSuccess(res, { image_url: imageUrl }, 'Imazhi u ngarkua me sukses', 201);
});

module.exports = {
  getVendorProducts,
  getOwnProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
