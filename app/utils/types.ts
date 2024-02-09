import { Session, SupabaseClient } from '@supabase/supabase-js'

export type OutletContext = {
  supabase: SupabaseClient
  session: Session
}

export type Todo = {
  created_at: string
  done: boolean
  id: string
  text: string
  user_id: string
}
