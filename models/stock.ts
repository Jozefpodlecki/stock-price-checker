import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const stocks = new Schema ({
  _id: {
    type: String
  },
  likes: {
    type: Number,
    default: 0
  },
  fetchDate: {
    type: Date,
    default: new Date()
  },
  price: {
    type: Number,
    required: true
  },
});

export default mongoose.model('stocks', stocks);