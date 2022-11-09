const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    books: [Book!]!
    bookCount: Int!
  }

  type Query {
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    createUser(username: String!, favouriteGenre: String!): User
    login(username: String!, password: String!): Token
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    me: async (root, args, context) => {
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
      const user = User.findOne({ username: args.username })

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
      const user = new User({ username: args.username })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    addBook: async (root, args) => {
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

      return book
    },
    editAuthor: async (root, args) => {
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
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
