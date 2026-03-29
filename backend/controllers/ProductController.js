import Product from '../models/Product.js';

//
// Helper: safely get userId from JWT
//
function getUserId(req) {
  return req.user?.id || req.user?._id;
}

//
// CREATE PRODUCT
//
export async function createProduct(req, res, next) {
  try {
    const userId = getUserId(req);

    const product = await Product.create({
      userId,
      name: req.body.name,
      category: req.body.category || 'General',
      sellingPrice: req.body.sellingPrice,
      costPrice: req.body.costPrice,
      quantity: req.body.quantity ?? 0,
      paidStatus: req.body.paidStatus ?? false,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

//
// GET ALL PRODUCTS (for current user)
//
export async function getProducts(req, res, next) {
  try {
    const userId = getUserId(req);

    const products = await Product.find({ userId })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
}

//
// GET SINGLE PRODUCT
//
export async function getProductById(req, res, next) {
  try {
    const userId = getUserId(req);

    const product = await Product.findOne({
      _id: req.params.id,
      userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

//
// UPDATE PRODUCT
//
export async function updateProduct(req, res, next) {
  try {
    const userId = getUserId(req);

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        userId,
      },
      {
        name: req.body.name,
        category: req.body.category,
        sellingPrice: req.body.sellingPrice,
        costPrice: req.body.costPrice,
        quantity: req.body.quantity,
        paidStatus: req.body.paidStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

//
// DELETE PRODUCT
//
export async function deleteProduct(req, res, next) {
  try {
    const userId = getUserId(req);

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}