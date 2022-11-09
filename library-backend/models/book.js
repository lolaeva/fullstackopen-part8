const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
  },
  published: {
    type: Number,
    minlength: 1,
  },
  genres: [{ type: String }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
})

module.exports = mongoose.model('Book', schema)
