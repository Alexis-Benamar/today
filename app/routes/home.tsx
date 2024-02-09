import { ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, json, redirect, useLoaderData, useSubmit } from '@remix-run/react'
import { ChangeEvent, FormEvent, useRef } from 'react'
import { LoaderFunctionArgs } from 'react-router'
import { supabase } from '~/api/supabase.server'
import { cookie } from '~/auth/cookie'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = await cookie.parse(request.headers.get('Cookie'))

  if (!auth) {
    throw redirect('/login', {
      headers: {
        'Set-Cookie': await cookie.serialize('', {
          maxAge: 0,
        }),
      },
    })
  }

  const { data: todos, error } = await supabase.from('todos').select('*')
  if (error) {
    return json({ ok: false, todos: null, error }, { status: 500 })
  }

  return json({ ok: true, todos, error: null })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // TODO: move to auth file
  const auth = await cookie.parse(request.headers.get('Cookie'))

  if (!auth) {
    throw redirect('/login', {
      headers: {
        'Set-Cookie': await cookie.serialize('', {
          maxAge: 0,
        }),
      },
    })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) {
    return json({ ok: false, createdTodo: null, error: userError }, { status: 400 })
  }

  const formData = await request.formData()
  const intent = String(formData.get('intent'))

  if (intent === 'create') {
    const text = String(formData.get('text'))

    const { data: createdTodo, error: createError } = await supabase.from('todos').insert({
      text,
      user_id: user?.id,
    })
    if (createError) {
      return json({ ok: false, createdTodo: null, error: createError }, { status: 400 })
    }

    return json({
      ok: true,
      createdTodo,
      error: null,
    })
  }

  return null
}

export default function Home() {
  const { todos } = useLoaderData<typeof loader>()
  const submit = useSubmit()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleOnChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    submit(
      {
        id,
        intent: 'check',
      },
      {
        method: 'post',
        navigate: false,
      },
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.append('intent', 'create')

    submit(formData, {
      method: 'post',
      navigate: false,
    })

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <main>
      <Link to='/logout'>logout</Link>
      <div role='list'>
        {todos?.map(todo => (
          <div key={todo.id}>
            <input
              type='checkbox'
              checked={todo.done}
              name={`todo-${todo.id}`}
              onChange={e => handleOnChange(todo.id, e)}
            />
            <label htmlFor={`todo-${todo.id}`}>{todo.text}</label>
          </div>
        ))}
      </div>
      <Form method='post' onSubmit={handleSubmit}>
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          placeholder='add todo...'
          name='text'
          ref={inputRef}
          required
        />
        <button type='submit'>+</button>
      </Form>
    </main>
  )
}
