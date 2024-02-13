import { redirect } from '@remix-run/node'
import { SupabaseClient } from '@supabase/supabase-js'

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
