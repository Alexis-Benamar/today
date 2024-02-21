import { redirect } from '@netlify/remix-runtime'
import { SupabaseClient } from '@supabase/supabase-js'

export const redirectIfLoggedIn = async (supabaseClient: SupabaseClient) => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()

  console.log('session', session)

  if (session) {
    console.log('should redirect')
    return redirect('/home')
  }

  return null
}

export const requireAuth = async (supabaseClient: SupabaseClient) => {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession()

  if (!session || error) {
    throw redirect('/login')
  }

  return session
}
