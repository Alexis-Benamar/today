import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'

import { getSupabaseClient } from '~/api/supabase.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseClient(request, context)

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }

  return redirect('/')
}
