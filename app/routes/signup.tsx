import { json } from 'react-router'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'
import { Form, Link, useActionData } from '@remix-run/react'

import { getSupabaseClient } from '~/api/supabase.server'
import { redirectIfLoggedIn } from '~/utils/auth'

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { supabase, response } = getSupabaseClient(request, context)

  const form = await request.formData()
  const email = String(form.get('email'))
  const password = String(form.get('password'))
  const confirmPassword = String(form.get('confirmPassword'))

  if (password !== confirmPassword) {
    return json({ ok: false, error: { message: `Passwords don't match` } }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (!data || error) {
    return json({ ok: false, error }, { status: 400 })
  }

  return redirect('/home', { headers: response.headers })
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseClient(request, context)
  const shouldRedirect = await redirectIfLoggedIn(supabase)

  return shouldRedirect
}

export default function Login() {
  const actionData = useActionData<typeof action>()

  return (
    <div className='max-w-md w-full h-fit mx-auto fixed inset-0 m-auto px-4'>
      <div className='mb-6'>
        <h2 className='font-bold text-2xl mb-2'>Welcome 🌾</h2>
        <p className='text-sm italic'>
          A confirmation email will be sent to your address so you can verify your account before logging in.
        </p>
      </div>
      <Form method='post'>
        <div className='mb-4'>
          <label htmlFor='email' className='block font-medium mb-1'>
            Email
          </label>
          <input
            name='email'
            type='email'
            placeholder='kermit@muppets.com'
            required
            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='password' className='block font-medium mb-1'>
            Password
          </label>
          <input
            name='password'
            type='password'
            required
            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
          />
        </div>
        <div>
          <label htmlFor='confirmPassword' className='block font-medium mb-1'>
            Confirm password
          </label>
          <input
            name='confirmPassword'
            type='password'
            required
            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
          />
        </div>
        <div className='min-h-2 my-2'>
          {!actionData?.ok && actionData?.error ? (
            <span className='text-red-600'>{`${actionData?.error.message}`}</span>
          ) : (
            <>&nbsp;</>
          )}
        </div>
        <div className='mt-6'>
          <button
            type='submit'
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center'
          >
            Sign up
          </button>
          <span className='mx-2'>or</span>
          <Link to='/login' className='font-medium text-blue-700 hover:underline'>
            login
          </Link>
        </div>
      </Form>
    </div>
  )
}
