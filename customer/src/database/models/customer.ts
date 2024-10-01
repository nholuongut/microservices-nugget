import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    salt: String,
    phone: String,
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "address", require: true }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export default mongoose.model("customer", CustomerSchema);