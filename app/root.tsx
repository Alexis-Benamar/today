import { useEffect, useState } from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
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
import { Session, SupabaseClient, createBrowserClient } from '@supabase/auth-helpers-remix'

import { getSupabaseClient } from '~/api/supabase.server'

import styles from '../tailwind.css'

export type OutletContext = {
  session: Session
  supabaseClient: SupabaseClient
}

export const meta: MetaFunction = () => {
  return [
    { title: 'today' },
    { property: 'og:title', content: 'today' },
    { property: 'og:description', content: 'helping you keeping track of things 𓆉' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://today.cacti.ovh' },
    { name: 'description', content: 'helping you keeping track of things 𓆉' },
  ]
}

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: styles },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY!,
  }

  const { supabase, response } = getSupabaseClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return json({ env, session }, { headers: response.headers })
}

export default function App() {
  const { env, session: loaderSession } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()
  const [supabaseClient] = useState(() => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY))

  const serverAccessToken = loaderSession?.access_token

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION' && session?.access_token !== serverAccessToken) {
        revalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverAccessToken, supabaseClient, revalidate])

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='manifest' href='manifest.json' />
        <Meta />
        <Links />
      </head>
      <body>
        <main className='max-w-2xl mx-auto px-4'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold text-4xl mt-4 my-6 pointer-events-none'>TODAY ☀️</h1>
            {loaderSession ? (
              <button
                onClick={async () => {
                  await supabaseClient.auth.signOut()
                }}
                className='p-4'
              >
                Sign out
              </button>
            ) : null}
          </div>
          <Outlet context={{ session: loaderSession, supabaseClient }} />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
