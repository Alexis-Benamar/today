import { redirect } from '@remix-run/node'

import { supabase } from '~/api/supabase.server'
import { cookie } from '~/auth/cookie'

export const loader = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await cookie.serialize(null, {
        expires: new Date(0),
      }),
    },
  })
}
