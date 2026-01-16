import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

async function fixVendorIndexes() {
  try {
    console.log(process.env.MONGODB_URI)
    await mongoose.connect("mongodb+srv://jharavi0605_db_user:google2025@cluster0.oywfdew.mongodb.net/?appName=Cluster0");

    const collection = mongoose.connection.db.collection("vendors");

    const indexes = await collection.indexes();
    console.log("Existing indexes:", indexes);

    // 🔥 Drop old `id` index if it exists
    const hasIdIndex = indexes.find(i => i.name === "id_1");

    if (hasIdIndex) {
      await collection.dropIndex("id_1");
      console.log("✅ Dropped index: id_1");
    } else {
      console.log("ℹ️ No id_1 index found");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to fix indexes:", err);
    process.exit(1);
  }
}

fixVendorIndexes();
