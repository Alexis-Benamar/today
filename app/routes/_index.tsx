import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, json, redirect } from '@remix-run/react'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Today' }, { name: 'description', content: 'List of things you have to do, today 😊' }]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

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
    <main>
      <Link to='/login'>login</Link>
      <p>Test project with remix & supabase for auth</p>
    </main>
  )
}
