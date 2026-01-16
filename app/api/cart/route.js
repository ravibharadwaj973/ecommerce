import { NextResponse } from "next/server";
import Cart from "../models/cart";
import Product from "../models/Product";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";

import mongoose from "mongoose";

const enrichCartItems = async (items) => {
  // STEP 1: Ensure items is a plain object
  const plainItems =
    items instanceof Map ? Object.fromEntries(items) : { ...items };

  if (!plainItems || Object.keys(plainItems).length === 0) return {};

  // STEP 2: Collect valid product IDs
  const validIds = Object.keys(plainItems).filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (validIds.length === 0) return {};

  // STEP 3: Fetch all products (LEAN = always plain JSON)
  const products = await Product.find({
    _id: { $in: validIds }
  })
    .select("name price images stock sizes isPublished")
    .lean(); // VERY IMPORTANT — returns plain JSON

  // STEP 4: Build product lookup map
  const productMap = {};
  products.forEach((p) => (productMap[p._id.toString()] = p));

  const enriched = {};

  // STEP 5: Build final simple response
  for (const productId of Object.keys(plainItems)) {
    const product = productMap[productId];

    if (!product || !product.isPublished) continue;

    enriched[productId] = {};

    const sizeObj = plainItems[productId];

    for (const sizeKey of Object.keys(sizeObj)) {
      const entry = sizeObj[sizeKey];

      // entry may be: { quantity: 1 } OR 1
      const qty =
        typeof entry === "object" && entry.quantity != null
          ? entry.quantity
          : entry;

      enriched[productId][sizeKey] = {
        quantity: qty,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        stock: product.stock,
        available: product.stock >= qty,
        size: sizeKey,
      };
    }
  }

  return enriched;
};

export default enrichCartItems;
//
// 📍 GET — Get User Cart
// ---------------------------------------
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const userId = user.id;
// console.log(userId)
    let cart = await Cart.findOne({  userId });
    if (!cart) {
      cart = await Cart.create({  userId, items: {} });
    }
const plainItems =
  cart.items instanceof Map ? Object.fromEntries(cart.items) : cart.items;

const enrichedItems = await enrichCartItems(plainItems);

    return NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          userId: userId,
          items: enrichedItems,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching cart", error: error.message },
      { status: 500 }
    );
  }
}

//
// 📍 POST — Add item to cart
// ---------------------------------------
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { itemId, size, quantity = 1 } = await request.json();
    const userId = user.id;

    if (!itemId ) {
      return NextResponse.json(
        { success: false, message: "Product ID and size are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const product = await Product.findById(itemId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isPublished) {
      return NextResponse.json(
        { success: false, message: "Product is not available" },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stock} in stock` },
        { status: 400 }
      );
    }

    if (product.sizes?.length > 0 && !product.sizes.includes(size)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid size. Available: ${product.sizes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ------------------------------
    // FIND OR CREATE CART
    // ------------------------------
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: {} });
    }

    // -----------------------------------------
    // FIX: Convert Map → plain object correctly
    // -----------------------------------------
    const items =
      cart.items instanceof Map
        ? Object.fromEntries(cart.items)
        : { ...cart.items };

    // Ensure product entry exists
    if (!items[itemId]) items[itemId] = {};

    const currentQuantity = items[itemId][size] || 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot exceed stock. Available: ${product.stock}`,
        },
        { status: 400 }
      );
    }

    // Update quantity
    items[itemId][size] = newQuantity;

    // ------------------------------
    // CLEAN INTERNAL MONGOOSE KEYS
    // ------------------------------
    const plainItems = Object.fromEntries(
      Object.entries(items).filter(([key]) => !key.startsWith("$"))
    );

    // SAVE TO DB
    await Cart.findByIdAndUpdate(cart._id, { items: plainItems });

    // ENRICH RESPONSE
    const enrichedItems = await enrichCartItems(plainItems);

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      data: {
        cart: {
          id: cart._id,
          userId,
          items: enrichedItems,
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error adding to cart", error: error.message },
      { status: 500 }
    );
  }
}


//
// 📍 PUT — Update item quantity
// ---------------------------------------
export async function PUT(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { itemId, size, quantity } = await request.json();
    const userId = user.id;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Product ID, size, and quantity required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(itemId).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // Convert Mongoose Map → plain object
    const plainItems =
      cart.items instanceof Map ? Object.fromEntries(cart.items) : { ...cart.items };

    // -----------------------
    // REMOVE ITEM
    // -----------------------
    if (quantity === 0) {
      if (plainItems[itemId] && plainItems[itemId][size]) {
        delete plainItems[itemId][size];

        if (Object.keys(plainItems[itemId]).length === 0) {
          delete plainItems[itemId];
        }
      }
    }

    // -----------------------
    // ADD / UPDATE ITEM
    // -----------------------
    else {
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, message: `Only ${product.stock} in stock` },
          { status: 400 }
        );
      }

      if (!plainItems[itemId]) plainItems[itemId] = {};
      plainItems[itemId][size] = quantity;
    }

    // -----------------------
    // SAVE BACK TO MONGODB
    // -----------------------
    await Cart.findByIdAndUpdate(cart._id, { items: plainItems });

    // -----------------------
    // RETURN ENRICHED CART
    // -----------------------
    const enrichedItems = await enrichCartItems(plainItems);

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
      data: {
        cart: {
          id: cart._id,
          userId,
          items: enrichedItems,
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating cart", error: error.message },
      { status: 500 }
    );
  }
}


//
// 📍 DELETE — Clear entire cart
// ---------------------------------------
export async function DELETE(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const userId = user.id;
    console.log(userId)
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = {};
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        cart: {
          id: cart._id,
          userId,
          items: {},
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error clearing cart", error: error.message },
      { status: 500 }
    );
  }
}
