import { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, json, useFetchers, useLoaderData, useSubmit } from '@remix-run/react'
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef } from 'react'
import { LoaderFunctionArgs } from 'react-router'

import { getSupabaseClient } from '~/api/supabase.server'
import { requireAuth } from '~/utils/auth'
import { getRandomPlaceholder } from '~/utils/form'
import { Todo } from '~/utils/types'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { supabase, response } = getSupabaseClient(request, context)
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

export const action = async ({ request: request, context }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseClient(request, context)
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

    const { error: checkError } = await supabase.from('todos').update({ done }).match({ id, user_id: userId })
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

function usePendingTodos() {
  return useFetchers()
    .filter(fetcher => {
      if (!fetcher.formData) return

      return ['create', 'check', 'delete'].includes(String(fetcher.formData.get('intent')) ?? '')
    })
    .map(fetcher => {
      const intent = String(fetcher.formData?.get('intent'))
      const id = String(fetcher.formData?.get('id'))
      const text = String(fetcher.formData?.get('text'))
      const done = !!Number(fetcher.formData?.get('done'))
      const isCreating = intent === 'create'
      const isDeleting = intent === 'delete'

      return {
        id,
        text,
        done,
        isCreating,
        isDeleting,
      }
    })
}

export default function Home() {
  const placeholderRef = useRef(getRandomPlaceholder())
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const submit = useSubmit()

  const { todos } = useLoaderData<typeof loader>()
  const pendingTodos = usePendingTodos()

  if (todos) {
    for (const todo of pendingTodos) {
      const matchingTodoIndex = todos?.findIndex(t => t.id === todo.id)
      if (matchingTodoIndex === -1) {
        todos?.push(todo)
      } else {
        const currentTodo = todos?.[matchingTodoIndex]
        todos[matchingTodoIndex] = { ...currentTodo, ...todo }
      }
    }
  }

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }

  const handleDelete = (todo: Todo, event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()

    submit({ ...todo, done: Number(todo.done), intent: 'delete' }, { method: 'delete', navigate: false })
  }

  const handleOnChange = (todo: Todo, event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    submit({ ...todo, done: Number(!todo.done), intent: 'check' }, { method: 'patch', navigate: false })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    formData.append('intent', 'create')
    formData.append('id', window.crypto.randomUUID())

    submit(formData, {
      method: 'post',
      navigate: false,
      unstable_flushSync: true,
    })

    if (inputRef.current) {
      inputRef.current.value = ''
      scrollToBottom()
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  return (
    <>
      <div
        role='list'
        ref={listRef}
        className='overflow-y-auto scroll-smooth'
        style={{ maxHeight: 'calc(100svh - 80px - 50px - 2rem)' }}
      >
        {!todos?.length ? <p className='text-center my-20 w-full'>No todos 🙌</p> : null}
        {todos?.map(todo => (
          <div
            key={todo.id}
            className={`flex w-full mb-1 last:mb-0 items-center border-2 border-transparent transition-all ease-in-out duration-150 hover:border-blue-700 ${todo.isDeleting ? 'opacity-20 pointer-events-none' : ''}`}
          >
            <input
              type='checkbox'
              checked={todo.done}
              name={`todo-${todo.id}`}
              onChange={e => handleOnChange(todo, e)}
              className='w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 m-2 cursor-pointer shrink-0'
            />
            <label htmlFor={`todo-${todo.id}`} className={`text-lg mx-2 ${todo.done ? 'opacity-30 line-through' : ''}`}>
              {todo.text}
            </label>
            {!todo.isCreating ? (
              <button onClick={e => handleDelete(todo, e)} className='ms-auto p-2'>
                🗑️
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <Form method='post' onSubmit={handleSubmit} className='relative mt-4 mb-4'>
        <input
          autoComplete='off'
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          placeholder={placeholderRef.current}
          name='text'
          ref={inputRef}
          required
          className='bg-gray-50 border border-gray-300 text-xl text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-16'
        />
        <button
          type='submit'
          className='absolute top-0 end-0 px-2.5 w-12 font-medium text-3xl leading-10 h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 '
        >
          +
        </button>
      </Form>
    </>
  )
}
