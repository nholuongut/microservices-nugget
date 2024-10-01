import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  customerId: { type: String },
  items: [
    {
      product: {
        _id: { type: String, require: true },
        name: { type: String },
        img: { type: String },
        unit: { type: Number },
        price: { type: Number },
      },
      unit: { type: Number, require: true },
    },
  ],
});

export default mongoose.model("cart", CartSchema);
