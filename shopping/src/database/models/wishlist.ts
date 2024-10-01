import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  customerId: { type: String },
  products: [
    {
      _id: { type: String, require: true },
    },
  ],
});

export default mongoose.model("wishlist", WishlistSchema);
