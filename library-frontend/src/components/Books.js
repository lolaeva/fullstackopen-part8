import { useState } from 'react'
import Filters from './Filters'
import BooksTable from './BooksTable'

const Books = ({show, result}) => {
  const [filter, setFilter] = useState('')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <>loading...</>
  }
  if (!result.data) {
    return <></>
  }

  let books = filter === '' ? result.data.allBooks : result.data.allBooks.filter(book => book.genres.includes(filter))

  return (
    <div>
      <h2>books</h2>
      <BooksTable books={books}/>
      <Filters books={books} setFilter={setFilter} />
    </div>
  )
}

export default Books
