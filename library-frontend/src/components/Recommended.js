import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'
import BooksTable from './BooksTable'

const Recommended = (props) => {
  const result = useQuery(ALL_BOOKS)
  const currentUser = useQuery(ME)

  useEffect(() => {
    console.log('currentUser', currentUser.data)
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

  let books = result.data.allBooks.filter((b) =>
    b.genres.includes(currentUser.data.me.favouriteGenre)
  )

  return (
    <div>
      <h2>recommended</h2>
      <BooksTable books={books} />
    </div>
  )
}

export default Recommended
