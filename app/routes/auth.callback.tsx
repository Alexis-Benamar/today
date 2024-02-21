import { LoaderFunctionArgs, redirect } from '@netlify/remix-runtime'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabaseClient = createSupabaseServerClient({ request, response })
    await supabaseClient.auth.exchangeCodeForSession(code)
  }

  return redirect('/', {
    headers: response.headers,
  })
}
