import { useState } from 'react'

import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import Recommended from './components/Recommended'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

import { BOOK_ADDED, ALL_BOOKS, ME } from './queries'

import { useSubscription, useApolloClient, useQuery } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('authors')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const booksResult = useQuery(ALL_BOOKS)
  const currentUser = useQuery(ME)

  // function that takes care of manipulating cache
  const updateCache = (addedBook) => {
    // helper that is used to eliminate saving same book twice
    const isIncluded = (set, book) => set.map((s) => s.title).includes(book.title)
    const dataInStore = client.readQuery({ query: ALL_BOOKS })

    if (!isIncluded(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) },
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded
      showMessage(`${bookAdded.title} added`)

      updateCache(bookAdded)
    },
  })

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => {
      setMessage('')
    }, 5000)
  }

  const logout = () => {
    setToken(null)
  }
  const loginPage = () => {
    setPage('authors')
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommended')}>recommended</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')}>login</button>
          </>
        )}
      </div>

      <Notify message={message} />

      <LoginForm
        show={page === 'login'}
        setError={showMessage}
        setToken={setToken}
        loginPage={loginPage}
      />

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} result={booksResult} currentUser={currentUser} />
      <Recommended show={page === 'recommended'} result={booksResult} currentUser={currentUser} />
      <NewBook show={page === 'add'} setError={showMessage} updateCache={updateCache} />
    </div>
  )
}

export default App
