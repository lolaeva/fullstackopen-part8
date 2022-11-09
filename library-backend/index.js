const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')

const Book = require('./models/book')
const Author = require('./models/author')

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    author: String!
    published: Int!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async (root, args) => {
      return Book.collection.countDocuments()
    },
    authorCount: async (root, args) => {
      return Author.collection.countDocuments()
    },
    allBooks: async (root, args) => {
      let resultBooks = Book.find({})
      if (args.author) resultBooks = Book.find({ author: args.author })
      if (args.genre) resultBooks = Book.find({ genres: args.genres })
      return resultBooks
    },
    allAuthors: async (root, args) => Author.find({}),
  },
  Author: {
    bookCount: (root) => {
      const books = Book.find({ name: root.name })
      return books
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = new Book({ ...args })
      const currentAuthor = await Author.findOne({ name: book.author })
      try {
        if (!currentAuthor) {
          const author = new Author({ name: book.author })
          await author.save()
        } else {
          currentAuthor.bookCount += 1
          await currentAuthor.save()
        }
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return book
    },
    editAuthor: async (root, args) => {
      const author = Author.findOne({ name: args.name })
      if (author) {
        try {
          author.born = args.setBornTo
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return author
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
