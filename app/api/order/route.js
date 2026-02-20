import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";
import Order from "../models/order";
import Address from "../models/Address";

import Cart from "../models/cart";
import ProductVariant from "../models/ProductVariant";


export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

  // NX means "Only set if it doesn't exist" - perfect for preventing double-clicks
  
  if (!isLocked) {
    return NextResponse.json(
      { success: false, message: "Order is already processing..." },
      { status: 409 }
    );
  }
    const { addressId, shippingAddress } = await request.json();

    let address;

    // ---------------- ADDRESS HANDLING ----------------
    if (addressId) {
      // Use existing address
      address = await Address.findOne({
        _id: addressId,
        user: user.id,
      });

      if (!address) {
        return NextResponse.json(
          { success: false, message: "Address not found" },
          { status: 404 }
        );
      }
    } else if (shippingAddress) {
      // Create new address
      address = await Address.create({
        user: user.id,
        ...shippingAddress,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Address information is required" },
        { status: 400 }
      );
    }

    // ---------------- GET CART ----------------
    const cart = await Cart.findOne({ user: user.id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // ---------------- VALIDATE VARIANTS ----------------
    for (const item of cart.items) {
      const variant = await ProductVariant.findById(item.variant);
      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { success: false, message: "Invalid or inactive variant in cart" },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for SKU ${variant.sku}`,
          },
          { status: 400 }
        );
      }
    }

    // ---------------- CREATE ORDER ----------------
    const order = await Order.create({
      user: user.id,
      items: cart.items.map((i) => ({
        variant: i.variant,
        quantity: i.quantity,
        priceAtOrderTime: i.priceAtAddTime,
        subtotal: i.subtotal,
      })),
      totalQuantity: cart.totalQuantity,
      totalAmount: cart.totalPrice,
      shippingAddress: address._id,
      status: "created",
      payment: { status: "pending" },
    });

    // ---------------- CLEAR CART ----------------
    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");

    const filter = {};
    if (user.role !== "admin") {
      filter.user = user.id;
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate({
          path: "items.variant",
          populate: { path: "product" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
