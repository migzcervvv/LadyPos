import Product from "../models/Product.js";
import { respond, respondError } from "../utils/responseHelpers.js";

const ownerIdFrom = (req) => req.user?._id || req.user?.id;
const toInt = (value, fallback) => Math.max(1, Number.parseInt(value ?? fallback, 10));
const money = (value) => Math.round(Number(value) || 0);

const productPayload = (body) => ({
  name: body.name,
  sku: body.sku || "",
  price: money(body.price ?? body.sellingPrice),
  stock: Math.max(0, Number.parseInt(body.stock ?? body.quantity ?? 0, 10)),
  category: body.category || "General",
  isActive: body.isActive ?? body.active ?? true,
  costPrice: money(body.costPrice ?? 0),
});

export async function createProduct(req, res) {
  try {
    const owner = ownerIdFrom(req);
    const product = await Product.create({ owner, ...productPayload(req.body) });
    respond(res, 201, "Product created", product);
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export async function getProducts(req, res) {
  try {
    const owner = ownerIdFrom(req);
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 20);
    const filter = { owner };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

    const sortField = ["name", "stock"].includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sort = { [sortField]: sortField === "createdAt" ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);

    respond(res, 200, "Products loaded", products, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: ownerIdFrom(req) });
    if (!product) return respondError(res, 404, "Product not found");
    respond(res, 200, "Product loaded", product);
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: ownerIdFrom(req) },
      productPayload(req.body),
      { new: true, runValidators: true },
    );

    if (!product) return respondError(res, 404, "Product not found");
    respond(res, 200, "Product updated", product);
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: ownerIdFrom(req) },
      { isActive: false },
      { new: true },
    );

    if (!product) return respondError(res, 404, "Product not found");
    respond(res, 200, "Product deactivated", product);
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export async function adjustStock(req, res) {
  try {
    const delta = Number.parseInt(req.body.delta ?? req.body.quantity ?? 0, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      return respondError(res, 400, "Stock adjustment must be a non-zero integer");
    }

    const product = await Product.findOne({ _id: req.params.id, owner: ownerIdFrom(req) });
    if (!product) return respondError(res, 404, "Product not found");
    product.stock = Math.max(0, product.stock + delta);
    await product.save();

    respond(res, 200, "Stock adjusted", product);
  } catch (err) {
    respondError(res, 500, err.message);
  }
}

export const setActiveProducts = async (req, res) => {
  try {
    const owner = ownerIdFrom(req);
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return respondError(res, 400, "productIds must be an array");
    }

    await Product.updateMany({ owner }, { $set: { isActive: false } });
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds }, owner },
        { $set: { isActive: true } },
      );
    }

    respond(res, 200, "Active products updated", null);
  } catch (err) {
    respondError(res, 500, err.message);
  }
};
