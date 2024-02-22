import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response()
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabaseClient = createSupabaseServerClient({ request, response, context })
    await supabaseClient.auth.exchangeCodeForSession(code)
  }

  return redirect('/', {
    headers: response.headers,
  })
}
