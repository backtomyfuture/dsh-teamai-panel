window.__ModuleLoader__.load({
  id: 'dsh-teamai-panel',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var h = React.createElement;

    var PANEL_ID = 'teamai-skills';
    var ROUTE = '/teamai-panel/snapshot';
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
      '.tap-sticky{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 16px;margin:-22px -28px 18px;padding:18px 28px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-base,canvas) 88%,transparent);backdrop-filter:blur(12px);}',
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
      '.tap-foot{margin:28px 0 0;color:var(--dsw-alias-label-tertiary,color-mix(in srgb,currentColor 55%,transparent));font-size:12px;}',
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
        h(Pill, { text: props.aside, tone: props.tone }),
        props.detail ? h('p', { className: 'tap-desc' }, props.detail) : null,
        props.meta ? h('div', { className: 'tap-meta' }, props.meta) : null);
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

      return h('div', { className: 'tap-root' },
        h('div', { className: 'tap-page' },
          h('header', { className: 'tap-sticky' },
            h('div', null,
              h('p', { className: 'tap-kicker' }, 'TEAMAI'),
              h('h1', { className: 'tap-title' }, '团队技能'),
              h('p', { className: 'tap-remote' }, selected
                ? ((selected.scope === 'project' ? '项目' : '用户') + ' · ' + (selected.label || '当前工作区') + (selected.username ? ' · ' + selected.username : '') + (selected.repoRemote ? ' · ' + selected.repoRemote : ''))
                : '还没有读到 TeamAI 工作区')),
            h('div', { className: 'tap-tools' },
              h('input', {
                className: 'tap-field tap-search',
                value: filter,
                placeholder: '筛选技能',
                'aria-label': '筛选技能',
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
          status === 'error' ? h('p', { className: 'tap-banner' }, '读不到快照：' + error) : null,
          sandboxNote ? h('p', { className: 'tap-banner' }, sandboxNote) : null,
          snapshot && snapshot.warnings && snapshot.warnings.length
            ? h('ul', { className: 'tap-warnings' }, snapshot.warnings.map(function (item, index) {
              return h('li', { key: index }, item);
            }))
            : null,
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
              });
            })
            : h('p', { className: 'tap-empty' }, !selected
              ? '还没有 TeamAI 配置。在这台机器上运行 teamai init 之后再打开。'
              : tab === 'usage'
                ? (sandboxNote ? '目前没有读到 dsh 使用记录。不能据此判断没人用过。' : '还没有 tool 为 dsh 的使用记录。')
                : '这一栏里没有匹配的技能。'),
          h('p', { className: 'tap-foot' }, '这个页面只读。会话条数和 token 不在这里，排除名单仍用 teamai 命令修改。')));
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
