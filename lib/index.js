/**
 * Host half. The snapshot route only reads. The action route runs an
 * allowlisted TeamAI or git command and returns a short result.
 */
import { ACTION_PATH, runAction } from './actions.js'
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

export async function handleAction(req, res, deps = {}) {
  if (!isLoopback(req)) {
    send(res, 403, { ok: false, code: 'forbidden' })
    return
  }
  if (req.method !== 'POST') {
    send(res, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  let body
  try {
    body = await readJson(req)
  } catch (error) {
    send(res, error.code === 'too-large' ? 413 : 400, { ok: false, code: error.code === 'too-large' ? 'too-large' : 'invalid' })
    return
  }
  try {
    const requested = body && typeof body.workspace === 'string' && /^[a-f0-9]{12}$/.test(body.workspace)
      ? body.workspace
      : undefined
    const result = await runAction(body, {
      ...(deps.actionOptions || {}),
      ...(requested ? { workspaceId: requested } : {}),
    })
    send(res, result.ok ? 200 : 400, result)
  } catch {
    send(res, 500, { ok: false, code: 'action-failed' })
  }
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 64 * 1024) {
      const error = new Error('too-large')
      error.code = 'too-large'
      throw error
    }
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (size === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch (error) {
    error.code = 'invalid'
    throw error
  }
}

export function apply(ctx) {
  const routes = [
    {
      kind: 'exact',
      path: ROUTE_PATH,
      handler: (req, res) => {
        handleSnapshot(req, res).catch(() => {
          if (!res.headersSent) send(res, 500, { ok: false, code: 'snapshot-failed' })
        })
      },
    },
    {
      kind: 'exact',
      path: ACTION_PATH,
      handler: (req, res) => {
        handleAction(req, res).catch(() => {
          if (!res.headersSent) send(res, 500, { ok: false, code: 'action-failed' })
        })
      },
    },
  ]
  const register = (server) => {
    if (!server || typeof server.register !== 'function') return
    const disposers = routes.map((route) => server.register(route))
    return () => {
      for (const dispose of disposers) {
        try {
          if (typeof dispose === 'function') dispose()
        } catch {
          // Unregister is best-effort.
        }
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
