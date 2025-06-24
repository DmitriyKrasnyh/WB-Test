import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: Number,               // WB id → будет primary key
  name: String,
  price: Number,
  sale_price: Number,
  rating: Number,
  reviews_count: Number,
  image_url: String,
  brand: String,
  category: String,
}, { versionKey: false });

export default mongoose.model('Product', ProductSchema);
