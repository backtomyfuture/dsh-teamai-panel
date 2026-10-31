window.__ModuleLoader__.load({
  id: 'dsh-teamai-panel',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var h = React.createElement;

    var PANEL_ID = 'teamai-skills';
    var ROUTE = '/teamai-panel/snapshot';
    var SOURCES = {
      'project-dsh': '项目 .dsh/skills · 优先级 100',
      'project-agents': '项目 .agents/skills · 优先级 200',
      'user-dsh': '用户 ~/.dsh/skills · 优先级 400',
      'user-agents': '用户 ~/.agents/skills · 优先级 500',
    };

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

    function pageStyle() {
      return {
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
        maxWidth: 920,
        margin: '0 auto',
        padding: '20px 22px 40px',
        color: 'inherit',
        font: '13px/1.5 ui-sans-serif, system-ui, sans-serif',
      };
    }

    function mutedStyle() {
      return { color: 'color-mix(in srgb, currentColor 68%, transparent)', margin: '4px 0 0' };
    }

    function cardStyle() {
      return {
        border: '1px solid color-mix(in srgb, currentColor 16%, transparent)',
        borderRadius: 10,
        padding: '10px 12px',
        marginTop: 8,
        background: 'color-mix(in srgb, currentColor 5%, transparent)',
      };
    }

    function rowHeadStyle() {
      return { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' };
    }

    function matches(row, filter) {
      if (!filter) return true;
      var hay = [row.name, row.namespace || '', row.description || ''].join(' ').toLowerCase();
      return hay.indexOf(filter) !== -1;
    }

    function Empty(props) {
      return h('p', { style: mutedStyle() }, props.text);
    }

    function SkillCard(props) {
      return h('article', { style: cardStyle() },
        h('div', { style: rowHeadStyle() },
          h('strong', null, props.title),
          h('span', { style: mutedStyle() }, props.aside)),
        props.detail ? h('div', { style: { marginTop: 4 } }, props.detail) : null,
        props.meta ? h('div', { style: mutedStyle() }, props.meta) : null);
    }

    function Section(props) {
      return h('section', { style: { marginTop: 22 } },
        h('h2', { style: { fontSize: 15, margin: '0 0 4px' } }, props.title),
        h('p', { style: mutedStyle() }, props.intro),
        props.children);
    }

    function deliveryText(row) {
      if (row.excluded) return '已排除，pull 不会下发';
      return 'pull 会按目录名下发';
    }

    function sourceText(row) {
      var label = SOURCES[row.visibleSource] || row.visibleSource || '未知目录';
      if (row.shadowed) return label + '。用户目录 ~/.dsh/skills 里也有同名副本，当前生效的不是那一份。';
      return label;
    }

    function TeamAIPage() {
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
      var repoRows = rows.filter(function (row) { return row.inTeamRepo && matches(row, needle); });
      var catalogRows = rows.filter(function (row) { return row.visible && matches(row, needle); });
      var usageRows = rows.filter(function (row) { return row.dshCount > 0 && matches(row, needle); });
      var shownId = workspaceId || (selected && selected.id) || '';
      var sandboxNote = snapshot && snapshot.sandbox && snapshot.sandbox.note;

      return h('div', { style: pageStyle() },
        h('div', { style: rowHeadStyle() },
          h('h1', { style: { fontSize: 20, margin: 0 } }, '团队技能'),
          h('button', {
            type: 'button',
            onClick: function () { setReload(reload + 1); },
            style: { font: 'inherit', color: 'inherit', background: 'transparent', border: '1px solid color-mix(in srgb, currentColor 24%, transparent)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' },
          }, '刷新')),
        h('p', { style: mutedStyle() }, '三份清单分开看：仓库里有什么、这个工作区实际加载哪一份、以及 DSH 用过几次。'),
        status === 'loading' ? h('p', { style: mutedStyle() }, '正在读取本机文件…') : null,
        status === 'error' ? h('p', { style: { color: '#b45309' } }, '读不到快照：' + error) : null,
        snapshot && snapshot.workspaces && snapshot.workspaces.length > 1
          ? h('label', { style: { display: 'block', marginTop: 12 } },
            '工作区',
            h('select', {
              value: shownId,
              onChange: function (event) { setWorkspaceId(event.target.value); },
              style: { display: 'block', marginTop: 4, font: 'inherit', color: 'inherit', background: 'transparent', maxWidth: '100%' },
            }, snapshot.workspaces.map(function (item) {
              return h('option', { key: item.id, value: item.id }, item.label + (item.scope === 'project' ? ' · 项目' : ' · 用户'));
            })))
          : null,
        selected
          ? h('p', { style: mutedStyle() },
            (selected.scope === 'project' ? '项目' : '用户') + ' · ' + (selected.label || '') +
            (selected.username ? ' · ' + selected.username : '') +
            (selected.repoRemote ? ' · ' + selected.repoRemote : ''))
          : null,
        sandboxNote ? h('p', { style: { marginTop: 12, padding: '8px 10px', borderRadius: 8, background: 'color-mix(in srgb, #d97706 18%, transparent)' } }, sandboxNote) : null,
        snapshot && snapshot.warnings && snapshot.warnings.length
          ? h('ul', { style: mutedStyle() }, snapshot.warnings.map(function (item, index) {
            return h('li', { key: index }, item);
          }))
          : null,
        h('label', { style: { display: 'block', marginTop: 12 } },
          '筛选名称',
          h('input', {
            value: filter,
            placeholder: '技能名',
            onChange: function (event) { setFilter(event.target.value); },
            style: { display: 'block', marginTop: 4, width: '100%', maxWidth: 320, font: 'inherit', color: 'inherit', background: 'transparent', border: '1px solid color-mix(in srgb, currentColor 24%, transparent)', borderRadius: 8, padding: '6px 8px' },
          })),
        h(Section, {
          title: '团队仓库',
          intro: '这是 pull 会看到的技能目录。排除名单按目录名匹配。命名空间会装平，标签和 deliveredInstead 不在这里重算。',
        }, repoRows.length
          ? repoRows.map(function (row) {
            return h(SkillCard, {
              key: 'repo-' + row.name + (row.namespace || ''),
              title: row.name,
              aside: deliveryText(row),
              detail: row.description,
              meta: (row.namespace ? '命名空间 ' + row.namespace + ' · ' : '') + (row.repoCopies || []).join('，'),
            });
          })
          : h(Empty, { text: selected ? '这份配置的 skills 目录里没有可读的技能。' : '还没有 TeamAI 配置。在这台机器上运行 teamai init 之后再打开。' })),
        h(Section, {
          title: '当前工作区实际生效',
          intro: '只看合并后的目录，并标出这份副本来自哪一层。项目里的同名技能不会被标成团队副本。优先级 300 的自定义目录没有读取。',
        }, catalogRows.length
          ? catalogRows.map(function (row) {
            return h(SkillCard, {
              key: 'cat-' + row.name,
              title: row.name,
              aside: row.installedUser ? '用户目录里有副本' : '用户目录里没有这份',
              detail: sourceText(row),
              meta: row.inTeamRepo ? '团队仓库里也有这个目录名' : '团队仓库里没有这个目录名',
            });
          })
          : h(Empty, { text: '四个已知技能目录里都没有 SKILL.md。' })),
        h(Section, {
          title: 'DSH 使用记录',
          intro: sandboxNote
            ? '次数只计 tool 为 dsh 的事件。记录可能写不下来，次数为 0 不表示没有使用。'
            : '次数只计 tool 为 dsh 的事件。最近时间取这些事件里最晚的 timestamp。',
        }, usageRows.length
          ? usageRows.map(function (row) {
            return h(SkillCard, {
              key: 'use-' + row.name,
              title: row.name,
              aside: row.dshCount + ' 次',
              detail: row.lastUsed ? '最近一次 ' + row.lastUsed : '这些事件没有时间戳',
              meta: row.otherCount ? '另有 ' + row.otherCount + ' 条其他工具的记录，不计入次数' : null,
            });
          })
          : h(Empty, {
            text: sandboxNote
              ? '目前没有读到 dsh 使用记录。沙箱可能让钩子写不进 TeamAI，不能据此判断没人用过。'
              : '还没有 tool 为 dsh 的使用记录。',
          })),
        h('p', { style: Object.assign({ marginTop: 28, fontSize: 12 }, mutedStyle()) },
          '次数来自 TeamAI 的 usage 记录，并且只要 tool 为 dsh 的事件。会话条数和 token 不在这里。这个页面只读，不会修改排除名单，也不会执行 pull。'));
    }

    function apply(ctx) {
      try {
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
