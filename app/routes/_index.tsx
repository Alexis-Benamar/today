import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { redirect, useOutletContext } from '@remix-run/react'
import { createSupabaseServerClient } from '~/utils/supabase.server'
import { OutletContext } from '~/utils/types'

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
  const { supabase, session } = useOutletContext<OutletContext>()

  const signIn = async (email: string, password: string) => {
    try {
      await supabase.auth.signInWithPassword({ email, password })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main>
      <h1>TODAY</h1>
      <p>the quick brown fox</p>
      <button onClick={() => signIn('', '')}>sign in</button>
      <button onClick={signOut}>sign out</button>
      {session?.user && <p>user is authenticated</p>}
    </main>
  )
}
