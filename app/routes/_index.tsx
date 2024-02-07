import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Outlet, redirect } from '@remix-run/react'
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

  if (!session) {
    throw redirect('/login')
  }

  return null
}

export default function Index() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
