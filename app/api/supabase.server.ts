import { AppLoadContext } from '@remix-run/cloudflare'
import { createServerClient } from '@supabase/auth-helpers-remix'

export const createSupabaseServerClient = ({
  context,
  request,
  response,
}: {
  context: AppLoadContext
  request: Request
  response: Response
}) => {
  return createServerClient(String(context.SUPABASE_URL)!, String(context.SUPABASE_PUBLIC_KEY)!, {
    request,
    response,
  })
}

export const getSupabaseClient = (request: Request, context: AppLoadContext) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response, context })

  return { supabase, response }
}
