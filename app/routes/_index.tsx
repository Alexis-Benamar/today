import type { LoaderFunctionArgs } from '@netlify/remix-runtime'
import { Link, json, redirect } from '@remix-run/react'

import { getSupabaseClient } from '~/api/supabase.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, response } = getSupabaseClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token && new URL(request.url).pathname === '/') {
    throw redirect('/home')
  }

  return json({}, { headers: response.headers })
}

export default function Index() {
  return (
    <>
      <p>A small app that helps you keep track of your tasks for today 🐢</p>
      <p className='mb-6'>
        Built with{' '}
        <a
          className='font-medium text-blue-700 hover:underline'
          href='https://remix.run/'
          target='_blank'
          rel='noreferrer'
        >
          remix
        </a>{' '}
        & hosted on{' '}
        <a
          className='font-medium text-blue-700 hover:underline'
          href='https://www.netlify.com/'
          target='_blank'
          rel='noreferrer'
        >
          netlify
        </a>
      </p>
      <Link
        to='/login'
        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 inline-flex items-center'
      >
        Sign in
      </Link>
      <Link
        to='/signup'
        className='text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 '
      >
        Sign up
      </Link>
    </>
  )
}
