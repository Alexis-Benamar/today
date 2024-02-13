import { ActionFunctionArgs } from '@remix-run/node'
import { Form, json, useLoaderData, useSubmit, useOutletContext } from '@remix-run/react'
import { ChangeEvent, FormEvent, MouseEvent, useRef } from 'react'
import { LoaderFunctionArgs } from 'react-router'

import { getSupabaseClient } from '~/api/supabase.server'
import { OutletContext } from '~/root'
import { requireAuth } from '~/utils/auth'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, response } = getSupabaseClient(request)
  const session = await requireAuth(supabase)

  const userId = session.user.id

  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    return json({ ok: false, todos: null, error }, { status: 500, headers: response.headers })
  }

  return json({ ok: true, todos, error: null }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseClient(request)
  const session = await requireAuth(supabase)

  const userId = session.user.id

  const formData = await request.formData()
  const intent = String(formData.get('intent'))

  if (intent === 'create') {
    const text = String(formData.get('text'))

    const { data: createdTodo, error: createError } = await supabase.from('todos').insert({
      text,
      user_id: userId,
    })
    if (createError) {
      return json({ ok: false, createdTodo: null, error: createError }, { status: 500 })
    }

    return json({
      ok: true,
      createdTodo,
      error: null,
    })
  }

  if (intent === 'check') {
    const id = String(formData.get('id'))
    // Dirty trick to pass boolean as formdata
    const done = !!Number(formData.get('done'))

    const { error: checkError } = await supabase.from('todos').update({ done: !done }).match({ id, user_id: userId })
    if (checkError) {
      return json({ ok: false, error: checkError }, { status: 500 })
    }

    return json({ ok: true })
  }

  if (intent === 'delete') {
    const id = String(formData.get('id'))

    const { error: deleteError } = await supabase.from('todos').delete().match({ id, user_id: userId })
    if (deleteError) {
      return json({ ok: false, error: deleteError }, { status: 500 })
    }

    return json({ ok: true })
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

  const handleDelete = (id: string, event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()

    submit({ id, intent: 'delete' }, { method: 'delete', navigate: false })
  }

  const handleOnChange = (id: string, done: boolean, event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    submit({ id, done: Number(done), intent: 'check' }, { method: 'patch', navigate: false })
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
      {/* TODO: move to layout */}
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
              onChange={e => handleOnChange(todo.id, todo.done, e)}
            />
            <label htmlFor={`todo-${todo.id}`}>{todo.text}</label>
            <button onClick={e => handleDelete(todo.id, e)}>🗑️</button>
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
