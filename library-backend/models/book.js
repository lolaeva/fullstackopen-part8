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
  author: {
    type: String,
    required: true,
    minlength: 1,
  },
  genres: {
    type: Array,
    required: true,
    minlength: 1,
  },
})

module.exports = mongoose.model('Book', schema)
