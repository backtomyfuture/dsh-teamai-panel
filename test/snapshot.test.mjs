import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createSnapshot } from '../lib/snapshot.js'

const skill = (description, body = 'DO_NOT_LEAK_BODY') => `---\ndescription: ${description}\n---\n${body}\n`

async function writeSkill(file, description) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, skill(description))
}

async function fixture() {
  const home = await mkdtemp(path.join(tmpdir(), 'teamai-panel-'))
  const project = path.join(home, 'work', 'app')
  const repo = path.join(home, 'team-repo')
  await writeSkill(path.join(repo, 'skills', 'review', 'SKILL.md'), 'Review a change.')
  await writeSkill(path.join(repo, 'skills', 'ns', 'nested', 'SKILL.md'), 'Nested skill.')
  await writeSkill(path.join(repo, 'skills', 'secret-skill', 'SKILL.md'), 'Hidden skill.')
  await writeSkill(path.join(repo, 'skills', 'not a skill', 'SKILL.md'), 'Bad name.')
  await writeSkill(path.join(repo, 'skills', 'foo..bar', 'SKILL.md'), 'Traversal-like name.')
  await mkdir(path.join(repo, 'skills', '.hidden', 'SKILL.md').replace(/SKILL\.md$/, ''), { recursive: true })
  await writeFile(path.join(repo, 'skills', '.hidden', 'SKILL.md'), skill('Dot dir.'))

  await writeSkill(path.join(home, '.dsh', 'skills', 'review', 'SKILL.md'), 'User copy.')
  await writeSkill(path.join(home, '.dsh', 'skills', 'user-only', 'SKILL.md'), 'User only.')
  await writeSkill(path.join(home, '.agents', 'skills', 'agents-only', 'SKILL.md'), 'Agents only.')
  await writeSkill(path.join(project, '.dsh', 'skills', 'review', 'SKILL.md'), 'Project copy.')
  await writeSkill(path.join(project, '.agents', 'skills', 'proj-agents', 'SKILL.md'), 'Project agents.')

  const userConfig = [
    'username: ada',
    'scope: user',
    'excludedSkills:',
    '  - secret-skill',
    'repo:',
    '  localPath: ~/team-repo',
    '  remote: https://example.com/team.git',
    '  kind: git',
    '',
  ].join('\n')
  await mkdir(path.join(home, '.teamai'), { recursive: true })
  await writeFile(path.join(home, '.teamai', 'config.yaml'), userConfig)
  await writeFile(path.join(home, '.teamai', 'user-usage.jsonl'), [
    '{"skill":"review","timestamp":"2026-01-02T00:00:00.000Z","tool":"dsh"}',
    '{"skill":"review","timestamp":"2026-01-01T00:00:00.000Z","tool":"dsh"}',
    '{"skill":"review","timestamp":"2026-04-01T00:00:00.000Z","tool":"codex"}',
    '{"skill":"only-dsh","timestamp":"2026-02-01T00:00:00.000Z","tool":"dsh"}',
    '{"skill":"../evil","timestamp":"2026-02-01T00:00:00.000Z","tool":"dsh"}',
    '',
  ].join('\n'))
  await writeFile(path.join(home, '.teamai', 'usage.jsonl'), '{"skill":"decoy","timestamp":"2026-05-01T00:00:00.000Z","tool":"dsh"}\n')

  await mkdir(path.join(project, '.teamai'), { recursive: true })
  await writeFile(path.join(project, '.teamai', 'config.yaml'), [
    'username: ada',
    'scope: project',
    `projectRoot: ${project}`,
    'repo:',
    '  localPath: ~/team-repo',
    '  remote: https://example.com/team.git',
    '  kind: git',
    '',
  ].join('\n'))
  await writeFile(path.join(project, '.teamai', 'usage.jsonl'), '{"skill":"proj-agents","timestamp":"2026-03-01T00:00:00.000Z","tool":"dsh"}\n')
  await writeFile(path.join(project, '.teamai', 'user-usage.jsonl'), '{"skill":"ignored-decoy","timestamp":"2026-03-02T00:00:00.000Z","tool":"dsh"}\n')

  await mkdir(path.join(home, '.teamai', 'projects', 'broken'), { recursive: true })
  await writeFile(path.join(home, '.teamai', 'projects', 'broken', 'config.yaml'), 'not: [yaml\n')
  await mkdir(path.join(home, '.teamai', 'projects', 'skip me.x'), { recursive: true })
  await writeFile(path.join(home, '.teamai', 'projects', 'skip me.x', 'config.yaml'), 'username: nope\nrepo:\n  localPath: ~/missing\n')

  return {
    home,
    project,
    cleanup: () => rm(home, { recursive: true, force: true }),
  }
}

function row(snapshot, name) {
  return snapshot.selected.rows.find((item) => item.name === name)
}

test('user scope reads the team repo, user installs, and dsh usage only', async () => {
  const dir = await fixture()
  try {
    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.home,
      dshHome: path.join(dir.home, '.dsh'),
      env: {},
    })
    assert.equal(snapshot.ok, true)
    assert.equal(snapshot.selected.scope, 'user')
    assert.equal(snapshot.sandbox.note, null)
    assert.equal(snapshot.sandbox.usageMayBeBlocked, false)
    const review = row(snapshot, 'review')
    assert.equal(review.inTeamRepo, true)
    assert.equal(review.description, 'Review a change.')
    assert.equal(review.visibleSource, 'user-dsh')
    assert.equal(review.shadowed, false)
    assert.equal(review.dshCount, 2)
    assert.equal(review.otherCount, 1)
    assert.equal(review.lastUsed, '2026-01-02T00:00:00.000Z')
    const nested = row(snapshot, 'nested')
    assert.equal(nested.namespace, 'ns')
    assert.equal(nested.repoCopies[0], 'skills/ns/nested')
    assert.equal(nested.visible, false)
    assert.equal(row(snapshot, 'secret-skill').excluded, true)
    assert.equal(row(snapshot, 'user-only').visibleSource, 'user-dsh')
    assert.equal(row(snapshot, 'agents-only').visibleSource, 'user-agents')
    assert.equal(row(snapshot, 'only-dsh').dshCount, 1)
    assert.equal(row(snapshot, 'decoy'), undefined)
    assert.equal(row(snapshot, 'not a skill'), undefined)
    assert.equal(row(snapshot, 'foo..bar'), undefined)
    assert.equal(row(snapshot, '.hidden'), undefined)
    assert.equal(JSON.stringify(snapshot).includes('DO_NOT_LEAK_BODY'), false)
    assert.equal(JSON.stringify(snapshot).includes(dir.home), false)
    assert.equal(snapshot.warnings.some((item) => item.includes('合法 YAML')), true)
    assert.equal(JSON.stringify(snapshot.workspaces).includes('nope'), false)
  } finally {
    await dir.cleanup()
  }
})

test('project scope prefers the project copy and the project usage file', async () => {
  const dir = await fixture()
  try {
    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.project,
      dshHome: path.join(dir.home, '.dsh'),
      env: { DSH_PERMISSION_MODE: 'workspace-write' },
    })
    assert.equal(snapshot.selected.scope, 'project')
    assert.equal(snapshot.selected.label, 'app')
    assert.equal(snapshot.sandbox.usageMayBeBlocked, true)
    assert.match(snapshot.sandbox.note, /使用次数可能一直是 0/)
    const review = row(snapshot, 'review')
    assert.equal(review.visibleSource, 'project-dsh')
    assert.equal(review.shadowed, true)
    assert.equal(review.installedUser, true)
    assert.equal(review.dshCount, 0)
    assert.equal(row(snapshot, 'proj-agents').visibleSource, 'project-agents')
    assert.equal(row(snapshot, 'proj-agents').dshCount, 1)
    assert.equal(row(snapshot, 'ignored-decoy'), undefined)
    assert.equal(row(snapshot, 'only-dsh'), undefined)
  } finally {
    await dir.cleanup()
  }
})

test('full access clears the sandbox note away from home', async () => {
  const dir = await fixture()
  try {
    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.project,
      env: { DSH_PERMISSION_MODE: 'danger-full-access' },
    })
    assert.equal(snapshot.sandbox.note, null)
    assert.equal(snapshot.sandbox.mode, 'danger-full-access')
  } finally {
    await dir.cleanup()
  }
})

test('an explicit workspace id overrides the directory match', async () => {
  const dir = await fixture()
  try {
    const user = await createSnapshot({ home: dir.home, cwd: dir.home, env: {} })
    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.project,
      env: {},
      workspaceId: user.selected.id,
    })
    assert.equal(snapshot.selected.scope, 'user')
    assert.equal(snapshot.selected.id, user.selected.id)
  } finally {
    await dir.cleanup()
  }
})

test('a missing config is an empty snapshot', async () => {
  const home = await mkdtemp(path.join(tmpdir(), 'teamai-panel-empty-'))
  try {
    const snapshot = await createSnapshot({ home, cwd: home, env: {} })
    assert.equal(snapshot.ok, true)
    assert.equal(snapshot.selected, null)
    assert.equal(snapshot.workspaces.length, 0)
    assert.match(snapshot.warnings.join('\n'), /teamai init/)
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})

test('the inventory keeps secrets, commands, and MCP endpoints out', async () => {
  const home = await mkdtemp(path.join(tmpdir(), 'teamai-panel-inventory-'))
  const repo = path.join(home, 'team-repo')
  const secrets = [
    'SUPER_SECRET_VALUE',
    'SECRETURL',
    'ARGSECRET',
    'URLSECRET',
    'HEADERSECRET',
    'ENVSECRET',
    'HOOKSECRET',
    'BASESECRET',
    'sk-LIVEKEY',
    'RULEBODYSECRET',
    'AGENTPROMPTSECRET',
  ]
  try {
    await mkdir(path.join(repo, 'rules'), { recursive: true })
    await writeFile(path.join(repo, 'rules', 'review.md'), '# 评审规则\nRULEBODYSECRET\n')
    await mkdir(path.join(repo, 'docs', 'guide'), { recursive: true })
    await writeFile(path.join(repo, 'docs', 'guide', 'start.md'), '# 开始\n')
    await mkdir(path.join(repo, 'env', 'fe'), { recursive: true })
    await writeFile(path.join(repo, 'env', 'env.yaml'), [
      'variables:',
      '  - key: PLAIN',
      '    value: SUPER_SECRET_VALUE',
      '    description: 普通说明',
      '',
    ].join('\n'))
    await writeFile(path.join(repo, 'env', 'fe', 'secrets.yaml'), [
      'secrets:',
      '  - key: TOKEN',
      '    description: 令牌',
      '    url: https://example.com/token?x=SECRETURL',
      '    value: SUPER_SECRET_VALUE',
      '',
    ].join('\n'))
    await mkdir(path.join(repo, 'mcp', 'fe'), { recursive: true })
    await writeFile(path.join(repo, 'mcp', 'mcp.yaml'), [
      'servers:',
      '  - name: local-tool',
      '    description: 本地工具',
      '    transport: stdio',
      '    command: echo ARGSECRET',
      '    args: ["--token", "ARGSECRET"]',
      '    env:',
      '      TOKEN: ENVSECRET',
      '    tools: [search]',
      '    requires: [TOKEN]',
      '',
    ].join('\n'))
    await writeFile(path.join(repo, 'mcp', 'fe', 'mcp.yaml'), [
      'servers:',
      '  - name: remote-tool',
      '    description: 远程工具',
      '    transport: http',
      '    url: https://example.com/mcp?token=URLSECRET',
      '    headers:',
      '      Authorization: HEADERSECRET',
      '    tools: [lookup]',
      '',
    ].join('\n'))
    await mkdir(path.join(repo, 'hooks'), { recursive: true })
    await writeFile(path.join(repo, 'hooks', 'hooks.yaml'), [
      'hooks:',
      '  - id: before-edit',
      '    description: 编辑前',
      '    event: PreToolUse',
      '    matcher: Bash',
      '    command: echo HOOKSECRET',
      '    tools: [Bash]',
      '',
    ].join('\n'))
    await mkdir(path.join(repo, 'models'), { recursive: true })
    await writeFile(path.join(repo, 'models', 'models.yaml'), [
      'version: 1',
      'profiles:',
      '  - id: main',
      '    name: 主力',
      '    base_url: https://gateway.example/BASESECRET',
      '    api_key: sk-LIVEKEY',
      '    model_groups:',
      '      - protocols: [anthropic]',
      '        models: [deepseek-v4]',
      '',
    ].join('\n'))
    await writeFile(path.join(repo, 'models', 'aliases.yaml'), 'aliases:\n  fast: sk-LIVEKEY\n')
    await mkdir(path.join(repo, 'agents'), { recursive: true })
    await writeFile(path.join(repo, 'agents', 'reviewer.yaml'), 'name: reviewer\ndescription: 评审\nprompt: AGENTPROMPTSECRET\n')
    await mkdir(path.join(repo, 'workflows'), { recursive: true })
    await writeFile(path.join(repo, 'workflows', 'daily.yaml'), 'name: daily\ndescription: 每日\ncommand: HOOKSECRET\n')
    await mkdir(path.join(repo, 'manifest'), { recursive: true })
    await writeFile(path.join(repo, 'manifest', 'roles.yaml'), 'version: 1\nroles:\n  - id: fe\n    name: 前端\n')
    await writeFile(path.join(repo, 'manifest', 'projects.yaml'), 'version: 1\nprojects:\n  - id: app\n    name: 应用\n')
    await mkdir(path.join(home, '.teamai'), { recursive: true })
    await writeFile(path.join(home, '.teamai', 'config.yaml'), [
      'username: ada',
      'scope: user',
      'repo:',
      '  localPath: ~/team-repo',
      '  remote: https://example.com/team.git',
      '  kind: git',
      '',
    ].join('\n'))
    const snapshot = await createSnapshot({ home, cwd: home, env: {} })
    const inventory = snapshot.selected.inventory
    assert.equal(inventory.rules[0].name, 'review')
    assert.equal(inventory.rules[0].detail, '评审规则')
    assert.equal(inventory.docs[0].name, 'docs/guide/start.md')
    assert.equal(inventory.env[0].name, 'PLAIN')
    assert.equal(inventory.env[0].detail, '普通说明')
    assert.equal(inventory.secrets[0].name, 'TOKEN')
    assert.equal(inventory.secrets[0].meta.includes('密钥声明'), true)
    assert.equal(inventory.mcp.map((item) => item.name).sort().join(','), 'local-tool,remote-tool')
    const remote = inventory.mcp.find((item) => item.name === 'remote-tool')
    assert.match(remote.meta, /http/)
    assert.match(remote.meta, /命名空间 fe/)
    assert.match(remote.meta, /已写地址/)
    assert.match(remote.meta, /请求头 Authorization/)
    assert.equal(inventory.hooks[0].name, 'before-edit')
    assert.match(inventory.hooks[0].meta, /PreToolUse/)
    assert.equal(inventory.models[0].name, 'main')
    assert.match(inventory.models[0].meta, /deepseek-v4/)
    assert.match(inventory.models[0].meta, /未显示/)
    assert.equal(inventory.aliases[0].name, 'fast')
    assert.equal(inventory.agents[0].name, 'reviewer')
    assert.equal(inventory.workflows[0].name, 'daily')
    assert.equal(inventory.workflows[0].detail, '每日')
    assert.equal(inventory.roles[0].name, 'fe')
    assert.equal(inventory.projects[0].name, 'app')
    assert.equal(snapshot.dsh.find((item) => item.id === 'mcp').mark, 'absent')
    const body = JSON.stringify(snapshot)
    for (const secret of secrets) assert.equal(body.includes(secret), false, secret)
    assert.equal(body.includes(home), false)
    assert.equal(body.includes('example.com/mcp'), false)
    assert.equal(body.includes('example.com/token'), false)
    assert.equal(body.includes('gateway.example'), false)
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})

test('an unknown workspace id falls back and warns', async () => {
  const dir = await fixture()
  try {
    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.home,
      env: {},
      workspaceId: '0123456789ab',
    })
    assert.equal(snapshot.selected.scope, 'user')
    assert.match(snapshot.warnings.join('\n'), /已改用默认工作区/)
  } finally {
    await dir.cleanup()
  }
})
