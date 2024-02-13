import { ActionFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useLoaderData, useSubmit, useOutletContext } from '@remix-run/react'
import { ChangeEvent, FormEvent, useRef } from 'react'
import { LoaderFunctionArgs } from 'react-router'

import { createSupabaseServerClient } from '~/api/supabase.server'
import { OutletContext } from '~/root'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/login')
  }

  const { data: todos, error } = await supabase.from('todos').select('*')
  if (error) {
    return json({ ok: false, todos: null, error }, { status: 500, headers: response.headers })
  }

  return json({ ok: true, todos, error: null }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  // TODO: move to auth file
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return redirect('/login')
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
  const { supabaseClient } = useOutletContext<OutletContext>()
  const { todos } = useLoaderData<typeof loader>()
  const inputRef = useRef<HTMLInputElement>(null)
  const submit = useSubmit()

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
  }

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
      <button type='button' onClick={handleLogout}>
        logout
      </button>
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
