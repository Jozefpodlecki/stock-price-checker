import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const stockLikes = new Schema ({
  _id: {
    type: String
  },
  stocks: {
    type: [String]
  },
});

export default mongoose.model('stockLikes', stockLikes);