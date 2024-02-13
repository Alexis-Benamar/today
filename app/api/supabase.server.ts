import { createServerClient } from '@supabase/auth-helpers-remix'

export const createSupabaseServerClient = ({ request, response }: { request: Request; response: Response }) => {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLIC_KEY!, {
    request,
    response,
  })
}

export const getSupabaseClient = (request: Request) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  return { supabase, response }
}
