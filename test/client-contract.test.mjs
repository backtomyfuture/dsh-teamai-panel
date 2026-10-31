import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createContext, runInContext } from 'node:vm'

const root = new URL('..', import.meta.url)
const clientSource = readFileSync(new URL('lib/client.js', root), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const patch = readFileSync(new URL('cordis.patch.yml', root), 'utf8')

test('the three package names match', () => {
  assert.equal(pkg.name, 'dsh-teamai-panel')
  assert.match(patch, /id: dsh-teamai-panel/)
  assert.match(patch, /name: dsh-teamai-panel/)
  assert.match(clientSource, /id: 'dsh-teamai-panel'/)
  assert.equal(pkg.exports['./client'], './lib/client.js')
  assert.deepEqual(pkg.dsh.client.inject, [
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
  ])
  assert.equal(pkg.dsh.client.inject.includes('slots'), false)
})

test('the client bundle has no top-level import or export', () => {
  assert.equal(/^\s*import\s/m.test(clientSource), false)
  assert.equal(/^\s*export\s/m.test(clientSource), false)
  assert.equal(clientSource.includes('position:fixed'), false)
  assert.equal(clientSource.includes('position: fixed'), false)
  assert.match(clientSource, /\/teamai-panel\/snapshot/)
})

test('apply registers the same panel id on both slots', () => {
  const sandbox = {
    console,
    window: {
      __ModuleLoader__: {
        load(spec) {
          sandbox.loaded = spec
        },
      },
    },
  }
  runInContext(clientSource, createContext(sandbox), { filename: 'client.js' })
  assert.equal(sandbox.loaded.id, pkg.name)

  const required = []
  const plugin = sandbox.loaded.factory((id) => {
    required.push(id)
    if (id !== 'react') throw new Error('unexpected module ' + id)
    return { createElement: (...args) => ({ type: args[0], props: args[1] }) }
  })
  assert.deepEqual(required, ['react'])
  assert.equal(plugin.name, pkg.name)
  assert.equal(plugin.inject.length, 1)
  assert.equal(plugin.inject[0], 'slots')

  const registered = []
  plugin.apply({
    slots: {
      inject(_name, register) {
        const dispose = register()
        assert.equal(typeof dispose, 'function')
      },
      register(meta, component) {
        registered.push({ meta, component })
        return () => {}
      },
    },
  })

  const main = registered.find((item) => item.meta.name === 'main')
  const sidebar = registered.find((item) => item.meta.name === 'sidebar.panellist')
  assert.equal(main.meta.key, 'teamai-skills')
  assert.equal(sidebar.meta.id, 'teamai-skills')
  assert.equal(sidebar.meta.order, 40)
  assert.equal(sidebar.meta.label, '团队技能')
  const icon = sidebar.component({ size: 20 })
  assert.equal(icon.type, 'svg')
  assert.equal(icon.props.width, 20)
  assert.equal(icon.props.height, 20)
})
