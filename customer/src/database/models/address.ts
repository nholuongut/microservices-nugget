import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    street: String,
    postalCode: String,
    city: String,
    country: String
});

export default mongoose.model('address', AddressSchema);