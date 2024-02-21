import { LoaderFunctionArgs, redirect } from '@netlify/remix-runtime'

import { getSupabaseClient } from '~/api/supabase.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseClient(request)

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }

  return redirect('/')
}
