const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
  placeid:{
    type: Schema.Types.ObjectId, 
    ref: 'Place'
  },
  nickname: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;