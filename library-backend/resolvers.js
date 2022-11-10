const { UserInputError, AuthenticationError } = require('apollo-server')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const jwt = require('jsonwebtoken')
const config = require('./utils/config')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: async (root, args) => {
      return Book.collection.countDocuments()
    },
    authorCount: async (root, args) => {
      return Author.collection.countDocuments()
    },
    allBooks: async (root, args) => {
      if (args.author) {
        const foundAuthor = await Author.findOne({ name: args.author })
        if (foundAuthor) {
          if (args.genre) {
            return await Book.find({
              author: foundAuthor.id,
              genres: { $in: [args.genre] },
            }).populate('author')
          }
          return await Book.find({ author: foundAuthor.id }).populate('author')
        }
        return null
      }

      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }

      return Book.find({}).populate('author')
    },
    allAuthors: async (root, args) => {
      return await Author.find({}).populate('books')
    },
  },
  Author: {
    bookCount: async (root, args) => {
      return await root.books.length
    },
  },
  Mutation: {
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password != 'secret') {
        throw new UserInputError('invalid credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, config.JWT_SECRET) }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })
      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const existingBook = await Book.findOne({ title: args.title })
      if (existingBook) {
        throw new UserInputError('Book already exists', {
          invalidArgs: args.title,
        })
      }

      let authorId = null
      let bookAuthor = null

      const currentAuthor = await Author.findOne({ name: args.author })

      // check for existing author
      if (!currentAuthor) {
        try {
          // add new author
          bookAuthor = new Author({ name: args.author })
          await bookAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        // find existing author
        bookAuthor = await Author.findById(currentAuthor._id)
      }
      // add new book
      const book = new Book({
        ...args,
        author: bookAuthor,
      })

      // save book and add it to author
      try {
        await book.save()
        await bookAuthor.updateOne({ $push: { books: book } })
      } catch (error) {
        throw new UserInputError(error.message, {
          invalid: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const author = await Author.findOne({ name: args.name })
      if (author) {
        try {
          author.born = args.setBornTo
          await author.save()
          return author
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        return null
      }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers
