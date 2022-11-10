import { useState } from 'react'

import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import Recommended from './components/Recommended'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const App = () => {
  const [page, setPage] = useState('authors')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(null)

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

      <Books show={page === 'books'} />
      <Recommended show={page === 'recommended'}/>
      <NewBook show={page === 'add'} setError={showMessage} />
    </div>
  )
}

export default App
