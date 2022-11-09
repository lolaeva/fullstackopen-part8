const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  born: {
    type: Number,
  },
  books: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'Book' 
  }],
})

module.exports = mongoose.model('Author', schema)
