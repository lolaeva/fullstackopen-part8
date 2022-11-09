import { useState } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'



const App = () => {
  const [page, setPage] = useState('authors')
  const [message, setMessage] = useState('')

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => {
      setMessage('')
    }, 5000)
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Notify message={message}/>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} setError={showMessage}/>
    </div>
  )
}

export default App
