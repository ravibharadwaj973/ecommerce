import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import Order from "../models/order";
import Cart from "../models/cart";
import Product from "../models/Product";
import { requireAuth } from "../auth/auth";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { shippingAddress, paymentMethod } = await request.json();

    // Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { success: false, message: "Valid shipping address is required" },
        { status: 400 }
      );
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        return NextResponse.json(
          { success: false, message: `${field} is required in shipping address` },
          { status: 400 }
        );
      }
    }

    // Fetch user cart
    const cart = await Cart.findOne({ userId: user.id });

    if (!cart || !cart.items) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // CLEAN CART ITEMS (REMOVE $__parent, $__ etc.)
    // ------------------------------------------------
    const rawItems =
      cart.items instanceof Map
        ? Object.fromEntries(cart.items)
        : { ...cart.items };

    const cleanedItems = {};

    for (const id in rawItems) {
      if (mongoose.Types.ObjectId.isValid(id)) cleanedItems[id] = rawItems[id];
    }

    if (Object.keys(cleanedItems).length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart contains invalid product data" },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // BUILD ORDER ITEMS + VALIDATE STOCK
    // ------------------------------------------------
    const orderItems = [];
    let totalAmount = 0;

    for (const productId in cleanedItems) {
      for (const size in cleanedItems[productId]) {
        const raw = cleanedItems[productId][size];

        // FIX: extract quantity safely
        const quantity =
          typeof raw === "object" && raw.quantity !== undefined
            ? raw.quantity
            : typeof raw === "number"
            ? raw
            : null;

        if (!quantity || quantity <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid quantity for product ${productId}, size ${size}`,
            },
            { status: 400 }
          );
        }

        const product = await Product.findById(productId);

        if (!product) {
          return NextResponse.json(
            { success: false, message: `Product not found: ${productId}` },
            { status: 404 }
          );
        }

        if (!product.isPublished) {
          return NextResponse.json(
            {
              success: false,
              message: `Product no longer available: ${product.name}`,
            },
            { status: 400 }
          );
        }

        if (product.stock < quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
            },
            { status: 400 }
          );
        }

        orderItems.push({
          productId: product._id,
          quantity,
          size,
          price: product.price,
          name: product.name,
          image: product.images?.[0] || null,
        });

        totalAmount += product.price * quantity;
      }
    }

    // ------------------------------------------------
    // TOTAL + SHIPPING + TAX
    // ------------------------------------------------
    const shippingCost = totalAmount > 50 ? 0 : 9.99;
    const tax = totalAmount * 0.08;
    const finalTotal = totalAmount + shippingCost + tax;

    if (isNaN(finalTotal)) {
      return NextResponse.json(
        {
          success: false,
          message: "Error calculating total amount",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------------
    // CREATE ORDER
    // ------------------------------------------------
    const order = await Order.create({
      userId: user.id,
      items: orderItems,
      shippingAddress,
      totalAmount: parseFloat(finalTotal.toFixed(2)),
      status: "pending",
      paymentStatus: "pending",
    });

    // ------------------------------------------------
    // UPDATE STOCK
    // ------------------------------------------------
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // ------------------------------------------------
    // CLEAR CART
    // ------------------------------------------------
    await Cart.findOneAndUpdate({ userId: user.id }, { items: {} });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { order, orderNumber: order.id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during checkout",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
