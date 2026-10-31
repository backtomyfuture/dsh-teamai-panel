window.__ModuleLoader__.load({
  id: 'dsh-teamai-panel',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var h = React.createElement;

    var PANEL_ID = 'teamai-skills';
    var ROUTE = '/teamai-panel/snapshot';
    var ACTION = '/teamai-panel/action';
    var STYLE_ID = 'dsh-teamai-panel-style';
    var SOURCES = [
      { id: 'project-dsh', label: '项目 .dsh/skills', rank: '100' },
      { id: 'project-agents', label: '项目 .agents/skills', rank: '200' },
      { id: 'user-dsh', label: '用户 ~/.dsh/skills', rank: '400' },
      { id: 'user-agents', label: '用户 ~/.agents/skills', rank: '500' },
    ];

    var CSS = [
      '.tap-root{box-sizing:border-box;width:100%;height:100%;max-height:100dvh;min-height:0;flex:1 1 auto;align-self:stretch;overflow:auto;overscroll-behavior:contain;color:var(--dsw-alias-label-primary,inherit);background:var(--dsw-alias-bg-base,transparent);font:13px/1.5 ui-sans-serif,system-ui,sans-serif;}',
      '.tap-root,.tap-root *{box-sizing:border-box;}',
      '.tap-page{width:min(1080px,100%);margin:0 auto;padding:22px 28px 56px;}',
      '.tap-sticky{position:sticky;top:0;z-index:2;display:flex;flex-direction:column;align-items:stretch;gap:0;margin:-22px -28px 18px;padding:18px 28px 12px;background:var(--dsw-alias-bg-base,canvas);border-bottom:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));}',
      '.tap-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 16px;}',
      '.tap-switch{display:flex;gap:4px;width:max-content;margin-top:14px;padding:3px;border-radius:12px;background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 6%,transparent));}',
      '.tap-switch .tap-tab{height:30px;}',
      '.tap-switch .tap-tab[aria-selected="true"]{background:var(--dsw-alias-bg-base,canvas);}',
      '.tap-kicker{margin:0;font-size:12px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));}',
      '.tap-title{margin:2px 0 0;font-size:22px;line-height:1.2;font-weight:640;letter-spacing:-.03em;}',
      '.tap-remote{margin:4px 0 0;max-width:520px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
      '.tap-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}',
      '.tap-field{height:32px;border:1px solid var(--dsw-alias-border-l3,color-mix(in srgb,currentColor 18%,transparent));border-radius:9px;background:var(--dsw-alias-bg-layer-1,transparent);color:inherit;font:inherit;padding:0 10px;}',
      '.tap-field:focus{outline:2px solid var(--dsw-focus-ring-color,color-mix(in srgb,currentColor 35%,transparent));outline-offset:1px;}',
      '.tap-search{width:min(240px,46vw);}',
      '.tap-button{height:32px;border:1px solid var(--dsw-alias-border-l3,color-mix(in srgb,currentColor 18%,transparent));border-radius:9px;background:var(--dsw-alias-bg-layer-1,transparent);color:inherit;font:inherit;padding:0 12px;cursor:pointer;}',
      '.tap-button:hover{background:var(--dsw-alias-interactive-bg-hover,color-mix(in srgb,currentColor 6%,transparent));}',
      '.tap-banner{margin:0 0 14px;padding:10px 12px;border-radius:12px;background:var(--dsw-alias-state-warn-tertiary,color-mix(in srgb,#d97706 16%,transparent));color:var(--dsw-alias-state-warn-label,inherit);font-size:12.5px;}',
      '.tap-warnings{margin:0 0 14px;padding-left:18px;color:var(--dsw-alias-label-secondary,inherit);font-size:12.5px;}',
      '.tap-section{margin-top:8px;}',
      '.tap-section h2{margin:0;font-size:15px;font-weight:640;letter-spacing:-.01em;}',
      '.tap-note{margin:4px 0 0;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
      '.tap-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:10px;margin-top:12px;}',
      '.tap-kpi{padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));border-radius:14px;background:var(--dsw-alias-bg-layer-1,color-mix(in srgb,currentColor 4%,transparent));}',
      '.tap-kpi small{display:block;color:var(--dsw-alias-label-secondary,color-mix(in srgb,currentColor 62%,transparent));font-size:12px;}',
      '.tap-kpi b{display:block;margin-top:6px;font-size:26px;line-height:1.05;font-weight:640;letter-spacing:-.04em;font-variant-numeric:tabular-nums;}',
      '.tap-kpi span{display:block;margin-top:4px;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
      '.tap-split{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}',
      '@media (max-width:860px){.tap-split{grid-template-columns:1fr;}}',
      '.tap-card{padding:14px;border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));border-radius:14px;background:var(--dsw-alias-bg-layer-1,color-mix(in srgb,currentColor 4%,transparent));}',
      '.tap-card h3{margin:0;font-size:13px;font-weight:640;}',
      '.tap-bar{display:grid;grid-template-columns:minmax(108px,34%) minmax(0,1fr) 36px;gap:10px;align-items:center;margin-top:9px;font-size:12px;}',
      '.tap-track{height:8px;border-radius:99px;background:var(--dsw-alias-bg-layer-3,color-mix(in srgb,currentColor 8%,transparent));overflow:hidden;}',
      '.tap-fill{height:100%;border-radius:99px;background:var(--dsw-alias-state-business-primary,#4d6bfe);}',
      '.tap-fill-ok{background:var(--dsw-alias-state-success-primary,#12b76a);}',
      '.tap-fill-warn{background:var(--dsw-alias-state-warn-primary,#f79009);}',
      '.tap-count{text-align:right;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary,inherit);}',
      '.tap-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:22px 0 4px;}',
      '.tap-tab{height:30px;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,inherit);font:inherit;padding:0 12px;cursor:pointer;}',
      '.tap-tab[aria-selected="true"]{border-color:var(--dsw-alias-border-l3,color-mix(in srgb,currentColor 18%,transparent));background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 6%,transparent));color:var(--dsw-alias-label-primary,inherit);}',
      '.tap-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 16px;margin-top:8px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));border-radius:14px;background:var(--dsw-alias-bg-layer-1,transparent);}',
      '.tap-name{font-size:14px;font-weight:630;letter-spacing:-.01em;}',
      '.tap-desc{grid-column:1 / -1;margin:0;color:var(--dsw-alias-label-secondary,color-mix(in srgb,currentColor 68%,transparent));display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
      '.tap-meta{grid-column:1 / -1;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;}',
      '.tap-pill{align-self:start;white-space:nowrap;border-radius:999px;padding:2px 8px;font-size:12px;background:var(--dsw-alias-state-success-tertiary,#e7f8ef);color:var(--dsw-alias-state-success-primary,#067647);}',
      '.tap-pill-warn{background:var(--dsw-alias-state-warn-tertiary,#fff4e5);color:var(--dsw-alias-state-warn-label,#b54708);}',
      '.tap-pill-muted{background:var(--dsw-alias-bg-layer-3,color-mix(in srgb,currentColor 8%,transparent));color:var(--dsw-alias-label-secondary,inherit);}',
      '.tap-empty{margin:12px 0 0;color:var(--dsw-alias-label-secondary,inherit);}',
      '.tap-caps{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}',
      '.tap-cap{flex:1 1 168px;max-width:280px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));border-radius:12px;background:var(--dsw-alias-bg-layer-1,color-mix(in srgb,currentColor 4%,transparent));}',
      '.tap-cap b{display:block;font-size:13px;font-weight:640;}',
      '.tap-cap span{display:block;margin-top:3px;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
      '.tap-mark{display:inline-block;margin-bottom:4px;font-size:11px;font-weight:650;letter-spacing:.02em;}',
      '.tap-mark-works{color:var(--dsw-alias-state-success-primary,#067647);}',
      '.tap-mark-broken{color:var(--dsw-alias-state-warn-label,#b54708);}',
      '.tap-mark-unsupported,.tap-mark-unknown,.tap-mark-absent{color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));}',
      '.tap-foot{margin:28px 0 0;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
      '.tap-manage{margin:0 0 16px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 12%,transparent));border-radius:14px;background:var(--dsw-alias-bg-layer-1,color-mix(in srgb,currentColor 4%,transparent));}',
      '.tap-manage h2{margin:0;font-size:14px;}',
      '.tap-row-actions{grid-column:1 / -1;display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}',
      '.tap-form{display:grid;gap:8px;margin-top:12px;}',
      '.tap-form label{display:grid;gap:4px;color:var(--dsw-alias-label-secondary,inherit);font-size:12px;}',
      '.tap-area{min-height:140px;resize:vertical;border:1px solid var(--dsw-alias-border-l3,color-mix(in srgb,currentColor 18%,transparent));border-radius:9px;background:var(--dsw-alias-bg-layer-1,transparent);color:inherit;font:12.5px/1.45 var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);padding:8px 10px;}',
      '.tap-area:focus{outline:2px solid var(--dsw-focus-ring-color,color-mix(in srgb,currentColor 35%,transparent));outline-offset:1px;}',
    ].join('');

    function warn(ctx, err) {
      var logger = ctx && ctx.logger;
      var sink = (logger && (logger.warn || logger.info)) || (typeof console !== 'undefined' ? console.warn : null);
      if (!sink) return;
      try {
        sink.call(logger || console, '[dsh-teamai-panel] ' + (err && err.message ? err.message : String(err)));
      } catch (ignored) {
        // A log failure must not break panel registration.
      }
    }

    function ensureStyle() {
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    function PanelIcon(props) {
      var size = (props && props.size) || 16;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      h('rect', { x: 1.5, y: 2, width: 13, height: 3.2, rx: 1, stroke: 'currentColor', strokeWidth: 1.4 }),
      h('rect', { x: 1.5, y: 6.4, width: 13, height: 3.2, rx: 1, stroke: 'currentColor', strokeWidth: 1.4 }),
      h('rect', { x: 1.5, y: 10.8, width: 13, height: 3.2, rx: 1, stroke: 'currentColor', strokeWidth: 1.4 }));
    }

    function matches(row, filter) {
      if (!filter) return true;
      var hay = [row.name, row.namespace || '', row.description || ''].join(' ').toLowerCase();
      return hay.indexOf(filter) !== -1;
    }

    function sourceOf(id) {
      for (var i = 0; i < SOURCES.length; i += 1) {
        if (SOURCES[i].id === id) return SOURCES[i];
      }
      return null;
    }

    function summarize(rows) {
      var stats = {
        repo: 0,
        deliver: 0,
        excluded: 0,
        visible: 0,
        missing: 0,
        shadowed: 0,
        dshEvents: 0,
        used: 0,
        sources: { 'project-dsh': 0, 'project-agents': 0, 'user-dsh': 0, 'user-agents': 0 },
      };
      rows.forEach(function (row) {
        if (row.inTeamRepo) stats.repo += 1;
        if (row.inTeamRepo && row.excluded) stats.excluded += 1;
        if (row.inTeamRepo && !row.excluded) stats.deliver += 1;
        if (row.inTeamRepo && !row.excluded && !row.visible) stats.missing += 1;
        if (row.visible) {
          stats.visible += 1;
          if (stats.sources[row.visibleSource] !== undefined) stats.sources[row.visibleSource] += 1;
        }
        if (row.shadowed) stats.shadowed += 1;
        stats.dshEvents += row.dshCount || 0;
        if ((row.dshCount || 0) > 0) stats.used += 1;
      });
      return stats;
    }

    function Bar(props) {
      var width = props.max > 0 ? Math.max(props.value > 0 ? 4 : 0, Math.round(props.value / props.max * 100)) : 0;
      return h('div', { className: 'tap-bar' },
        h('span', null, props.label),
        h('div', { className: 'tap-track', title: props.label + ' ' + props.value },
          h('div', { className: 'tap-fill' + (props.tone ? ' tap-fill-' + props.tone : ''), style: { width: width + '%' } })),
        h('span', { className: 'tap-count' }, String(props.value)));
    }

    function Kpi(props) {
      return h('article', { className: 'tap-kpi' },
        h('small', null, props.label),
        h('b', null, String(props.value)),
        h('span', null, props.hint));
    }

    function Pill(props) {
      return h('span', { className: 'tap-pill' + (props.tone ? ' tap-pill-' + props.tone : '') }, props.text);
    }

    function Row(props) {
      return h('article', { className: 'tap-row' },
        h('div', { className: 'tap-name' }, props.title),
        props.aside ? h(Pill, { text: props.aside, tone: props.tone }) : null,
        props.detail ? h('p', { className: 'tap-desc' }, props.detail) : null,
        props.meta ? h('div', { className: 'tap-meta' }, props.meta) : null,
        props.actions ? h('div', { className: 'tap-row-actions' }, props.actions) : null);
    }

    var MARKS = {
      works: '能收到',
      broken: '默认收不到',
      unsupported: '还没接上',
      absent: '没有这条',
      unknown: '还不确定',
    };

    var OTHER_NOTES = {
      rules: '规则的标题。正文不在这个页面。用户级规则进 AGENTS.md，项目级靠会话开始钩子。',
      docs: '文档标题。正文不在这个页面。',
      env: '只显示键名和说明。变量值和密钥值不在这个页面。默认沙箱下 DSH 收不到这些变量。',
      agents: '子代理的名称和说明。DeepSeek Harness 没有安装路径。',
      hooks: '钩子的 id、事件和说明。命令文本不在这个页面。',
      models: '团队共享的网关配置档和别名。这里不是模型市场，也不会列出网上有哪些模型。密钥和网关地址不在这个页面。',
      workflows: '工作流文件名和说明。DSH 自己可以跑工作流，TeamAI 没有为它生成。',
      other: '评分器、说明块、学习记录、知识库、角色、项目和成员。提示词在单独的选项卡里。成员如果只登记在 teamai-reports 分支，这里是空的。',
    };

    function itemMatches(item, needle) {
      if (!needle) return true;
      var hay = [item.name, item.detail || '', item.meta || ''].join(' ').toLowerCase();
      return hay.indexOf(needle) !== -1;
    }

    function tagged(list, kind) {
      return (list || []).filter(function (item) { return item && item.name; }).map(function (item) {
        return {
          name: item.name,
          detail: item.detail || null,
          meta: kind + (item.meta ? ' · ' + item.meta : ''),
        };
      });
    }

    function TeamAIPage() {
      ensureStyle();
      var workspaceState = React.useState('');
      var workspaceId = workspaceState[0];
      var setWorkspaceId = workspaceState[1];
      var snapshotState = React.useState(null);
      var snapshot = snapshotState[0];
      var setSnapshot = snapshotState[1];
      var statusState = React.useState('loading');
      var status = statusState[0];
      var setStatus = statusState[1];
      var errorState = React.useState('');
      var error = errorState[0];
      var setError = errorState[1];
      var filterState = React.useState('');
      var filter = filterState[0];
      var setFilter = filterState[1];
      var reloadState = React.useState(0);
      var reload = reloadState[0];
      var setReload = reloadState[1];
      var tabState = React.useState('repo');
      var tab = tabState[0];
      var setTab = tabState[1];
      var pageState = React.useState('skills');
      var pageTab = pageState[0];
      var setPageTab = pageState[1];

      React.useEffect(function () {
        var cancelled = false;
        setStatus('loading');
        setError('');
        var url = ROUTE;
        if (workspaceId) url += '?workspace=' + encodeURIComponent(workspaceId);
        fetch(url, { headers: { accept: 'application/json' } }).then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        }).then(function (body) {
          if (cancelled) return;
          setSnapshot(body);
          setStatus('ready');
        }).catch(function (err) {
          if (cancelled) return;
          setError(err && err.message ? err.message : '请求失败');
          setStatus('error');
        });
        return function () { cancelled = true; };
      }, [workspaceId, reload]);

      var selected = snapshot && snapshot.selected;
      var rows = (selected && selected.rows) || [];
      var needle = filter.trim().toLowerCase();
      var visibleRows = rows.filter(function (row) { return matches(row, needle); });
      var stats = summarize(visibleRows);
      var repoRows = visibleRows.filter(function (row) { return row.inTeamRepo; });
      var catalogRows = visibleRows.filter(function (row) { return row.visible; });
      var usageRows = visibleRows.filter(function (row) { return row.dshCount > 0; })
        .sort(function (a, b) { return b.dshCount - a.dshCount || a.name.localeCompare(b.name); });
      var shownId = workspaceId || (selected && selected.id) || '';
      var sandboxNote = snapshot && snapshot.sandbox && snapshot.sandbox.note;
      var sourceMax = 0;
      SOURCES.forEach(function (source) {
        if (stats.sources[source.id] > sourceMax) sourceMax = stats.sources[source.id];
      });
      var usageMax = usageRows.length ? usageRows[0].dshCount : 0;
      var deliveryMax = Math.max(stats.deliver, stats.excluded, 1);
      var list = tab === 'catalog' ? catalogRows : tab === 'usage' ? usageRows : repoRows;
      var inventory = (selected && selected.inventory) || {};
      var mcpItems = (inventory.mcp || []).filter(function (item) { return itemMatches(item, needle); });
      var groups = [
        { id: 'rules', label: '规则', items: (inventory.rules || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'docs', label: '文档', items: (inventory.docs || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'env', label: '环境变量', items: (inventory.env || []).concat(inventory.secrets || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'agents', label: '子代理', items: (inventory.agents || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'hooks', label: '钩子', items: (inventory.hooks || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'models', label: '模型', items: (inventory.models || []).concat(inventory.aliases || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'workflows', label: '工作流', items: (inventory.workflows || []).filter(function (item) { return itemMatches(item, needle); }) },
        { id: 'other', label: '其他', items: [].concat(
          tagged(inventory.scorers, '评分器'),
          tagged(inventory.claudemd, '说明块'),
          tagged(inventory.learnings, '学习记录'),
          tagged(inventory.wiki, '知识库'),
          tagged(inventory.roles, '角色'),
          tagged(inventory.projects, '项目'),
          tagged(inventory.members, '成员'),
        ).filter(function (item) { return itemMatches(item, needle); }) },
      ];
      var resourceState = React.useState('rules');
      var resourceTab = resourceState[0];
      var setResourceTab = resourceState[1];
      var noticeState = React.useState('');
      var notice = noticeState[0];
      var setNotice = noticeState[1];
      var busyState = React.useState('');
      var busy = busyState[0];
      var setBusy = busyState[1];
      var pendingState = React.useState(null);
      var pending = pendingState[0];
      var setPending = pendingState[1];
      var repoInputState = React.useState('');
      var repoInput = repoInputState[0];
      var setRepoInput = repoInputState[1];
      var scopeInputState = React.useState('user');
      var scopeInput = scopeInputState[0];
      var setScopeInput = scopeInputState[1];
      var promptNameState = React.useState('');
      var promptName = promptNameState[0];
      var setPromptName = promptNameState[1];
      var promptBodyState = React.useState('');
      var promptBody = promptBodyState[0];
      var setPromptBody = promptBodyState[1];
      var mcpNameState = React.useState('');
      var mcpName = mcpNameState[0];
      var setMcpName = mcpNameState[1];
      var mcpTransportState = React.useState('stdio');
      var mcpTransport = mcpTransportState[0];
      var setMcpTransport = mcpTransportState[1];
      var mcpDescriptionState = React.useState('');
      var mcpDescription = mcpDescriptionState[0];
      var setMcpDescription = mcpDescriptionState[1];
      var mcpCommandState = React.useState('');
      var mcpCommand = mcpCommandState[0];
      var setMcpCommand = mcpCommandState[1];
      var mcpArgsState = React.useState('');
      var mcpArgs = mcpArgsState[0];
      var setMcpArgs = mcpArgsState[1];
      var mcpUrlState = React.useState('');
      var mcpUrl = mcpUrlState[0];
      var setMcpUrl = mcpUrlState[1];
      var mcpEnvState = React.useState('');
      var mcpEnv = mcpEnvState[0];
      var setMcpEnv = mcpEnvState[1];
      var mcpHeadersState = React.useState('');
      var mcpHeaders = mcpHeadersState[0];
      var setMcpHeaders = mcpHeadersState[1];

      function ask(text, payload) {
        setNotice('');
        setPending({ text: text, payload: payload });
      }

      function submit(payload) {
        setBusy(payload.action);
        setNotice('');
        setPending(null);
        var body = Object.assign({ workspace: shownId }, payload);
        fetch(ACTION, {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }).then(function (res) {
          return res.json().then(function (data) {
            return { status: res.status, data: data };
          });
        }).then(function (result) {
          var data = result.data || {};
          setNotice(data.message || (data.ok ? '完成。' : '操作没有完成。'));
          if (data.ok && data.text !== undefined) setPromptBody(data.text);
          if (data.ok && (payload.action === 'mcp-save' || payload.action === 'mcp-delete')) {
            setMcpCommand('');
            setMcpArgs('');
            setMcpUrl('');
            setMcpEnv('');
            setMcpHeaders('');
          }
          if (data.ok && payload.action !== 'prompt-read') setReload(function (value) { return value + 1; });
          setBusy('');
        }).catch(function (err) {
          setNotice(err && err.message ? err.message : '请求失败');
          setBusy('');
        });
      }
      var activeGroup = groups[0];
      for (var groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        if (groups[groupIndex].id === resourceTab) activeGroup = groups[groupIndex];
      }

      return h('div', { className: 'tap-root' },
        h('div', { className: 'tap-page' },
          h('header', { className: 'tap-sticky' },
            h('div', { className: 'tap-head' },
              h('div', null,
                h('p', { className: 'tap-kicker' }, 'TEAMAI'),
                h('h1', { className: 'tap-title' }, pageTab === 'mcp' ? '团队 MCP' : pageTab === 'prompts' ? '团队提示词' : '团队技能'),
                h('p', { className: 'tap-remote' }, selected
                  ? ((selected.scope === 'project' ? '项目' : '用户') + ' · ' + (selected.label || '当前工作区') + (selected.username ? ' · ' + selected.username : '') + (selected.repoRemote ? ' · ' + selected.repoRemote : ''))
                  : '还没有读到 TeamAI 工作区')),
              h('div', { className: 'tap-tools' },
              h('input', {
                className: 'tap-field tap-search',
                value: filter,
                placeholder: pageTab === 'mcp' ? '筛选 MCP 或资源' : pageTab === 'prompts' ? '筛选提示词' : '筛选技能',
                'aria-label': pageTab === 'mcp' ? '筛选 MCP 或资源' : pageTab === 'prompts' ? '筛选提示词' : '筛选技能',
                onChange: function (event) { setFilter(event.target.value); },
              }),
              snapshot && snapshot.workspaces && snapshot.workspaces.length > 1
                ? h('select', {
                  className: 'tap-field',
                  'aria-label': '工作区',
                  value: shownId,
                  onChange: function (event) { setWorkspaceId(event.target.value); },
                }, snapshot.workspaces.map(function (item) {
                  return h('option', { key: item.id, value: item.id }, item.label + (item.scope === 'project' ? ' · 项目' : ' · 用户'));
                }))
                : null,
              h('button', {
                className: 'tap-button',
                type: 'button',
                onClick: function () { setReload(reload + 1); },
              }, status === 'loading' ? '读取中' : '刷新'))),
            h('div', { className: 'tap-switch', role: 'tablist', 'aria-label': '技能、MCP 和提示词' },
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'skills' ? 'true' : 'false',
                onClick: function () { setPageTab('skills'); },
              }, '技能 ' + rows.length),
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'mcp' ? 'true' : 'false',
                onClick: function () { setPageTab('mcp'); },
              }, 'MCP ' + (inventory.mcp || []).length),
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'prompts' ? 'true' : 'false',
                onClick: function () { setPageTab('prompts'); },
              }, '提示词 ' + (inventory.prompts || []).length))),
          h('section', { className: 'tap-manage' },
            h('h2', null, '这台机器'),
            h('p', { className: 'tap-note' }, snapshot && snapshot.cli && snapshot.cli.installed
              ? ('teamai ' + (snapshot.cli.version || '已安装') + (selected ? '。同步会拉取当前应该下发的全部技能，同时同步规则、文档、环境变量和钩子。' : '。还没有团队配置。'))
              : '还没有检测到 teamai。安装使用 npm 全局安装 teamai-cli。'),
            h('div', { className: 'tap-tools' },
              snapshot && snapshot.cli && snapshot.cli.installed ? null : h('button', {
                className: 'tap-button',
                type: 'button',
                disabled: busy ? true : undefined,
                onClick: function () {
                  ask('安装 teamai-cli。这会用 npm 安装到这台机器。', { action: 'install', confirm: 'install-teamai' });
                },
              }, '安装 TeamAI'),
              selected ? h('button', {
                className: 'tap-button',
                type: 'button',
                disabled: busy ? true : undefined,
                onClick: function () {
                  ask('同步团队资源。pull 会安装当前配置应该收到的全部技能，并同步规则、文档、环境变量和钩子。没有按单个技能拉取的命令。', { action: 'pull', confirm: 'pull' });
                },
              }, busy === 'pull' ? '同步中' : '同步到本机') : null),
            !selected && snapshot && snapshot.cli && snapshot.cli.installed ? h('div', { className: 'tap-form' },
              h('p', { className: 'tap-note' }, '如果这份仓库还没有 teamai.yaml，初始化会向默认分支推送一份空骨架。页面不收集令牌，认证用这台机器上已经登录的 Git。'),
              h('label', null, '团队仓库',
                h('input', {
                  className: 'tap-field',
                  value: repoInput,
                  placeholder: 'owner/repo',
                  'aria-label': '团队仓库',
                  onChange: function (event) { setRepoInput(event.target.value); },
                })),
              h('label', null, '范围',
                h('select', {
                  className: 'tap-field',
                  'aria-label': '初始化范围',
                  value: scopeInput,
                  onChange: function (event) { setScopeInput(event.target.value); },
                },
                h('option', { value: 'user' }, '用户'),
                h('option', { value: 'workspace' }, '当前工作区'))),
              h('button', {
                className: 'tap-button',
                type: 'button',
                disabled: busy ? true : undefined,
                onClick: function () {
                  ask('初始化 ' + (repoInput.trim() || '这份仓库') + '，代理固定为 dsh。如果仓库还没有 teamai.yaml，会向默认分支推送一份空骨架。', {
                    action: 'init',
                    confirm: 'init',
                    repo: repoInput.trim(),
                    provider: 'github',
                    scope: scopeInput,
                  });
                },
              }, '初始化'),
            ) : null,
            pending ? h('div', { className: 'tap-banner' },
              h('p', { className: 'tap-note' }, pending.text),
              h('div', { className: 'tap-tools' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () { submit(pending.payload); },
                }, '确认执行'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  onClick: function () { setPending(null); },
                }, '取消'))) : null,
            notice ? h('p', { className: 'tap-note' }, notice) : null),
          status === 'error' ? h('p', { className: 'tap-banner' }, '读不到快照：' + error) : null,
          sandboxNote ? h('p', { className: 'tap-banner' }, sandboxNote) : null,
          snapshot && snapshot.warnings && snapshot.warnings.length
            ? h('ul', { className: 'tap-warnings' }, snapshot.warnings.map(function (item, index) {
              return h('li', { key: index }, item);
            }))
            : null,
          pageTab === 'skills' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '概览'),
            h('p', { className: 'tap-note' }, needle
              ? '数字跟着上面的筛选走。次数只统计 tool 为 dsh 的使用记录。'
              : '仓库、实际生效目录和使用记录分开算。次数只统计 tool 为 dsh 的事件。'),
            h('div', { className: 'tap-kpis' },
              h(Kpi, { label: '仓库技能', value: stats.repo, hint: 'skills 目录里的 SKILL.md' }),
              h(Kpi, { label: '将会下发', value: stats.deliver, hint: '按目录名，未在排除名单' }),
              h(Kpi, { label: '已排除', value: stats.excluded, hint: 'pull 不会下发' }),
              h(Kpi, { label: '实际生效', value: stats.visible, hint: '合并后的四个目录' }),
              h(Kpi, { label: '尚未装上', value: stats.missing, hint: '仓库有，当前目录没有' }),
              h(Kpi, {
                label: 'DSH 使用次数',
                value: stats.dshEvents,
                hint: sandboxNote ? '沙箱下次数可能不完整' : stats.used + ' 个技能有记录',
              }))),
          h('div', { className: 'tap-split' },
            h('section', { className: 'tap-card' },
              h('h3', null, '下发构成'),
              h('p', { className: 'tap-note' }, '命名空间会装平。标签和 deliveredInstead 不在这里重算。'),
              h(Bar, { label: '将会下发', value: stats.deliver, max: deliveryMax, tone: 'ok' }),
              h(Bar, { label: '已排除', value: stats.excluded, max: deliveryMax, tone: 'warn' })),
            h('section', { className: 'tap-card' },
              h('h3', null, '生效来源'),
              h('p', { className: 'tap-note' }, stats.shadowed
                ? stats.shadowed + ' 个技能在用户目录也有副本，当前生效的是更高优先级。'
                : '优先级 300 的自定义目录没有读取。'),
              SOURCES.map(function (source) {
                return h(Bar, {
                  key: source.id,
                  label: source.label + ' · ' + source.rank,
                  value: stats.sources[source.id],
                  max: sourceMax,
                });
              }))),
          h('section', { className: 'tap-card', style: { marginTop: 12 } },
            h('h3', null, '使用排行'),
            h('p', { className: 'tap-note' }, sandboxNote
              ? '没有记录不表示没人用过。钩子可能写不进 TeamAI。'
              : '按 dsh 事件次数。最近时间取这些事件里最晚的 timestamp。'),
            usageRows.length
              ? usageRows.slice(0, 8).map(function (row) {
                return h(Bar, {
                  key: 'rank-' + row.name,
                  label: row.name,
                  value: row.dshCount,
                  max: usageMax,
                });
              })
              : h('p', { className: 'tap-empty' }, sandboxNote
                ? '目前没有读到 dsh 使用记录。'
                : '还没有 tool 为 dsh 的使用记录。')),
          h('div', { className: 'tap-tabs', role: 'tablist', 'aria-label': '技能清单' },
            [
              ['repo', '团队仓库', repoRows.length],
              ['catalog', '实际生效', catalogRows.length],
              ['usage', '使用记录', usageRows.length],
            ].map(function (item) {
              return h('button', {
                key: item[0],
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': tab === item[0] ? 'true' : 'false',
                onClick: function () { setTab(item[0]); },
              }, item[1] + ' ' + item[2]);
            })),
          h('p', { className: 'tap-note' }, tab === 'repo'
            ? 'pull 会看到的技能目录。排除名单按目录名匹配。'
            : tab === 'catalog'
              ? '合并后真正加载的那一份。项目副本不会被标成团队副本。'
              : '只列出有 dsh 使用记录的技能。次数为 0 的不出现在这里。'),
          list.length
            ? list.map(function (row) {
              if (tab === 'usage') {
                return h(Row, {
                  key: 'use-' + row.name,
                  title: row.name,
                  aside: row.dshCount + ' 次',
                  tone: 'muted',
                  detail: row.lastUsed ? '最近一次 ' + row.lastUsed : '这些事件没有时间戳',
                  meta: row.otherCount ? '另有 ' + row.otherCount + ' 条其他工具的记录，不计入次数' : null,
                });
              }
              if (tab === 'catalog') {
                var source = sourceOf(row.visibleSource);
                return h(Row, {
                  key: 'cat-' + row.name,
                  title: row.name,
                  aside: source ? '优先级 ' + source.rank : '未知目录',
                  tone: row.shadowed ? 'warn' : 'muted',
                  detail: row.shadowed
                    ? (source ? source.label : row.visibleSource) + '。用户目录 ~/.dsh/skills 里也有同名副本，当前生效的不是那一份。'
                    : (source ? source.label : row.visibleSource),
                  meta: row.inTeamRepo ? '团队仓库里也有这个目录名' : '团队仓库里没有这个目录名',
                });
              }
              return h(Row, {
                key: 'repo-' + row.name + (row.namespace || ''),
                title: row.name,
                aside: row.excluded ? '已排除' : '将会下发',
                tone: row.excluded ? 'warn' : '',
                detail: row.description,
                meta: (row.namespace ? '命名空间 ' + row.namespace + ' · ' : '') + (row.repoCopies || []).join('，'),
                actions: h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask(row.excluded
                      ? '恢复 ' + row.name + '。这只改这台机器的排除名单。下次同步会重新安装。'
                      : '排除 ' + row.name + '。这只改这台机器的排除名单，不改团队仓库。下次同步会跳过它，并删掉 TeamAI 自己装上的副本。', {
                      action: 'skill-exclude',
                      mode: row.excluded ? 'remove' : 'add',
                      names: [row.name],
                      confirm: 'exclude',
                    });
                  },
                }, row.excluded ? '恢复下发' : '排除'),
              });
            })
            : h('p', { className: 'tap-empty' }, !selected
              ? '还没有 TeamAI 配置。在这台机器上运行 teamai init 之后再打开。'
              : tab === 'usage'
                ? (sandboxNote ? '目前没有读到 dsh 使用记录。不能据此判断没人用过。' : '还没有 tool 为 dsh 的使用记录。')
                : '这一栏里没有匹配的技能。'),
          h('section', { className: 'tap-section' },
            h('h2', null, '这份 DSH 能收到什么'),
            h('p', { className: 'tap-note' }, '对照 TeamAI 0.28 的工具矩阵。标记说的是 DeepSeek Harness 这条安装路径，不是仓库里有没有文件。'),
            h('div', { className: 'tap-caps' }, ((snapshot && snapshot.dsh) || []).map(function (item) {
              return h('article', { key: item.id, className: 'tap-cap' },
                h('small', { className: 'tap-mark tap-mark-' + (item.mark || 'unknown') }, MARKS[item.mark] || MARKS.unknown),
                h('b', null, item.label),
                h('span', null, item.detail));
            })))) : pageTab === 'prompts' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '团队提示词'),
            h('p', { className: 'tap-note' }, '提示词是团队仓库 prompts/ 下的 Markdown，工作流用 prompt_file 引用。保存和删除都会只提交这个文件，并推送到当前分支。'),
            (inventory.prompts || []).filter(function (item) { return itemMatches(item, needle); }).length
              ? (inventory.prompts || []).filter(function (item) { return itemMatches(item, needle); }).map(function (item, index) {
                return h(Row, {
                  key: 'prompt-' + index + '-' + item.name,
                  title: item.name,
                  aside: null,
                  detail: item.detail,
                  actions: h('button', {
                    className: 'tap-button',
                    type: 'button',
                    disabled: busy ? true : undefined,
                    onClick: function () {
                      setPromptName(item.name);
                      submit({ action: 'prompt-read', name: item.name });
                    },
                  }, '打开'),
                });
              })
              : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有提示词。' : '还没有 TeamAI 配置。'),
            h('div', { className: 'tap-form' },
              h('label', null, '文件',
                h('input', {
                  className: 'tap-field',
                  value: promptName,
                  placeholder: 'review.md',
                  'aria-label': '提示词文件',
                  onChange: function (event) { setPromptName(event.target.value); },
                })),
              h('label', null, '正文',
                h('textarea', {
                  className: 'tap-area',
                  value: promptBody,
                  'aria-label': '提示词正文',
                  onChange: function (event) { setPromptBody(event.target.value); },
                })),
              h('div', { className: 'tap-tools' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('保存 ' + (promptName.trim() || '这个提示词') + '，并推送到团队仓库的当前分支。', {
                      action: 'prompt-save',
                      confirm: 'save-prompt',
                      name: promptName.trim(),
                      text: promptBody,
                    });
                  },
                }, '保存并推送'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('删除 ' + (promptName.trim() || '这个提示词') + '，并推送到团队仓库的当前分支。', {
                      action: 'prompt-delete',
                      confirm: 'delete-prompt',
                      name: promptName.trim(),
                    });
                  },
                }, '删除并推送'))))) : h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '团队 MCP'),
            h('p', { className: 'tap-note' }, '这些服务器和技能在同一个插件里，用上面的选项卡分开。DeepSeek Harness 不加载它们，teamai mcp inject 写的是别的代理。命令、参数、请求头、环境变量和地址可以写进仓库，保存之后不再显示。'),
            mcpItems.length
              ? mcpItems.map(function (item, index) {
                return h(Row, {
                  key: 'mcp-' + index + '-' + item.name,
                  title: item.name,
                  aside: null,
                  detail: item.detail,
                  meta: item.meta,
                });
              })
              : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有 MCP。' : '还没有 TeamAI 配置。'),
            h('div', { className: 'tap-form' },
              h('label', null, '名称',
                h('input', {
                  className: 'tap-field',
                  value: mcpName,
                  placeholder: 'docs',
                  'aria-label': 'MCP 名称',
                  onChange: function (event) { setMcpName(event.target.value); },
                })),
              h('label', null, '传输',
                h('select', {
                  className: 'tap-field',
                  'aria-label': 'MCP 传输',
                  value: mcpTransport,
                  onChange: function (event) { setMcpTransport(event.target.value); },
                },
                h('option', { value: 'stdio' }, 'stdio'),
                h('option', { value: 'http' }, 'http'),
                h('option', { value: 'sse' }, 'sse'))),
              h('label', null, '说明',
                h('input', {
                  className: 'tap-field',
                  value: mcpDescription,
                  'aria-label': 'MCP 说明',
                  onChange: function (event) { setMcpDescription(event.target.value); },
                })),
              mcpTransport === 'stdio'
                ? h('label', null, '命令',
                  h('input', {
                    className: 'tap-field',
                    value: mcpCommand,
                    'aria-label': 'MCP 命令',
                    onChange: function (event) { setMcpCommand(event.target.value); },
                  }))
                : h('label', null, '地址',
                  h('input', {
                    className: 'tap-field',
                    value: mcpUrl,
                    'aria-label': 'MCP 地址',
                    onChange: function (event) { setMcpUrl(event.target.value); },
                  })),
              mcpTransport === 'stdio'
                ? h('label', null, '参数，一行一个',
                  h('textarea', {
                    className: 'tap-area',
                    value: mcpArgs,
                    'aria-label': 'MCP 参数',
                    onChange: function (event) { setMcpArgs(event.target.value); },
                  }))
                : null,
              h('label', null, '环境变量，一行一个 KEY=value。保存后不再显示',
                h('textarea', {
                  className: 'tap-area',
                  value: mcpEnv,
                  'aria-label': 'MCP 环境变量',
                  onChange: function (event) { setMcpEnv(event.target.value); },
                })),
              h('label', null, '请求头，一行一个 Name=value。保存后不再显示',
                h('textarea', {
                  className: 'tap-area',
                  value: mcpHeaders,
                  'aria-label': 'MCP 请求头',
                  onChange: function (event) { setMcpHeaders(event.target.value); },
                })),
              h('div', { className: 'tap-tools' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('把 ' + (mcpName.trim() || '这个 MCP') + ' 写入 mcp/mcp.yaml，并只推送这个文件。DeepSeek Harness 不会加载它。', {
                      action: 'mcp-save',
                      confirm: 'save-mcp',
                      name: mcpName.trim(),
                      transport: mcpTransport,
                      description: mcpDescription,
                      command: mcpCommand,
                      args: mcpArgs,
                      url: mcpUrl,
                      env: mcpEnv,
                      headers: mcpHeaders,
                    });
                  },
                }, '保存并推送'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('从仓库根 mcp.yaml 删除 ' + (mcpName.trim() || '这个 MCP') + '，并推送这个文件。', {
                      action: 'mcp-delete',
                      confirm: 'delete-mcp',
                      name: mcpName.trim(),
                    });
                  },
                }, '从仓库删除'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('把团队 MCP 注入 TeamAI 支持的其他代理。DeepSeek Harness 不加载它们。', {
                      action: 'mcp-inject',
                      confirm: 'inject-mcp',
                    });
                  },
                }, '注入到其他代理'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('从其他代理的本机配置里移除 TeamAI 管理的 MCP。团队仓库不变。', {
                      action: 'mcp-clear-local',
                      confirm: 'clear-local-mcp',
                    });
                  },
                }, '从其他代理移除')))),
          h('section', { className: 'tap-section' },
            h('h2', null, '同一仓库里的其他资源'),
            h('p', { className: 'tap-note' }, '这些和技能、MCP 一样，是 TeamAI 放进团队仓库、给成员一起管理的东西。0 表示这份仓库还没放。'),
            h('div', { className: 'tap-tabs', role: 'tablist', 'aria-label': '其他团队资源' }, groups.map(function (group) {
              return h('button', {
                key: group.id,
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': resourceTab === group.id ? 'true' : 'false',
                onClick: function () { setResourceTab(group.id); },
              }, group.label + ' ' + group.items.length);
            })),
            h('p', { className: 'tap-note' }, OTHER_NOTES[activeGroup.id] || ''),
            activeGroup.items.length
              ? activeGroup.items.map(function (item, index) {
                return h(Row, {
                  key: activeGroup.id + '-' + index + '-' + item.name,
                  title: item.name,
                  aside: null,
                  detail: item.detail,
                  meta: item.meta,
                });
              })
              : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有这一类。' : '还没有 TeamAI 配置。'))),
          h('p', { className: 'tap-foot' }, '安装、初始化、技能同步、MCP 和提示词都在这个页面完成。环境变量值、密钥、MCP 的命令、参数、请求头和地址写进仓库之后不再显示。')));
    }

    function apply(ctx) {
      try {
        ensureStyle();
        var slots = ctx && ctx.slots;
        if (!slots || typeof slots.inject !== 'function' || typeof slots.register !== 'function') {
          warn(ctx, new Error('slots 服务不存在，侧边栏没有注册'));
          return;
        }
        slots.inject('main', function () {
          return slots.register({ name: 'main', key: PANEL_ID }, TeamAIPage);
        });
        slots.inject('sidebar.panellist', function () {
          return slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 40,
            label: '团队技能',
          }, PanelIcon);
        });
      } catch (err) {
        warn(ctx, err);
      }
    }

    exports.name = 'dsh-teamai-panel';
    exports.inject = ['slots'];
    exports.apply = apply;
    return module.exports;
  },
});
