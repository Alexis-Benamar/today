import { createServerClient } from '@supabase/auth-helpers-remix'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY

export const supabase = createClient(supabaseUrl!, supabaseKey!)

export const createSupabaseServerClient = ({ request, response }: { request: Request; response: Response }) => {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLIC_KEY!, {
    request,
    response,
  })
}
