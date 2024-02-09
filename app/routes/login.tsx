import { json } from 'react-router'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { supabase } from '~/api/supabase.server'
import { cookie } from '~/auth/cookie'

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const email = String(form.get('email'))
  const password = String(form.get('password'))

  await supabase.auth.signOut()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!data || error) {
    return json({ ok: false, error }, { status: 400 })
  }

  const headers = {
    headers: {
      'Set-Cookie': await cookie.serialize(data.session.access_token, {
        expires: new Date(data.session.expires_at!),
        maxAge: data.session.expires_in,
      }),
    },
  }
  return redirect('/home', headers)
}

export default function Login() {
  // const actionData = useActionData<typeof action>()

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
        {/* {!actionData?.ok && actionData?.error && `${actionData?.error.message}`} */}
      </Form>
    </div>
  )
}
