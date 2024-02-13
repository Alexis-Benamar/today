import { LoaderFunctionArgs, redirect } from '@remix-run/node'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }

  return redirect('/')
}
