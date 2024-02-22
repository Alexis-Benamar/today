import { config } from '@netlify/remix-edge-adapter'

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ...config,
  // This works out of the box with the Netlify adapter, but you can
  // add your own custom config here if you want to.
  //
  // See https://remix.run/file-conventions/remix-config
  serverModuleFormat: "cjs",
  serverNodeBuiltinsPolyfill: {
    modules: {
      tls: true,
      stream: true,
      crypto: true,
      url: true,
      net: true,
      http: true,
      https: true,
      events: true,
      zlib: true,
    }
  }
}
