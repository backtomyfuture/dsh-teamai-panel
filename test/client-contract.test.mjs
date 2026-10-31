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
  assert.match(clientSource, /同一个插件/)
  assert.match(clientSource, /DeepSeek Harness 不加载它们/)
  assert.match(clientSource, /\/teamai-panel\/snapshot/)
  assert.match(clientSource, /\/teamai-panel\/action/)
  assert.match(clientSource, /空骨架/)
  assert.match(clientSource, /提示词/)
  assert.equal(clientSource.includes('window.confirm'), false)
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

function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('\n')
  const props = node.props || {}
  return [props.placeholder, props['aria-label'], textOf(node.children)].filter(Boolean).join('\n')
}

function renderPage(seed) {
  const sandbox = {
    console,
    window: { __ModuleLoader__: { load(spec) { sandbox.loaded = spec } } },
  }
  runInContext(clientSource, createContext(sandbox), { filename: 'client.js' })
  let useStateCalls = 0
  const plugin = sandbox.loaded.factory((id) => {
    if (id !== 'react') throw new Error('unexpected module ' + id)
    return {
      Fragment: 'fragment',
      createElement(type, props, ...children) {
        return { type, props, children }
      },
      useState(initial) {
        const index = useStateCalls
        useStateCalls += 1
        const value = seed && Object.prototype.hasOwnProperty.call(seed, index) ? seed[index] : initial
        return [value, () => {}]
      },
      useEffect() {},
    }
  })
  let page
  plugin.apply({
    slots: {
      inject(_name, register) { register() },
      register(meta, component) {
        if (meta.name === 'main') page = component
        return () => {}
      },
    },
  })
  return textOf(page())
}

test('the skills page offers setup and the other tabs keep their own copy', () => {
  const fresh = renderPage()
  assert.equal(fresh.includes('安装 TeamAI'), true)
  assert.equal(fresh.includes('这份 DSH 能收到什么'), true)
  assert.equal(fresh.includes('开始'), true)
  assert.equal(fresh.indexOf('开始') < fresh.indexOf('技能 '), true)
  assert.equal(fresh.includes('概览'), false)
  assert.equal(fresh.includes('筛选技能'), false)
  assert.equal(fresh.includes('空骨架'), false)
  assert.equal(fresh.includes('团队 MCP'), false)

  const skills = renderPage({ 7: 'skills' })
  assert.equal(skills.includes('概览'), true)
  assert.equal(skills.includes('团队技能'), true)
  assert.equal(skills.includes('筛选技能'), true)
  assert.equal(skills.includes('这份 DSH 能收到什么'), false)
  assert.equal(skills.includes('安装 TeamAI'), false)

  const ready = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: null,
      workspaces: [],
      warnings: [],
      dsh: [],
    },
  })
  assert.equal(ready.includes('空骨架'), true)
  assert.equal(ready.includes('初始化'), true)
  assert.equal(ready.includes('安装 TeamAI'), false)

  const prompts = renderPage({ 7: 'prompts' })
  assert.equal(prompts.includes('团队提示词'), true)
  assert.equal(prompts.includes('保存并推送'), true)
  assert.equal(prompts.includes('概览'), false)
  assert.equal(prompts.includes('安装 TeamAI'), false)

  const mcp = renderPage({ 7: 'mcp' })
  assert.equal(mcp.includes('团队 MCP'), true)
  assert.equal(mcp.includes('DeepSeek Harness 不加载它们'), true)
  assert.equal(mcp.includes('从其他代理移除'), true)
  assert.equal(mcp.includes('概览'), false)
  assert.equal(mcp.includes('安装 TeamAI'), false)
})
