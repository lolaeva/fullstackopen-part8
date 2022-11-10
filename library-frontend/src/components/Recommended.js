import BooksTable from './BooksTable'

const Recommended = ({show, result, currentUser}) => {

  if (!show) {
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
