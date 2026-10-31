import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { apply, handleAction, handleSnapshot } from '../lib/index.js'

function response() {
  return {
    headersSent: false,
    status: 0,
    body: '',
    headers: null,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
      this.headersSent = true
    },
    end(body) {
      this.body = body || ''
    },
  }
}

function request(overrides) {
  return {
    method: 'GET',
    url: '/teamai-panel/snapshot',
    headers: { host: '127.0.0.1:3080' },
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  }
}

test('remote addresses and foreign hosts are rejected', async () => {
  const remote = response()
  await handleSnapshot(request({ socket: { remoteAddress: '8.8.8.8' } }), remote)
  assert.equal(remote.status, 403)

  const host = response()
  await handleSnapshot(request({ headers: { host: 'evil.example' } }), host)
  assert.equal(host.status, 403)

  const crossSite = response()
  await handleSnapshot(request({ headers: { host: '127.0.0.1:3080', 'sec-fetch-site': 'cross-site' } }), crossSite)
  assert.equal(crossSite.status, 403)

  const origin = response()
  await handleSnapshot(request({ headers: { host: '127.0.0.1:3080', origin: 'http://evil.example' } }), origin)
  assert.equal(origin.status, 403)
})

test('only GET and HEAD are served', async () => {
  const posted = response()
  await handleSnapshot(request({ method: 'POST' }), posted)
  assert.equal(posted.status, 405)
})

test('loopback GET returns the snapshot and HEAD has no body', async () => {
  const home = await mkdtemp(path.join(tmpdir(), 'teamai-panel-http-'))
  try {
    await mkdir(path.join(home, '.teamai'), { recursive: true })
    await writeFile(path.join(home, '.teamai', 'config.yaml'), [
      'username: ada',
      'scope: user',
      'repo:',
      '  localPath: ~/team-repo',
      '  kind: git',
      '',
    ].join('\n'))
    const options = { home, cwd: home, dshHome: path.join(home, '.dsh'), env: {} }

    const got = response()
    await handleSnapshot(request({
      headers: { host: 'localhost:3080', origin: 'http://localhost:3080' },
    }), got, { snapshotOptions: options })
    assert.equal(got.status, 200)
    const body = JSON.parse(got.body)
    assert.equal(body.ok, true)
    assert.equal(body.selected.username, 'ada')
    assert.equal(JSON.stringify(body).includes(home), false)

    const head = response()
    await handleSnapshot(request({ method: 'HEAD' }), head, { snapshotOptions: options })
    assert.equal(head.status, 200)
    assert.equal(head.body, '')

    const ipv6 = response()
    await handleSnapshot(request({
      headers: { host: '[::1]:3080' },
      socket: { remoteAddress: '::1' },
    }), ipv6, { snapshotOptions: options })
    assert.equal(ipv6.status, 200)
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})

function actionRequest(body, overrides = {}) {
  const payload = typeof body === 'string' ? Buffer.from(body) : Buffer.from(JSON.stringify(body))
  const chunks = overrides.chunks || [payload]
  return {
    method: 'POST',
    url: '/teamai-panel/action',
    headers: { host: '127.0.0.1:3080' },
    socket: { remoteAddress: '127.0.0.1' },
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk
    },
    ...overrides,
    chunks: undefined,
  }
}

test('action route rejects remote clients, other methods, bad JSON, and a missing confirmation', async () => {
  const remote = response()
  await handleAction(actionRequest({ action: 'pull', confirm: 'pull' }, {
    socket: { remoteAddress: '8.8.8.8' },
  }), remote)
  assert.equal(remote.status, 403)

  const got = response()
  await handleAction(actionRequest({}, { method: 'GET' }), got)
  assert.equal(got.status, 405)

  const broken = response()
  await handleAction(actionRequest('{'), broken)
  assert.equal(broken.status, 400)
  assert.equal(JSON.parse(broken.body).code, 'invalid')

  const unconfirmed = response()
  await handleAction(actionRequest({ action: 'pull' }), unconfirmed)
  assert.equal(unconfirmed.status, 400)
  assert.equal(JSON.parse(unconfirmed.body).code, 'confirm')

  const huge = response()
  await handleAction(actionRequest({}, {
    chunks: [Buffer.alloc(60 * 1024, 0x61), Buffer.alloc(20 * 1024, 0x62)],
  }), huge)
  assert.equal(huge.status, 413)
  assert.equal(JSON.parse(huge.body).code, 'too-large')
})

test('apply registers the snapshot and action routes', () => {
  const immediate = []
  apply({
    webServer: { register(route) { immediate.push(route); return () => {} } },
    effect(run) { run() },
  })
  assert.equal(immediate.every((route) => route.kind === 'exact'), true)
  assert.deepEqual(immediate.map((route) => route.path).sort(), [
    '/teamai-panel/action',
    '/teamai-panel/snapshot',
  ])

  const late = []
  apply({
    inject(names, ready) {
      assert.deepEqual(names, ['webServer'])
      ready({ webServer: { register(route) { late.push(route); return () => {} } } })
    },
  })
  assert.deepEqual(late.map((route) => route.path).sort(), [
    '/teamai-panel/action',
    '/teamai-panel/snapshot',
  ])
})
