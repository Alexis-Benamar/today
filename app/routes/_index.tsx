import type { LoaderFunctionArgs } from '@remix-run/node'
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
      <p className='mb-6'>Test project with remix & supabase for auth</p>
      <Link
        to='/login'
        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 inline-flex items-center'
      >
        Sign in
      </Link>
    </>
  )
}
