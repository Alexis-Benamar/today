import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'

interface Env {
  SUPABASE_URL: string
  SUPABASE_PUBLIC_KEY: string
}

type Context = EventContext<Env, string, unknown>

declare module '@remix-run/server-runtime' {
  interface AppLoadContext extends Env {}
}

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context: Context) => ({
    SUPABASE_URL: context.env.SUPABASE_URL,
    SUPABASE_PUBLIC_KEY: context.env.SUPABASE_PUBLIC_KEY,
  }),
})

export function onRequest(context: Context) {
  return handleRequest(context)
}
