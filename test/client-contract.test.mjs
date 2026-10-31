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
  assert.equal(sidebar.meta.label, 'Teamai资源中心')
  const icon = sidebar.component({ size: 20 })
  assert.equal(icon.type, 'svg')
  assert.equal(icon.props.width, 20)
  assert.equal(icon.props.height, 20)
})

function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('\n')
  if (typeof node.type === 'function') return textOf(node.type(node.props || {}))
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
  assert.equal(ready.includes('owner/repo 或 https://github.com/owner/repo'), true)
  assert.equal(ready.includes('安装 TeamAI'), false)

  const configured = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: { id: 'abc', scope: 'user', label: '用户', rows: [], inventory: {} },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
  })
  assert.equal(configured.includes('仓库已经初始化'), true)
  assert.equal(configured.includes('GitHub 地址'), true)
  assert.equal(configured.includes('安装 TeamAI'), false)
  assert.equal(configured.includes('修改配置'), true)
  assert.equal(configured.includes('+ 关联新仓库'), false)

  const configEditing = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: { id: 'abc', scope: 'user', label: '用户', rows: [], inventory: {} },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    27: true,
  })
  assert.equal(configEditing.includes('当前角色 (Role)'), true)
  assert.equal(configEditing.includes('删除该配置'), true)

  const skillRows = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [{
          name: 'demo',
          inTeamRepo: true,
          visible: true,
          excluded: false,
          description: '说明',
          repoCopies: ['skills/demo'],
          dshCount: 0,
        }],
        inventory: {},
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'skills',
  })
  assert.equal(skillRows.includes('安装到本机'), true)
  assert.equal(skillRows.includes('排除'), true)
  assert.equal(skillRows.includes('使用记录'), false)
  assert.equal(skillRows.includes('推送全部本地技能'), false)
  // Repo tab does not have push button
  assert.equal(skillRows.includes('推送'), false)

  const catalogRows = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [{
          name: 'demo',
          inTeamRepo: true,
          visible: true,
          excluded: false,
          description: '说明',
          repoCopies: ['skills/demo'],
          dshCount: 0,
        }],
        inventory: {},
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'skills',
    6: 'catalog',
  })
  assert.equal(catalogRows.includes('推送'), true)

  const prompts = renderPage({ 7: 'prompts' })
  assert.equal(prompts.includes('团队提示词'), true)
  assert.equal(prompts.includes('概览'), false)
  assert.equal(prompts.includes('安装 TeamAI'), false)

  const mcp = renderPage({ 7: 'mcp' })
  assert.equal(mcp.includes('团队 MCP'), true)
  assert.equal(mcp.includes('DeepSeek Harness 不加载它们'), true)
  assert.equal(mcp.includes('从其他代理移除'), true)
  assert.equal(mcp.includes('同一仓库里的其他资源'), false)
  assert.equal(mcp.includes('概览'), false)
  assert.equal(mcp.includes('安装 TeamAI'), false)

  const other = renderPage({ 7: 'other' })
  assert.equal(other.includes('同一仓库里的其他资源'), true)
  assert.equal(other.includes('团队其他资源'), true)
  assert.equal(other.includes('规则'), true)
  assert.equal(other.includes('文档'), true)
  assert.equal(other.includes('概览'), false)
  assert.equal(other.includes('安装 TeamAI'), false)

  const populatedPrompts = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [],
        inventory: {
          prompts: [{ name: 'review.md', detail: '评审' }],
        },
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'prompts',
  })
  assert.equal(populatedPrompts.includes('推送全部提示词'), false)
  // Repo prompts do not have push button
  assert.equal(populatedPrompts.includes('推送'), false)
  assert.equal(populatedPrompts.includes('编辑'), true)
  assert.equal(populatedPrompts.includes('从仓库删除'), true)

  const catalogPrompts = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [],
        inventory: {
          prompts: [],
          localPrompts: [{ name: 'local-review.md', detail: '本地评审' }],
        },
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'prompts',
    6: 'catalog',
  })
  assert.equal(catalogPrompts.includes('推送'), true)

  const promptModal = renderPage({ 7: 'prompts', 32: true })
  assert.equal(promptModal.includes('新建提示词'), true)
  assert.equal(promptModal.includes('保存并推送'), true)

  const populatedMcp = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [],
        inventory: {
          mcp: [{ name: 'docs', detail: 'stdio' }],
        },
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'mcp',
  })
  assert.equal(populatedMcp.includes('推送全部 MCP'), false)
  // Repo MCP does not have push button
  assert.equal(populatedMcp.includes('推送'), false)
  assert.equal(populatedMcp.includes('从仓库删除'), true)

  const catalogMcp = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        label: '用户',
        rows: [],
        inventory: {
          mcp: [],
          localMcp: [{ name: 'local-docs', detail: 'stdio' }],
        },
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'mcp',
    6: 'catalog',
  })
  assert.equal(catalogMcp.includes('推送'), true)

  const mcpModal = renderPage({ 7: 'mcp', 33: true })
  assert.equal(mcpModal.includes('配置新 MCP 服务器'), true)
  assert.equal(mcpModal.includes('保存并推送'), true)

  const statsPage = renderPage({
    1: {
      ok: true,
      cli: { installed: true, version: '0.28.1' },
      selected: {
        id: 'abc',
        scope: 'user',
        isAdmin: true,
        label: '用户',
        rows: [{
          name: 'backend-test',
          inTeamRepo: true,
          visible: true,
          dshCount: 5,
          otherCount: 2,
        }],
        inventory: {
          members: [{ name: 'jarod', role: 'architect', projects: ['proj-core'] }],
        },
      },
      workspaces: [],
      warnings: [],
      dsh: [],
    },
    7: 'stats',
  })
  assert.equal(statsPage.includes('团队技能与贡献统计'), true)
  assert.equal(statsPage.includes('技能调用排行'), true)
  assert.equal(statsPage.includes('团队成员与角色'), true)
  assert.equal(statsPage.includes('jarod'), true)
  assert.equal(statsPage.includes('architect'), true)
  assert.equal(statsPage.includes('backend-test'), true)
})
