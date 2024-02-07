import { ActionFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useLoaderData, useOutletContext, useSubmit } from '@remix-run/react'
import { ChangeEvent, FormEvent, useRef } from 'react'
import { LoaderFunctionArgs } from 'react-router'
import { createSupabaseServerClient } from '~/api/supabase.server'
import { OutletContext } from '~/utils/types'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) throw redirect('/login')

  const { data: todos, error } = await supabase.from('todos').select('*')
  if (error) {
    return json({ ok: false, todos: null, error }, { headers: response.headers, status: 500 })
  }

  return json({ ok: true, todos, error: null }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) {
    return json({ ok: false, error: userError }, { headers: response.headers, status: 400 })
  }

  const form = await request.formData()
  const text = String(form.get('text'))

  const { data: createdTodo, error: createError } = await supabase.from('todos').insert({
    text,
    user_id: user?.id,
  })
  if (createError) {
    return json({ ok: false, createdTodo: null, error: createError })
  }

  return json({
    ok: true,
    createdTodo,
    error: null,
  })
}

export default function Home() {
  const { supabase } = useOutletContext<OutletContext>()
  const { todos } = useLoaderData<typeof loader>()
  const submit = useSubmit()

  const inputRef = useRef<HTMLInputElement>(null)

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const handleOnChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    console.log(id)
    // TODO: submit with intent, check intent in action
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

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
      <h1>TODAY</h1>
      <p>the quick brown fox</p>
      <button onClick={signOut}>sign out</button>
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
      <Form method='post' onSubmit={handleSubmit}>
        <input placeholder='add todo...' name='text' ref={inputRef} required />
        <button type='submit'>+</button>
      </Form>
    </main>
  )
}
