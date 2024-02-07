import { useEffect, useState } from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react'
import { createBrowserClient } from '@supabase/auth-helpers-remix'

import { createSupabaseServerClient } from '~/api/supabase.server'

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
  }

  const response = new Response()

  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return json({ env, session }, { headers: response.headers })
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()

  const [supabase] = useState(() => createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_PUBLIC_KEY!))

  const serverAccessToken = session?.access_token

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        revalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, serverAccessToken, revalidate])

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase, session }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
