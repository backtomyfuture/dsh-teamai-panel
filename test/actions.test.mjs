import assert from 'node:assert/strict'
import { lstat, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { runAction } from '../lib/actions.js'
import { createSnapshot } from '../lib/snapshot.js'

async function fixture() {
  const home = await mkdtemp(path.join(tmpdir(), 'teamai-panel-home-'))
  const repo = await mkdtemp(path.join(tmpdir(), 'teamai-panel-repo-'))
  const outside = await mkdtemp(path.join(tmpdir(), 'teamai-panel-out-'))
  await mkdir(path.join(home, '.teamai'), { recursive: true })
  await writeFile(path.join(home, '.teamai', 'config.yaml'), [
    'username: ada',
    'scope: user',
    'repo:',
    `  localPath: ${JSON.stringify(repo)}`,
    '  kind: git',
    '',
  ].join('\n'))
  await mkdir(path.join(repo, 'skills', 'local-only'), { recursive: true })
  await writeFile(path.join(repo, 'skills', 'local-only', 'SKILL.md'), '---\nname: local-only\n---\n')
  return {
    home,
    repo,
    outside,
    async cleanup() {
      await rm(home, { recursive: true, force: true })
      await rm(repo, { recursive: true, force: true })
      await rm(outside, { recursive: true, force: true })
    },
  }
}

function recordingRun(calls, behavior) {
  return async (command, args, options = {}) => {
    calls.push({
      command,
      args: [...args],
      cwd: options.cwd,
      env: options.env,
    })
    if (behavior) return behavior(command, args, options)
    if (command === 'git' && args.includes('--quiet')) return { code: 1, stdout: '', stderr: '' }
    return { code: 0, stdout: '', stderr: '' }
  }
}

test('install, init, pull, and exclude stay on the allowlist', async () => {
  const dir = await fixture()
  const calls = []
  const run = recordingRun(calls)
  try {
    const missing = await runAction({ action: 'pull' }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(missing.ok, false)
    assert.equal(missing.code, 'confirm')
    assert.equal(calls.length, 0)

    const present = await runAction(
      { action: 'install', confirm: 'install-teamai' },
      { home: dir.home, cwd: dir.home, runCommand: run },
    )
    assert.equal(present.ok, true)
    assert.equal(calls.some((call) => call.command === 'npm'), false)

    calls.length = 0
    const install = recordingRun(calls, (command) => (
      command === 'teamai'
        ? { code: 127, stdout: '', stderr: 'not found' }
        : { code: 0, stdout: '', stderr: '' }
    ))
    const installed = await runAction(
      { action: 'install', confirm: 'install-teamai' },
      { home: dir.home, cwd: dir.home, runCommand: install },
    )
    assert.equal(installed.ok, true)
    assert.deepEqual(calls.map((call) => [call.command, call.args]), [
      ['teamai', ['--version']],
      ['npm', ['install', '-g', 'teamai-cli']],
    ])

    calls.length = 0
    const work = await mkdtemp(path.join(tmpdir(), 'teamai-panel-cwd-'))
    const init = await runAction({
      action: 'init',
      confirm: 'init',
      repo: 'https://github.com/octo/skills',
      provider: 'github',
      scope: 'workspace',
    }, { home: dir.home, cwd: work, runCommand: run })
    assert.equal(init.ok, true)
    const initCall = calls.find((call) => call.command === 'teamai')
    assert.deepEqual(initCall.args, [
      'init', 'https://github.com/octo/skills', '--provider', 'github', '--scope', 'workspace', '--agent', 'dsh',
    ])
    assert.equal(initCall.args.includes('--force'), false)
    assert.equal(initCall.args.includes('--token'), false)
    assert.equal(initCall.cwd, path.resolve(work))
    assert.equal(initCall.env.GIT_TERMINAL_PROMPT, '0')
    assert.equal('GIT_AUTHOR_NAME' in initCall.env, 'GIT_AUTHOR_NAME' in process.env)

    calls.length = 0
    const pull = await runAction(
      { action: 'pull', confirm: 'pull' },
      { home: dir.home, cwd: dir.home, runCommand: run },
    )
    assert.equal(pull.ok, true)
    assert.deepEqual(calls.at(-1).args, ['pull'])

    calls.length = 0
    const excluded = await runAction({
      action: 'skill-exclude',
      confirm: 'exclude',
      mode: 'add',
      names: ['demo-skill'],
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(excluded.ok, true)
    assert.deepEqual(calls.at(-1).args, ['skill', 'exclude', 'add', 'demo-skill'])
    assert.equal(calls.at(-1).cwd, path.resolve(dir.home))

    const badName = await runAction({
      action: 'skill-exclude',
      confirm: 'exclude',
      mode: 'add',
      names: ['../demo'],
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(badName.ok, false)
    assert.equal(calls.length, 1)

    await rm(work, { recursive: true, force: true })
  } finally {
    await dir.cleanup()
  }
})

test('skill push sends one resolved directory and ignores a caller path', async () => {
  const dir = await fixture()
  const calls = []
  const run = recordingRun(calls)
  const options = { home: dir.home, cwd: dir.home, runCommand: run }
  const installed = path.join(dir.home, '.dsh', 'skills', 'demo')
  await mkdir(installed, { recursive: true })
  await writeFile(path.join(installed, 'SKILL.md'), '---\nname: demo\n---\n')
  await mkdir(path.join(dir.repo, 'skills', 'ns', 'demo'), { recursive: true })
  await writeFile(path.join(dir.repo, 'skills', 'ns', 'demo', 'SKILL.md'), '---\nname: demo\n---\n')
  const published = path.join(dir.repo, 'skills', 'published')
  await mkdir(published, { recursive: true })
  await writeFile(path.join(published, 'SKILL.md'), '---\nname: published\n---\n')
  try {
    const pushed = await runAction({
      action: 'skill-push',
      confirm: 'push-skill',
      name: 'demo',
      path: '/tmp/not-this',
    }, options)
    assert.equal(pushed.ok, true)
    assert.equal(pushed.message.includes('这一个技能'), true)
    assert.deepEqual(calls.at(-1).args, ['push', '--skill', installed, '--all'])
    assert.equal(JSON.stringify(pushed).includes(dir.home), false)

    const fromRepo = await runAction({
      action: 'skill-push',
      confirm: 'push-skill',
      name: 'published',
    }, options)
    assert.equal(fromRepo.ok, true)
    assert.deepEqual(calls.at(-1).args, ['push', '--skill', published, '--all'])

    calls.length = 0
    const missing = await runAction({
      action: 'skill-push',
      confirm: 'push-skill',
      name: 'absent',
    }, options)
    assert.equal(missing.ok, false)
    assert.equal(calls.length, 0)

    const bad = await runAction({
      action: 'skill-push',
      confirm: 'push-skill',
      name: '../demo',
    }, options)
    assert.equal(bad.ok, false)
    assert.equal(calls.some((call) => call.args[0] === 'push'), false)
  } finally {
    await dir.cleanup()
  }
})

test('prompt writes stay inside the team repo and git commits only that file', async () => {
  const dir = await fixture()
  const calls = []
  const run = recordingRun(calls)
  const options = { home: dir.home, cwd: dir.home, runCommand: run }
  try {
    const saved = await runAction({
      action: 'prompt-save',
      confirm: 'save-prompt',
      name: 'review.md',
      text: '请看这一段。',
    }, options)
    assert.equal(saved.ok, true)
    assert.equal(saved.name, 'prompts/review.md')
    assert.equal(await readFile(path.join(dir.repo, 'prompts', 'review.md'), 'utf8'), '请看这一段。\n')
    assert.equal(JSON.stringify(saved).includes(dir.home), false)
    assert.equal(JSON.stringify(saved).includes(dir.repo), false)
    const git = calls.filter((call) => call.command === 'git')
    assert.deepEqual(git.map((call) => call.args.at(-1)), [
      'prompts/review.md',
      'prompts/review.md',
      'prompts/review.md',
      'HEAD',
    ])
    assert.deepEqual(git.at(-1).args.slice(-3), ['push', 'origin', 'HEAD'])
    assert.equal(git.some((call) => call.args.includes('skills/local-only/SKILL.md')), false)
    assert.equal(calls.some((call) => call.args[0] === 'push' && call.command === 'teamai'), false)

    calls.length = 0
    const read = await runAction({ action: 'prompt-read', name: 'prompts/review.md' }, options)
    assert.equal(read.ok, true)
    assert.equal(read.text, '请看这一段。\n')
    assert.equal(calls.length, 0)

    for (const name of ['../outside.md', '../../etc/passwd.md', 'prompts/../../outside.md']) {
      const rejected = await runAction({
        action: 'prompt-save',
        confirm: 'save-prompt',
        name,
        text: 'nope',
      }, options)
      assert.equal(rejected.ok, false)
      assert.equal(rejected.code, 'invalid')
    }
    await assert.rejects(lstat(path.join(dir.repo, '..', 'outside.md')))
    await assert.rejects(lstat(path.join(dir.outside, 'outside.md')))

    await symlink(dir.outside, path.join(dir.repo, 'prompts', 'linked'))
    const linked = await runAction({
      action: 'prompt-save',
      confirm: 'save-prompt',
      name: 'linked/escape.md',
      text: 'nope',
    }, options)
    assert.equal(linked.ok, false)
    assert.equal(linked.code, 'invalid')
    await assert.rejects(lstat(path.join(dir.outside, 'escape.md')))

    calls.length = 0
    const removed = await runAction({
      action: 'prompt-delete',
      confirm: 'delete-prompt',
      name: 'review.md',
    }, options)
    assert.equal(removed.ok, true)
    await assert.rejects(lstat(path.join(dir.repo, 'prompts', 'review.md')))
    assert.equal(calls.filter((call) => call.command === 'git').every((call) => {
      const last = call.args.at(-1)
      return last === 'prompts/review.md' || last === 'HEAD'
    }), true)
  } finally {
    await dir.cleanup()
  }
})

test('MCP saves one root file, hides secrets, and does not claim DSH loaded it', async () => {
  const dir = await fixture()
  const calls = []
  const leak = 'failed SECRETCMD ARGSECRET ENVSECRET HEADERSECRET /Users/ada/private https://secret.example/mcp'
  const run = recordingRun(calls, (command, args) => {
    if (command === 'git' && args.includes('--quiet')) return { code: 1, stdout: '', stderr: '' }
    if (command === 'git' && args.includes('push')) return { code: 1, stdout: '', stderr: leak }
    return { code: 0, stdout: '', stderr: '' }
  })
  const options = { home: dir.home, cwd: dir.home, runCommand: run }
  try {
    await mkdir(path.join(dir.repo, 'mcp', 'ns'), { recursive: true })
    const namespaced = 'servers:\n  - name: other\n    transport: stdio\n    command: OTHERSECRET\n'
    await writeFile(path.join(dir.repo, 'mcp', 'ns', 'mcp.yaml'), namespaced)
    await writeFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), [
      'servers:',
      '  - name: keep',
      '    transport: stdio',
      '    command: SECRETCMD',
      '    args: [ARGSECRET]',
      '    env:',
      '      TOKEN: ENVSECRET',
      '',
    ].join('\n'))

    const saved = await runAction({
      action: 'mcp-save',
      confirm: 'save-mcp',
      name: 'docs',
      transport: 'stdio',
      description: '文档检索',
      command: 'SECRETCMD',
      args: 'ARGSECRET',
      env: 'TOKEN=ENVSECRET',
      headers: 'Authorization=HEADERSECRET',
    }, options)
    const body = JSON.stringify(saved)
    assert.equal(saved.ok, true)
    assert.equal(saved.name, 'docs')
    assert.equal(saved.transport, 'stdio')
    assert.equal(saved.message.includes('推送到远端没有完成'), true)
    for (const secret of ['SECRETCMD', 'ARGSECRET', 'ENVSECRET', 'HEADERSECRET', 'https://secret.example', '/Users/ada']) {
      assert.equal(body.includes(secret), false, secret)
    }
    assert.equal(body.includes(dir.home), false)
    assert.equal(body.includes(dir.repo), false)
    const file = await readFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), 'utf8')
    assert.equal(file.includes('SECRETCMD'), true)
    assert.equal(file.includes('name: keep'), true)
    assert.equal(file.includes('name: docs'), true)
    assert.equal(await readFile(path.join(dir.repo, 'mcp', 'ns', 'mcp.yaml'), 'utf8'), namespaced)
    const commit = calls.find((call) => call.command === 'git' && call.args.includes('commit'))
    assert.equal(commit.args.at(-1), 'mcp/mcp.yaml')
    assert.equal(commit.args.includes('skills/local-only/SKILL.md'), false)

    const snapshot = await createSnapshot({
      home: dir.home,
      cwd: dir.home,
      dshHome: path.join(dir.home, '.dsh'),
      env: {},
      cli: { installed: true, version: '0.0.0' },
    })
    const visible = JSON.stringify(snapshot)
    for (const secret of ['SECRETCMD', 'ARGSECRET', 'ENVSECRET', 'HEADERSECRET', 'OTHERSECRET']) {
      assert.equal(visible.includes(secret), false, secret)
    }

    calls.length = 0
    const remote = await runAction({
      action: 'mcp-save',
      confirm: 'save-mcp',
      name: 'remote',
      transport: 'http',
      url: 'https://user:pass@secret.example/mcp?token=1',
    }, options)
    assert.equal(remote.ok, false)
    assert.equal(file, await readFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), 'utf8'))

    const broken = 'servers: [\nSECRETCMD\n'
    await writeFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), broken)
    const refused = await runAction({
      action: 'mcp-save',
      confirm: 'save-mcp',
      name: 'docs',
      transport: 'stdio',
      command: 'npx',
    }, options)
    assert.equal(refused.ok, false)
    assert.equal(refused.message.includes('SECRETCMD'), false)
    assert.equal(await readFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), 'utf8'), broken)

    const injected = await runAction(
      { action: 'mcp-inject', confirm: 'inject-mcp' },
      options,
    )
    assert.equal(injected.ok, true)
    assert.equal(injected.message.includes('DeepSeek Harness 不加载'), true)
    assert.deepEqual(calls.at(-1).args, ['mcp', 'inject'])
    assert.equal(calls.at(-1).args.includes('--force'), false)

    const cleared = await runAction(
      { action: 'mcp-clear-local', confirm: 'clear-local-mcp' },
      options,
    )
    assert.equal(cleared.ok, true)
    assert.deepEqual(calls.at(-1).args, ['mcp', 'remove'])
  } finally {
    await dir.cleanup()
  }
})

test('an unexpected failure does not echo the thrown message', async () => {
  const dir = await fixture()
  try {
    const failed = await runAction({
      action: 'pull',
      confirm: 'pull',
    }, {
      home: dir.home,
      cwd: dir.home,
      runCommand() {
        throw new Error('SECRETCMD at /Users/ada/private')
      },
    })
    assert.equal(failed.ok, false)
    assert.equal(failed.code, 'failed')
    assert.equal(failed.message, '操作没有完成。')
    assert.equal(JSON.stringify(failed).includes('SECRETCMD'), false)
  } finally {
    await dir.cleanup()
  }
})

test('skill-push-all, config-update, and enhanced init pass options to teamai and update config', async () => {
  const dir = await fixture()
  const calls = []
  const run = recordingRun(calls)
  try {
    const pushed = await runAction({
      action: 'skill-push-all',
      confirm: 'push-all-skills',
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(pushed.ok, true)
    assert.deepEqual(calls.at(-1).args, ['push', '--all'])

    const reinit = await runAction({
      action: 'init',
      confirm: 'init',
      repo: 'https://github.com/octo/skills',
      provider: 'github',
      scope: 'workspace',
      role: 'hai_dev',
      project: 'mobile,web',
      force: true,
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(reinit.ok, true)
    assert.deepEqual(calls.at(-1).args, [
      'init', 'https://github.com/octo/skills', '--provider', 'github', '--scope', 'workspace', '--agent', 'dsh',
      '--role', 'hai_dev', '--project', 'mobile,web', '--force',
    ])

    const updated = await runAction({
      action: 'config-update',
      confirm: 'update-config',
      role: 'ops_role',
      projects: ['cloud', 'infra'],
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(updated.ok, true)
    const content = await readFile(path.join(dir.home, '.teamai', 'config.yaml'), 'utf8')
    assert.match(content, /role: ops_role/)
    assert.match(content, /cloud/)
    assert.match(content, /infra/)

    const deletedSkill = await runAction({
      action: 'skill-delete',
      confirm: 'delete-skill',
      name: 'local-only',
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(deletedSkill.ok, true)
    assert.deepEqual(calls.at(-1).args, ['remove', '--force', 'skills', 'local-only'])

    const deletedWs = await runAction({
      action: 'workspace-delete',
      confirm: 'delete-workspace',
    }, { home: dir.home, cwd: dir.home, runCommand: run })
    assert.equal(deletedWs.ok, true)
    const exists = await readFile(path.join(dir.home, '.teamai', 'config.yaml'), 'utf8').catch(() => null)
    assert.equal(exists, null)
  } finally {
    await dir.cleanup()
  }
})

test('prompt-push, prompt-push-all, mcp-push, and mcp-push-all publish existing items', async () => {
  const dir = await fixture()
  const calls = []
  const run = recordingRun(calls)
  const options = { home: dir.home, cwd: dir.home, runCommand: run }
  try {
    await mkdir(path.join(dir.repo, 'prompts'), { recursive: true })
    await writeFile(path.join(dir.repo, 'prompts', 'guide.md'), '# Guide\n')
    await mkdir(path.join(dir.repo, 'mcp'), { recursive: true })
    await writeFile(path.join(dir.repo, 'mcp', 'mcp.yaml'), 'servers: []\n')

    const pushedPrompt = await runAction({
      action: 'prompt-push',
      confirm: 'push-prompt',
      name: 'guide.md',
    }, options)
    assert.equal(pushedPrompt.ok, true)
    assert.equal(calls.some((c) => c.command === 'git' && c.args.includes('prompts/guide.md')), true)

    calls.length = 0
    const pushedAllPrompts = await runAction({
      action: 'prompt-push-all',
      confirm: 'push-all-prompts',
    }, options)
    assert.equal(pushedAllPrompts.ok, true)
    assert.equal(calls.some((c) => c.command === 'git' && c.args.includes('prompts/guide.md')), true)

    calls.length = 0
    const pushedMcp = await runAction({
      action: 'mcp-push',
      confirm: 'push-mcp',
      name: 'docs',
    }, options)
    assert.equal(pushedMcp.ok, true)
    assert.equal(calls.some((c) => c.command === 'git' && c.args.includes('mcp/mcp.yaml')), true)

    calls.length = 0
    const pushedAllMcp = await runAction({
      action: 'mcp-push-all',
      confirm: 'push-all-mcp',
    }, options)
    assert.equal(pushedAllMcp.ok, true)
    assert.equal(calls.some((c) => c.command === 'git' && c.args.includes('mcp/mcp.yaml')), true)
  } finally {
    await dir.cleanup()
  }
})
