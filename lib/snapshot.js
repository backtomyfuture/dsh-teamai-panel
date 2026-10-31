/**
 * Read-only snapshot of one machine's TeamAI skills and DSH usage.
 *
 * The browser never sees SKILL.md bodies, tokens, or env values. Paths in the
 * response are labels (`~/.dsh/skills`), not absolute paths.
 */
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'
import { DSH_CAPABILITIES, emptyInventory, scanInventory } from './inventory.js'

export const ROUTE_PATH = '/teamai-panel/snapshot'
const MAX_SKILLS = 400
const MAX_USAGE_BYTES = 8 * 1024 * 1024
const MAX_FRONTMATTER_BYTES = 16 * 1024
const SKILL_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

/**
 * @param {object} [options]
 * @param {string} [options.home]
 * @param {string} [options.cwd]
 * @param {string} [options.dshHome]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {string} [options.workspaceId]
 */
export async function loadWorkspace(options = {}) {
  const home = path.resolve(options.home ?? defaultHome())
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const warnings = []
  const configs = await discoverConfigs(home, cwd)
  const workspaces = []
  for (const file of configs) {
    const parsed = await readConfig(file, home)
    if (!parsed.ok) {
      warnings.push(parsed.warning)
      continue
    }
    workspaces.push(parsed.workspace)
  }
  const selected = chooseWorkspace(workspaces, cwd, options.workspaceId)
  if (options.workspaceId && !selected) {
    warnings.push('请求的工作区不在这台机器已发现的 TeamAI 配置里，已改用默认工作区。')
  }
  return {
    home,
    cwd,
    warnings,
    workspaces,
    workspace: selected ?? chooseWorkspace(workspaces, cwd, undefined),
  }
}

export async function createSnapshot(options = {}) {
  const located = await loadWorkspace(options)
  const { home, cwd, warnings, workspaces } = located
  const chosen = located.workspace
  const dshHome = path.resolve(options.dshHome ?? options.env?.DSH_HOME ?? path.join(home, '.dsh'))
  const env = options.env ?? process.env
  const userConfigDir = await realpath(path.join(home, '.teamai')).catch(() => path.resolve(path.join(home, '.teamai')))
  const sandbox = sandboxStatus(env, cwd, home)
  const cli = await probeTeamai(options)
  if (!chosen) {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      sandbox,
      cli,
      dsh: DSH_CAPABILITIES,
      workspaces: [],
      selected: null,
      warnings: warnings.concat('没有找到 TeamAI 配置。在这台机器上运行过 teamai init 之后，这里才会列出团队技能。'),
    }
  }
  const view = await buildView(chosen, { home, cwd, dshHome, warnings, userConfigDir })
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    sandbox,
    cli,
    dsh: DSH_CAPABILITIES,
    workspaces: workspaces.map((item) => ({
      id: item.id,
      label: item.label,
      scope: item.scope,
      selected: item.id === chosen.id,
    })),
    selected: view,
    warnings,
  }
}

function probeTeamai(options) {
  if (options.cli) return Promise.resolve(options.cli)
  const run = options.runCommand ?? execFileAsync
  return run('teamai', ['--version'], { timeout: 4000 }).then((result) => {
    if (!result || result.code !== 0) return { installed: false, version: '' }
    const match = String(result.stdout || '').match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/)
    return { installed: true, version: match ? match[0] : '' }
  }).catch(() => ({ installed: false, version: '' }))
}

function execFileAsync(command, args, options) {
  return new Promise((resolve) => {
    execFile(command, args, {
      timeout: options.timeout ?? 4000,
      windowsHide: true,
      maxBuffer: 64 * 1024,
    }, (error, stdout, stderr) => {
      resolve({
        code: error ? (typeof error.code === 'number' ? error.code : 127) : 0,
        stdout: stdout ? String(stdout) : '',
        stderr: stderr ? String(stderr) : '',
      })
    })
  })
}

function defaultHome() {
  return process.env.HOME || process.env.USERPROFILE || '/'
}

async function discoverConfigs(home, cwd) {
  const files = []
  const userConfig = path.join(home, '.teamai', 'config.yaml')
  if (await exists(userConfig)) files.push(userConfig)
  const projects = path.join(home, '.teamai', 'projects')
  for (const name of await readDirNames(projects)) {
    if (!SKILL_NAME.test(name) && name.includes('.')) continue
    const file = path.join(projects, name, 'config.yaml')
    if (await exists(file)) files.push(file)
  }
  const legacy = path.join(cwd, '.teamai', 'config.yaml')
  if (await exists(legacy)) files.push(legacy)
  const seen = new Set()
  const unique = []
  for (const file of files) {
    const real = await realpath(file).catch(() => path.resolve(file))
    if (seen.has(real)) continue
    seen.add(real)
    unique.push(real)
  }
  return unique
}

async function readConfig(file, home) {
  let text
  try {
    const info = await stat(file)
    if (info.size > 1024 * 1024) return { ok: false, warning: `跳过过大的配置：${labelPath(file, home)}` }
    text = await readFile(file, 'utf8')
  } catch {
    return { ok: false, warning: `读不到配置：${labelPath(file, home)}` }
  }
  let doc
  try {
    doc = YAML.parse(text)
  } catch {
    return { ok: false, warning: `配置不是合法 YAML：${labelPath(file, home)}` }
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { ok: false, warning: `配置不是对象：${labelPath(file, home)}` }
  }
  const repo = doc.repo && typeof doc.repo === 'object' ? doc.repo : null
  const localPath = repo && typeof repo.localPath === 'string' ? expandHome(repo.localPath, home) : ''
  if (!localPath) return { ok: false, warning: `配置缺少 repo.localPath：${labelPath(file, home)}` }
  const scope = doc.scope === 'project' ? 'project' : 'user'
  const projectRoot = typeof doc.projectRoot === 'string' && doc.projectRoot.trim()
    ? path.resolve(expandHome(doc.projectRoot, home))
    : null
  const excluded = Array.isArray(doc.excludedSkills)
    ? doc.excludedSkills.filter((name) => typeof name === 'string')
    : []
  const id = createHash('sha256').update(file).digest('hex').slice(0, 12)
  const label = scope === 'project' && projectRoot
    ? path.basename(projectRoot) || projectRoot
    : '用户级'
  return {
    ok: true,
    workspace: {
      id,
      file,
      label,
      scope,
      projectRoot,
      username: typeof doc.username === 'string' ? doc.username : '',
      excluded,
      repo: {
        localPath: path.resolve(localPath),
        remote: repo && typeof repo.remote === 'string' ? repo.remote : '',
        kind: repo && typeof repo.kind === 'string' ? repo.kind : 'git',
      },
    },
  }
}

function chooseWorkspace(workspaces, cwd, workspaceId) {
  if (workspaceId) return workspaces.find((item) => item.id === workspaceId) ?? null
  const resolved = path.resolve(cwd)
  const projects = workspaces
    .filter((item) => item.scope === 'project' && item.projectRoot && isInside(resolved, item.projectRoot))
    .sort((a, b) => b.projectRoot.length - a.projectRoot.length)
  if (projects.length > 0) return projects[0]
  return workspaces.find((item) => item.scope === 'user') ?? workspaces[0] ?? null
}

async function buildView(workspace, { home, dshHome, warnings, userConfigDir }) {
  const skillsRoot = path.join(workspace.repo.localPath, 'skills')
  const teamSkills = await scanTeamSkills(skillsRoot, home, warnings)
  const roots = skillRoots(workspace.projectRoot, dshHome, home)
  const catalog = []
  for (const root of roots) {
    const names = await scanSkillDir(root.dir)
    for (const name of names) catalog.push({ name, source: root.id, rank: root.rank })
  }
  const winner = new Map()
  for (const entry of catalog) {
    const current = winner.get(entry.name)
    if (!current || entry.rank < current.rank) winner.set(entry.name, entry)
  }
  const usage = await readUsage(usageFile(workspace, userConfigDir), workspace, warnings)
  const excluded = new Set(workspace.excluded)
  const names = new Set([
    ...teamSkills.map((skill) => skill.name),
    ...winner.keys(),
    ...usage.keys(),
  ])
  const rows = [...names].sort((a, b) => a.localeCompare(b)).slice(0, MAX_SKILLS).map((name) => {
    const copies = teamSkills.filter((skill) => skill.name === name)
    const visible = winner.get(name) ?? null
    const userCopy = catalog.some((entry) => entry.name === name && entry.source === 'user-dsh')
    const record = usage.get(name)
    return {
      name,
      description: copies.find((skill) => skill.description)?.description ?? null,
      namespace: copies.length === 1 ? copies[0].namespace : null,
      repoCopies: copies.map((skill) => skill.repoPath),
      inTeamRepo: copies.length > 0,
      excluded: excluded.has(name),
      installedUser: userCopy,
      visible: Boolean(visible),
      visibleSource: visible ? visible.source : null,
      shadowed: Boolean(visible && userCopy && visible.source !== 'user-dsh'),
      dshCount: record?.dshCount ?? 0,
      otherCount: record?.otherCount ?? 0,
      lastUsed: record?.lastUsed ?? null,
    }
  })
  rows.sort((a, b) => b.dshCount - a.dshCount || a.name.localeCompare(b.name))
  let inventory
  try {
    inventory = await scanInventory(workspace.repo.localPath, warnings)
  } catch {
    warnings.push('团队资源清点失败，技能清单仍然可用。')
    inventory = emptyInventory()
  }
  return {
    id: workspace.id,
    label: workspace.label,
    scope: workspace.scope,
    username: workspace.username,
    repoRemote: workspace.repo.remote,
    repoKind: workspace.repo.kind,
    rows,
    inventory,
  }
}

function skillRoots(projectRoot, dshHome, home) {
  const roots = []
  if (projectRoot) {
    roots.push({ id: 'project-dsh', rank: 100, dir: path.join(projectRoot, '.dsh', 'skills') })
    roots.push({ id: 'project-agents', rank: 200, dir: path.join(projectRoot, '.agents', 'skills') })
  }
  roots.push({ id: 'user-dsh', rank: 400, dir: path.join(dshHome, 'skills') })
  roots.push({ id: 'user-agents', rank: 500, dir: path.join(home, '.agents', 'skills') })
  return roots
}

async function scanTeamSkills(skillsRoot, home, warnings) {
  if (!await exists(skillsRoot)) {
    warnings.push(`团队仓库里没有 skills 目录（${labelPath(skillsRoot, home)}）。`)
    return []
  }
  const found = []
  const top = await readDirNames(skillsRoot)
  for (const name of top) {
    if (!isSkillName(name) || found.length >= MAX_SKILLS) continue
    const dir = path.join(skillsRoot, name)
    if (await exists(path.join(dir, 'SKILL.md'))) {
      found.push({
        name,
        namespace: null,
        repoPath: `skills/${name}`,
        description: await readDescription(path.join(dir, 'SKILL.md')),
      })
      continue
    }
    for (const child of await readDirNames(dir)) {
      if (!isSkillName(child) || found.length >= MAX_SKILLS) continue
      const nested = path.join(dir, child, 'SKILL.md')
      if (!await exists(nested)) continue
      found.push({
        name: child,
        namespace: name,
        repoPath: `skills/${name}/${child}`,
        description: await readDescription(nested),
      })
    }
  }
  return found
}

async function scanSkillDir(dir) {
  if (!await exists(dir)) return []
  const names = []
  for (const name of await readDirNames(dir)) {
    if (!isSkillName(name)) continue
    if (await exists(path.join(dir, name, 'SKILL.md'))) names.push(name)
  }
  return names
}

async function readDescription(file) {
  let text
  try {
    const info = await stat(file)
    if (info.size > MAX_FRONTMATTER_BYTES) {
      const handle = await import('node:fs').then((fs) => fs.promises.open(file, 'r'))
      try {
        const buffer = Buffer.alloc(MAX_FRONTMATTER_BYTES)
        await handle.read(buffer, 0, MAX_FRONTMATTER_BYTES, 0)
        text = buffer.toString('utf8')
      } finally {
        await handle.close()
      }
    } else {
      text = await readFile(file, 'utf8')
    }
  } catch {
    return null
  }
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  try {
    const data = YAML.parse(match[1])
    const description = data && typeof data === 'object' ? data.description : null
    return typeof description === 'string' && description.trim() ? description.trim().slice(0, 240) : null
  } catch {
    return null
  }
}

function usageFile(workspace, userConfigDir) {
  const dir = path.dirname(workspace.file)
  if (path.resolve(dir) === path.resolve(userConfigDir)) {
    return path.join(dir, 'user-usage.jsonl')
  }
  return path.join(dir, 'usage.jsonl')
}

async function readUsage(file, workspace, warnings) {
  const counts = new Map()
  if (!await exists(file)) return counts
  let text
  try {
    const info = await stat(file)
    if (info.size > MAX_USAGE_BYTES) {
      warnings.push('使用记录超过 8MB，这次没有统计。')
      return counts
    }
    text = await readFile(file, 'utf8')
  } catch {
    warnings.push('使用记录存在但读失败。')
    return counts
  }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let event
    try {
      event = JSON.parse(line)
    } catch {
      continue
    }
    if (!event || typeof event.skill !== 'string' || !isSkillName(event.skill)) continue
    const tool = typeof event.tool === 'string' ? event.tool : ''
    const when = typeof event.timestamp === 'string' ? event.timestamp : null
    const current = counts.get(event.skill) ?? { dshCount: 0, otherCount: 0, lastUsed: null }
    if (tool === 'dsh') {
      current.dshCount += 1
      if (when && (!current.lastUsed || when > current.lastUsed)) current.lastUsed = when
    } else {
      current.otherCount += 1
    }
    counts.set(event.skill, current)
  }
  if (workspace.scope === 'project' && counts.size === 0) {
    // An empty project file is still a successful read.
  }
  return counts
}

function sandboxStatus(env, cwd, home) {
  const mode = env.DSH_PERMISSION_MODE || 'workspace-write'
  const startedAtHome = path.resolve(cwd) === path.resolve(home)
  const blocked = mode !== 'danger-full-access' && !startedAtHome
  return {
    mode,
    usageMayBeBlocked: blocked,
    note: blocked
      ? 'DSH 默认把钩子关在启动目录里。当前启动目录不是用户主目录，使用次数可能一直是 0。把 dsh 从主目录启动，或设置 DSH_PERMISSION_MODE=danger-full-access，TeamAI 才能写下使用记录。'
      : null,
  }
}

function isSkillName(name) {
  return typeof name === 'string' && SKILL_NAME.test(name) && !name.includes('..')
}

function expandHome(value, home) {
  if (value === '~') return home
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(home, value.slice(2))
  return value
}

function isInside(child, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(child))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function labelPath(file, home) {
  const resolved = path.resolve(file)
  const homeResolved = path.resolve(home)
  if (resolved === homeResolved) return '~'
  if (isInside(resolved, homeResolved)) return `~/${path.relative(homeResolved, resolved)}`
  return path.basename(resolved)
}

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

async function readDirNames(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.')).map((entry) => entry.name)
  } catch {
    return []
  }
}
