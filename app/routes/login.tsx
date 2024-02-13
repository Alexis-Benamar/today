import { json } from 'react-router'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const form = await request.formData()
  const email = String(form.get('email'))
  const password = String(form.get('password'))

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!data || error) {
    return json({ ok: false, error }, { status: 400 })
  }

  return redirect('/home', { headers: response.headers })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return redirect('/home')
  }

  return null
}

export default function Login() {
  const actionData = useActionData<typeof action>()

  return (
    <div>
      <h1>Login</h1>
      <Form method='post'>
        <div>
          <label htmlFor='email'>email</label>
          <input name='email' type='email' required />
        </div>
        <div>
          <label htmlFor='password'>password</label>
          <input name='password' type='password' required />
        </div>
        <button type='submit'>login</button>
        {!actionData?.ok && actionData?.error && `${actionData?.error.message}`}
      </Form>
    </div>
  )
}
