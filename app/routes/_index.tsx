import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, redirect } from '@remix-run/react'
import { cookie } from '~/auth/cookie'

export const meta: MetaFunction = () => {
  return [{ title: 'Today' }, { name: 'description', content: 'List of things you have to do, today 😊' }]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = await cookie.parse(request.headers.get('Cookie'))

  if (auth && new URL(request.url).pathname === '/') {
    throw redirect('/home')
  }

  return null
}

export default function Index() {
  return (
    <main>
      <Link to='/login'>login</Link>
      <p>Test project with remix & supabase for auth</p>
    </main>
  )
}
