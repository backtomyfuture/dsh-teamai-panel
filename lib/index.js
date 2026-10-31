/**
 * Host half. One loopback GET route serves the skill snapshot. The browser
 * half renders it. This file does not write TeamAI state.
 */
import { createSnapshot, ROUTE_PATH } from './snapshot.js'

export const name = 'dsh-teamai-panel'
export const inject = ['webServer']
export { createSnapshot, ROUTE_PATH }

function isLoopback(req) {
  const addr = req.socket && req.socket.remoteAddress
  if (addr !== '127.0.0.1' && addr !== '::1' && addr !== '::ffff:127.0.0.1') return false
  const host = req.headers && req.headers.host
  if (typeof host !== 'string') return false
  let parsed
  try {
    parsed = new URL(`http://${host}`)
  } catch {
    return false
  }
  // Node's URL.hostname has reported both "::1" and "[::1]". Accept either.
  const hostname = parsed.hostname
  if (hostname !== '127.0.0.1' && hostname !== 'localhost' && hostname !== '::1' && hostname !== '[::1]') return false
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === parsed.host
  } catch {
    return false
  }
}

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

export async function handleSnapshot(req, res, deps = {}) {
  if (!isLoopback(req)) {
    send(res, 403, { ok: false, code: 'forbidden' })
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  let workspaceId
  try {
    const url = new URL(req.url ?? ROUTE_PATH, 'http://127.0.0.1')
    const raw = url.searchParams.get('workspace')
    workspaceId = raw && /^[a-f0-9]{12}$/.test(raw) ? raw : undefined
  } catch {
    workspaceId = undefined
  }
  try {
    const snapshot = await createSnapshot({
      env: process.env,
      ...(deps.snapshotOptions || {}),
      ...(workspaceId ? { workspaceId } : {}),
    })
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end()
      return
    }
    send(res, 200, snapshot)
  } catch {
    send(res, 500, { ok: false, code: 'snapshot-failed' })
  }
}

function warn(ctx, err) {
  const logger = ctx && ctx.logger
  const sink = (logger && (logger.warn || logger.info)) || console.warn
  try {
    sink.call(logger || console, `[dsh-teamai-panel] ${err instanceof Error ? err.message : String(err)}`)
  } catch {
    // A log failure must not stop the host.
  }
}

export function apply(ctx) {
  const route = {
    kind: 'exact',
    path: ROUTE_PATH,
    handler: (req, res) => {
      handleSnapshot(req, res).catch(() => {
        if (!res.headersSent) send(res, 500, { ok: false, code: 'snapshot-failed' })
      })
    },
  }
  const register = (server) => {
    if (!server || typeof server.register !== 'function') return
    const dispose = server.register(route)
    return () => {
      try {
        if (typeof dispose === 'function') dispose()
      } catch {
        // Unregister is best-effort.
      }
    }
  }
  try {
    if (ctx && ctx.webServer && typeof ctx.effect === 'function') {
      ctx.effect(() => register(ctx.webServer), 'dsh-teamai-panel: snapshot route')
      return
    }
  } catch (err) {
    warn(ctx, err)
  }
  if (ctx && typeof ctx.inject === 'function') {
    try {
      ctx.inject(['webServer'], (ready) => {
        try {
          return register(ready && ready.webServer)
        } catch (err) {
          warn(ctx, err)
          return undefined
        }
      })
    } catch (err) {
      warn(ctx, err)
    }
  }
}
