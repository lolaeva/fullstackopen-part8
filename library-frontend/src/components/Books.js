import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'
import Filters from './Filters'
import BooksTable from './BooksTable'

const Books = (props) => {
  const [filter, setFilter] = useState('')
  const result = useQuery(ALL_BOOKS)
  const currentUser = useQuery(ME)

  useEffect(() => {
    console.log("currentUser", currentUser.data);
  }, [currentUser])

  if (!props.show) {
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
