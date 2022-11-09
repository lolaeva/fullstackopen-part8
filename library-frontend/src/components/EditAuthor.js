import { useState } from 'react'
import { useMutation } from '@apollo/client'
import Select from 'react-select'
import { EDIT_AUTHOR } from '../queries'
import { ALL_AUTHORS } from '../queries'


const EditAuthor = (props) => {
  const [option, setOption] = useState(null)
  const [birthYear, setBirthYear] = useState('')


  const options = props.authors.map((a) => {
    return { value: a.name, label: a.name }
  })

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const submit = (event) => {
    event.preventDefault()

    const name = option.value

    editAuthor({ variables: { name, birthYear } })

    setOption(null)
    setBirthYear('')
  }

  return (
    <div>
      <h2>Set birth year</h2>

      <form onSubmit={submit}>
        <Select defaultValue={option} onChange={setOption} options={options} />
        <div>
          birth year
          <input
            value={birthYear}
            onChange={({ target }) => setBirthYear(parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor
