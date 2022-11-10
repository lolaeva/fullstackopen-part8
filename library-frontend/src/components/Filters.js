import { useState } from 'react'

const Filters = ({ books, setFilter }) => {
  const genres = []
  books.forEach((b) => {
    b.genres.forEach((g) => {
      if (!genres.includes(g)) genres.push(g)
    })
  })

  return (
    <>
      {genres.map((genre) => (
        <button key={genre} onClick={() => setFilter(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => setFilter('')}>all genres</button>
    </>
  )
}

export default Filters
