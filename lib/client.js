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
      '@keyframes tap-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}',
      '@keyframes tap-pulse{0%,100%{opacity:1;}50%{opacity:0.45;}}',
      '.tap-spinner{display:inline-block;width:13px;height:13px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-2px;margin-right:6px;animation:tap-spin .75s linear infinite;}',
      '.tap-busy-banner{display:flex;align-items:center;gap:14px;margin:0 0 16px;padding:14px 18px;border-radius:14px;background:var(--dsw-alias-state-business-tertiary,color-mix(in srgb,#3b82f6 14%,transparent));border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,#3b82f6 30%,transparent));color:var(--dsw-alias-label-primary,inherit);}',
      '.tap-busy-banner .tap-spinner{width:22px;height:22px;border-width:2.5px;border-color:var(--dsw-alias-state-business-primary,#3b82f6);border-right-color:transparent;margin:0;}',
      '.tap-busy-title{font-weight:630;font-size:13.5px;margin:0;}',
      '.tap-busy-hint{font-size:12px;color:var(--dsw-alias-label-secondary,inherit);animation:tap-pulse 1.8s ease-in-out infinite;margin:3px 0 0;}',
      '.tap-push-box{margin:12px 0 16px;padding:12px 16px;border-radius:12px;background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 5%,transparent));border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 10%,transparent));}',
      '.tap-push-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;}',
      '.tap-push-form{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
      '.tap-cfg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0;}',
      '.tap-cfg-item{padding:10px 14px;border-radius:12px;background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 5%,transparent));border:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 8%,transparent));}',
      '.tap-cfg-item small{display:block;font-size:11.5px;color:var(--dsw-alias-label-tertiary,inherit);}',
      '.tap-cfg-item strong{display:block;margin-top:3px;font-size:13px;word-break:break-all;}',
      '.tap-modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.52);backdrop-filter:blur(3px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;animation:tap-fade-in .12s ease-out;}',
      '@keyframes tap-fade-in{from{opacity:0;}to{opacity:1;}}',
      '.tap-modal{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-app,#1e1e1e));border:1px solid var(--dsw-alias-border-l1,color-mix(in srgb,currentColor 15%,transparent));box-shadow:0 12px 36px rgba(0,0,0,0.36);border-radius:14px;width:100%;max-width:540px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;animation:tap-scale-up .15s ease-out;}',
      '@keyframes tap-scale-up{from{transform:scale(0.96);opacity:0;}to{transform:scale(1);opacity:1;}}',
      '.tap-modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 10%,transparent));}',
      '.tap-modal-head h3{margin:0;font-size:14px;font-weight:600;}',
      '.tap-modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--dsw-alias-label-secondary,inherit);line-height:1;padding:2px 8px;border-radius:6px;}',
      '.tap-modal-close:hover{background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 10%,transparent));}',
      '.tap-modal-body{padding:16px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}',
      '.tap-modal-foot{padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l2,color-mix(in srgb,currentColor 10%,transparent));display:flex;align-items:center;justify-content:flex-end;gap:10px;background:var(--dsw-alias-bg-layer-2,color-mix(in srgb,currentColor 4%,transparent));}',
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
        stroke: 'currentColor',
        strokeWidth: 1.3,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      h('circle', { cx: 6, cy: 5.2, r: 2.2 }),
      h('path', { d: 'M 1.5 13.5 C 1.5 11 3.5 9.5 6 9.5 C 8.5 9.5 10.5 11 10.5 13.5' }),
      h('path', { d: 'M 9.8 3.3 C 10.7 3.7 11.4 4.5 11.4 5.5 C 11.4 6.5 10.7 7.3 9.8 7.7' }),
      h('path', { d: 'M 11.5 10.2 C 12.8 10.7 14 11.8 14 13.5' }));
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
        otherEvents: 0,
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
        stats.otherEvents += row.otherCount || 0;
        if ((row.dshCount || 0) + (row.otherCount || 0) > 0) stats.used += 1;
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

    function renderBusyBanner(busy) {
      if (!busy) return null;
      var title = '正在处理操作...';
      var hint = '请稍候，操作正在后台执行…';
      if (busy === 'install') {
        title = '正在安装 TeamAI CLI (npm install -g teamai-cli)...';
        hint = '正在通过 npm 下载并安装全局包，这通常需要 10~30 秒，请耐心等待…';
      } else if (busy === 'init') {
        title = '正在初始化团队仓库...';
        hint = '正在克隆或链接仓库骨架并注册 DSH 代理，请稍候…';
      } else if (busy === 'pull') {
        title = '正在同步团队资源 (teamai pull)...';
        hint = '正在拉取当前配置下发的全部技能、规则、环境变量与钩子…';
      } else if (busy === 'skill-push' || busy === 'push-skill') {
        title = '正在推送到团队仓库 (teamai push)...';
        hint = '正在将本地技能变更提交到团队仓库，请稍候…';
      } else if (busy === 'skill-push-all' || busy === 'push-all-skills') {
        title = '正在推送所有本地技能 (teamai push --all)...';
        hint = '正在扫描并推送本机所有新技能和变更，请稍候…';
      } else if (busy === 'config-update' || busy === 'update-config') {
        title = '正在更新工作区配置...';
        hint = '正在保存角色与项目设置，请稍候…';
      } else if (busy === 'workspace-delete' || busy === 'delete-workspace') {
        title = '正在删除工作区配置...';
        hint = '正在移除本地工作区配置文件，请稍候…';
      } else if (busy === 'skill-delete' || busy === 'delete-skill') {
        title = '正在删除技能...';
        hint = '正在从团队仓库及本机 AI 工具中移除该技能，请稍候…';
      } else if (busy === 'prompt-push' || busy === 'push-prompt') {
        title = '正在推送提示词到团队仓库...';
        hint = '正在将提示词文件提交到团队仓库，请稍候…';
      } else if (busy === 'prompt-push-all' || busy === 'push-all-prompts') {
        title = '正在推送全部提示词...';
        hint = '正在将所有提示词提交到团队仓库，请稍候…';
      } else if (busy === 'mcp-push' || busy === 'push-mcp') {
        title = '正在推送 MCP 到团队仓库...';
        hint = '正在将团队 MCP 配置提交到团队仓库，请稍候…';
      } else if (busy === 'mcp-push-all' || busy === 'push-all-mcp') {
        title = '正在推送全部 MCP 配置...';
        hint = '正在将 MCP 配置提交到团队仓库，请稍候…';
      }
      return h('div', { className: 'tap-busy-banner', role: 'status', 'aria-live': 'polite' },
        h('div', { className: 'tap-spinner' }),
        h('div', null,
          h('div', { className: 'tap-busy-title' }, title),
          h('div', { className: 'tap-busy-hint' }, hint)));
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
      var pageState = React.useState('setup');
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
      var isAdmin = Boolean(selected && (
        selected.isAdmin ||
        selected.scope === 'user' ||
        /admin|architect|maintainer|owner|lead/i.test(selected.role || '')
      ));
      var rows = (selected && selected.rows) || [];
      var needle = filter.trim().toLowerCase();
      var visibleRows = rows.filter(function (row) { return matches(row, needle); });
      var stats = summarize(visibleRows);
      var repoRows = visibleRows.filter(function (row) { return row.inTeamRepo; });
      var catalogRows = visibleRows.filter(function (row) { return row.visible; });
      var usageRows = visibleRows.filter(function (row) { return (row.dshCount || 0) + (row.otherCount || 0) > 0; })
        .sort(function (a, b) {
          var totalB = (b.dshCount || 0) + (b.otherCount || 0);
          var totalA = (a.dshCount || 0) + (a.otherCount || 0);
          return totalB - totalA || a.name.localeCompare(b.name);
        });
      var shownId = workspaceId || (selected && selected.id) || '';
      var sandboxNote = snapshot && snapshot.sandbox && snapshot.sandbox.note;
      var sourceMax = 0;
      SOURCES.forEach(function (source) {
        if (stats.sources[source.id] > sourceMax) sourceMax = stats.sources[source.id];
      });
      var usageMax = usageRows.length ? ((usageRows[0].dshCount || 0) + (usageRows[0].otherCount || 0)) : 0;
      var deliveryMax = Math.max(stats.deliver, stats.excluded, 1);
      var list = tab === 'catalog' ? catalogRows : repoRows;
      var inventory = (selected && selected.inventory) || {};
      var mcpItems = (inventory.mcp || []).filter(function (item) { return itemMatches(item, needle); });
      var localMcpItems = (inventory.localMcp || []).filter(function (item) { return itemMatches(item, needle); });
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
      var totalOtherCount = 0;
      for (var gi = 0; gi < groups.length; gi += 1) {
        totalOtherCount += groups[gi].items.length;
      }
      var promptItems = (inventory.prompts || []).filter(function (item) { return itemMatches(item, needle); });
      var localPromptItems = (inventory.localPrompts || []).filter(function (item) { return itemMatches(item, needle); });
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
      var roleInputState = React.useState('');
      var roleInput = roleInputState[0];
      var setRoleInput = roleInputState[1];
      var projectsInputState = React.useState('');
      var projectsInput = projectsInputState[0];
      var setProjectsInput = projectsInputState[1];
      var pushSkillInputState = React.useState('');
      var pushSkillInput = pushSkillInputState[0];
      var setPushSkillInput = pushSkillInputState[1];
      var showConfigEditState = React.useState(false);
      var showConfigEdit = showConfigEditState[0];
      var setShowConfigEdit = showConfigEditState[1];
      var showNewWorkspaceState = React.useState(false);
      var showNewWorkspace = showNewWorkspaceState[0];
      var setShowNewWorkspace = showNewWorkspaceState[1];
      var editRoleState = React.useState('');
      var editRole = editRoleState[0];
      var setEditRole = editRoleState[1];
      var editProjectsState = React.useState('');
      var editProjects = editProjectsState[0];
      var setEditProjects = editProjectsState[1];
      var editRepoState = React.useState('');
      var editRepo = editRepoState[0];
      var setEditRepo = editRepoState[1];
      var showPromptFormState = React.useState(false);
      var showPromptForm = showPromptFormState[0];
      var setShowPromptForm = showPromptFormState[1];
      var showMcpFormState = React.useState(false);
      var showMcpForm = showMcpFormState[0];
      var setShowMcpForm = showMcpFormState[1];

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
          if (data.ok && payload.action === 'workspace-delete') {
            setWorkspaceId('');
            setShowConfigEdit(false);
            setShowNewWorkspace(false);
          }
          if (data.ok && payload.action !== 'prompt-read') setReload(function (value) { return value + 1; });
          setBusy('');
        }).catch(function (err) {
          setNotice(err && err.message ? err.message : '请求失败');
          setBusy('');
        });
      }
      function pushSkillButton(name) {
        if (!name || name === 'teamai') return null;
        return h('button', {
          className: 'tap-button',
          type: 'button',
          disabled: busy ? true : undefined,
          onClick: function () {
            ask('把 ' + name + ' 推送到团队仓库。只推这一个技能，本机其他还没推送的技能不会一起走。', {
              action: 'skill-push',
              confirm: 'push-skill',
              name: name,
            });
          },
        }, busy === 'skill-push' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '推送中') : '推送');
      }

      function pushPromptButton(name) {
        if (!name) return null;
        return h('button', {
          className: 'tap-button',
          type: 'button',
          disabled: busy ? true : undefined,
          onClick: function () {
            ask('把提示词「' + name + '」推送到团队仓库。', {
              action: 'prompt-push',
              confirm: 'push-prompt',
              name: name,
            });
          },
        }, busy === 'prompt-push' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '推送中') : '推送');
      }

      function pushMcpButton(name) {
        if (!name) return null;
        return h('button', {
          className: 'tap-button',
          type: 'button',
          disabled: busy ? true : undefined,
          onClick: function () {
            ask('把 MCP「' + name + '」推送到团队仓库。', {
              action: 'mcp-push',
              confirm: 'push-mcp',
              name: name,
            });
          },
        }, busy === 'mcp-push' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '推送中') : '推送');
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
                h('p', { className: 'tap-kicker' }, 'Teamai 资源中心'),
                h('h1', { className: 'tap-title' }, pageTab === 'setup' ? '开始' : pageTab === 'mcp' ? '团队 MCP' : pageTab === 'prompts' ? '团队提示词' : pageTab === 'other' ? '团队其他资源' : pageTab === 'stats' ? '管理统计' : '团队技能'),
                h('p', { className: 'tap-remote' }, selected
                  ? ((selected.scope === 'project' ? '项目' : '用户') + ' · ' + (selected.label || '当前工作区') + (selected.username ? ' · ' + selected.username : '') + (selected.repoRemote ? ' · ' + selected.repoRemote : ''))
                  : '还没有读到 TeamAI 工作区')),
              h('div', { className: 'tap-tools' },
              pageTab === 'setup' ? null : h('input', {
                className: 'tap-field tap-search',
                value: filter,
                placeholder: pageTab === 'mcp' ? '筛选 MCP' : pageTab === 'prompts' ? '筛选提示词' : pageTab === 'other' ? '筛选规则、文档等' : pageTab === 'stats' ? '筛选统计技能' : '筛选技能',
                'aria-label': pageTab === 'mcp' ? '筛选 MCP' : pageTab === 'prompts' ? '筛选提示词' : pageTab === 'other' ? '筛选规则、文档等' : pageTab === 'stats' ? '筛选统计技能' : '筛选技能',
                onChange: function (event) { setFilter(event.target.value); },
              }),
              snapshot && snapshot.workspaces && snapshot.workspaces.length > 0
                ? h('select', {
                  className: 'tap-field',
                  'aria-label': '工作区',
                  value: showNewWorkspace ? '__new__' : shownId,
                  onChange: function (event) {
                    if (event.target.value === '__new__') {
                      setShowNewWorkspace(true);
                      setPageTab('setup');
                    } else {
                      setShowNewWorkspace(false);
                      setWorkspaceId(event.target.value);
                    }
                  },
                },
                snapshot.workspaces.map(function (item) {
                  return h('option', { key: item.id, value: item.id }, item.label + (item.scope === 'project' ? ' · 项目' : ' · 用户') + (item.role ? ' · 角色:' + item.role : ''));
                }),
                h('option', { value: '__new__' }, '+ 新增工作区/仓库'))
                : null,
              h('button', {
                className: 'tap-button',
                type: 'button',
                onClick: function () { setReload(reload + 1); },
              }, status === 'loading' ? '读取中' : '刷新'))),
            h('div', { className: 'tap-switch', role: 'tablist', 'aria-label': '开始、技能、MCP、提示词和其他资源' },
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'setup' ? 'true' : 'false',
                onClick: function () { setPageTab('setup'); },
              }, '开始'),
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
              }, 'MCP ' + ((inventory.mcp || []).length || (localMcpItems.length ? localMcpItems.length + '可用' : 0))),
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'prompts' ? 'true' : 'false',
                onClick: function () { setPageTab('prompts'); },
              }, '提示词 ' + ((inventory.prompts || []).length || (localPromptItems.length ? localPromptItems.length + '可用' : 0))),
              h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'other' ? 'true' : 'false',
                onClick: function () { setPageTab('other'); },
              }, '其他 ' + totalOtherCount),
              isAdmin ? h('button', {
                className: 'tap-tab',
                type: 'button',
                role: 'tab',
                'aria-selected': pageTab === 'stats' ? 'true' : 'false',
                onClick: function () { setPageTab('stats'); },
              }, '统计') : null)),
          status === 'error' ? h('p', { className: 'tap-banner' }, '读不到快照：' + error) : null,
          sandboxNote ? h('p', { className: 'tap-banner' }, sandboxNote) : null,
          snapshot && snapshot.warnings && snapshot.warnings.length
            ? h('ul', { className: 'tap-warnings' }, snapshot.warnings.map(function (item, index) {
              return h('li', { key: index }, item);
            }))
            : null,
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
          renderBusyBanner(busy),
          notice ? h('p', { className: 'tap-note' }, notice) : null,
          pageTab === 'setup' ? h(React.Fragment, null,
          h('section', { className: 'tap-manage' },
            h('h2', null, '这台机器'),
            h('p', { className: 'tap-note' }, snapshot && snapshot.cli && snapshot.cli.installed
              ? ('teamai ' + (snapshot.cli.version || '已安装') + (selected
                ? '。仓库已经初始化。还没安装 teamai 的机器会在这里看到安装按钮；装好但还没有仓库时，填写 owner/repo 或 GitHub 地址再初始化。同步会拉取当前应该下发的全部技能，同时同步规则、文档、环境变量和钩子。'
                : '。还没有团队配置。'))
              : '还没有检测到 teamai。安装使用 npm 全局安装 teamai-cli。'),
            h('div', { className: 'tap-tools' },
              snapshot && snapshot.cli && snapshot.cli.installed ? null : h('button', {
                className: 'tap-button',
                type: 'button',
                disabled: busy ? true : undefined,
                onClick: function () {
                  ask('安装 teamai-cli。这会用 npm 安装到这台机器。', { action: 'install', confirm: 'install-teamai' });
                },
              }, busy === 'install' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '安装中') : '安装 TeamAI'),
              selected ? h('button', {
                className: 'tap-button',
                type: 'button',
                disabled: busy ? true : undefined,
                onClick: function () {
                  ask('同步团队资源。pull 会安装当前配置应该收到的全部技能，并同步规则、文档、环境变量和钩子。没有按单个技能拉取的命令。', { action: 'pull', confirm: 'pull' });
                },
              }, busy === 'pull' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '同步中') : '同步到本机') : null,
              selected ? h('button', {
                className: 'tap-button',
                type: 'button',
                onClick: function () {
                  if (!showConfigEdit) {
                    setEditRole(selected.role || '');
                    setEditProjects((selected.projects || []).join(', '));
                    setEditRepo(selected.repoRemote || '');
                  }
                  setShowConfigEdit(!showConfigEdit);
                },
              }, showConfigEdit ? '收起配置' : '修改配置') : null),
            selected ? h('div', { className: 'tap-cfg-grid' },
              h('div', { className: 'tap-cfg-item' },
                h('small', null, '团队仓库 (Remote)'),
                h('strong', null, selected.repoRemote || '未指定')),
              h('div', { className: 'tap-cfg-item' },
                h('small', null, '配置范围 (Scope)'),
                h('strong', null, selected.scope === 'project' ? '项目级 (当前工作区)' : '用户级 (~/.teamai)')),
              h('div', { className: 'tap-cfg-item' },
                h('small', null, '当前角色 (Role)'),
                h('strong', null, selected.role || '全部/未指定')),
              h('div', { className: 'tap-cfg-item' },
                h('small', null, '关联项目 (Projects)'),
                h('strong', null, (selected.projects && selected.projects.length) ? selected.projects.join(', ') : '全部项目'))
            ) : null,
            (selected && showConfigEdit) ? h('div', { className: 'tap-form' },
              h('h3', { style: { margin: '8px 0 4px', fontSize: '13px' } }, '修改当前工作区配置'),
              h('p', { className: 'tap-note' }, '修改当前工作区生效的角色和项目，或更新团队仓库地址。保存后点击「同步到本机」生效。'),
              h('label', null, '角色 (Role)',
                h('input', {
                  className: 'tap-field',
                  value: editRole,
                  placeholder: (inventory.roles && inventory.roles.length ? '如: ' + inventory.roles.map(function (r) { return r.name; }).join(', ') : '输入角色 ID，如 dev, ops, fe'),
                  'aria-label': '角色',
                  onChange: function (event) { setEditRole(event.target.value); },
                })),
              (inventory.roles && inventory.roles.length) ? h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' } },
                h('span', { className: 'tap-note' }, '仓库可用角色：'),
                inventory.roles.map(function (r) {
                  return h('button', {
                    key: 'role-tag-' + r.name,
                    type: 'button',
                    className: 'tap-pill',
                    style: { cursor: 'pointer', border: 'none' },
                    onClick: function () { setEditRole(r.name); },
                  }, r.name + (r.detail ? ' (' + r.detail + ')' : ''));
                })) : null,
              h('label', null, '关联项目 (Projects，逗号分隔)',
                h('input', {
                  className: 'tap-field',
                  value: editProjects,
                  placeholder: (inventory.projects && inventory.projects.length ? '如: ' + inventory.projects.map(function (p) { return p.name; }).join(', ') : '输入项目 ID，如 proj-a, proj-b'),
                  'aria-label': '项目',
                  onChange: function (event) { setEditProjects(event.target.value); },
                })),
              (inventory.projects && inventory.projects.length) ? h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' } },
                h('span', { className: 'tap-note' }, '仓库可用项目：'),
                inventory.projects.map(function (p) {
                  return h('button', {
                    key: 'proj-tag-' + p.name,
                    type: 'button',
                    className: 'tap-pill',
                    style: { cursor: 'pointer', border: 'none' },
                    onClick: function () {
                      var cur = editProjects.trim();
                      setEditProjects(cur ? cur + ', ' + p.name : p.name);
                    },
                  }, p.name + (p.detail ? ' (' + p.detail + ')' : ''));
                })) : null,
              h('label', null, '团队仓库地址 (Remote URL)',
                h('input', {
                  className: 'tap-field',
                  value: editRepo,
                  placeholder: selected.repoRemote || 'owner/repo 或完整仓库地址',
                  'aria-label': '团队仓库地址',
                  onChange: function (event) { setEditRepo(event.target.value); },
                })),
              h('div', { className: 'tap-tools' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('保存角色与项目配置到本地 config.yaml。', {
                      action: 'config-update',
                      confirm: 'update-config',
                      role: editRole,
                      projects: editProjects,
                      repo: editRepo.trim() || undefined,
                    });
                  },
                }, busy === 'config-update' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '保存中') : '保存配置'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('重新初始化该工作区（强制覆盖本地配置并重新拉取仓库骨架）。', {
                      action: 'init',
                      confirm: 'init',
                      repo: editRepo.trim() || selected.repoRemote,
                      scope: selected.scope,
                      role: editRole.trim() || undefined,
                      project: editProjects.trim() || undefined,
                      force: true,
                    });
                  },
                }, busy === 'init' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '初始化中') : '重新初始化 (Force Init)'),
                h('button', {
                  className: 'tap-button',
                  style: { color: 'var(--dsw-alias-state-warn-label, #b54708)' },
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    ask('删除当前工作区配置（' + selected.label + ' · ' + (selected.repoRemote || '无远程') + '）。删除后该工作区将从本插件中移除。', {
                      action: 'workspace-delete',
                      confirm: 'delete-workspace',
                    });
                  },
                }, busy === 'workspace-delete' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '删除中') : '删除该配置'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  onClick: function () { setShowConfigEdit(false); },
                }, '取消'))
            ) : null,
            (!selected || showNewWorkspace) && snapshot && snapshot.cli && snapshot.cli.installed ? h('div', { className: 'tap-form' },
              h('p', { className: 'tap-note' }, showNewWorkspace
                ? '初始化并关联一个新仓库或项目级工作区。页面不收集令牌，认证用这台机器上已经登录的 Git。'
                : '如果这份仓库还没有 teamai.yaml，初始化会向默认分支推送一份空骨架。页面不收集令牌，认证用这台机器上已经登录的 Git。'),
              h('label', null, '团队仓库',
                h('input', {
                  className: 'tap-field',
                  value: repoInput,
                  placeholder: 'owner/repo 或 https://github.com/owner/repo',
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
              h('label', null, '角色 (Role，可选)',
                h('input', {
                  className: 'tap-field',
                  value: roleInput,
                  placeholder: '指定主角色 ID（可选，如 hai_dev）',
                  'aria-label': '初始化角色',
                  onChange: function (event) { setRoleInput(event.target.value); },
                })),
              h('label', null, '项目 (Projects，可选)',
                h('input', {
                  className: 'tap-field',
                  value: projectsInput,
                  placeholder: '激活的逻辑项目 ID，多个逗号分隔（可选）',
                  'aria-label': '初始化项目',
                  onChange: function (event) { setProjectsInput(event.target.value); },
                })),
              h('div', { className: 'tap-tools' },
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
                      role: roleInput.trim() || undefined,
                      project: projectsInput.trim() || undefined,
                      force: true,
                    });
                  },
                }, busy === 'init' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '初始化中') : '初始化'),
                showNewWorkspace ? h('button', {
                  className: 'tap-button',
                  type: 'button',
                  onClick: function () { setShowNewWorkspace(false); },
                }, '取消') : null)
            ) : null),
          h('section', { className: 'tap-section' },
            h('h2', null, '这份 DSH 能收到什么'),
            h('p', { className: 'tap-note' }, '对照 TeamAI 0.28 的工具矩阵。标记说的是 DeepSeek Harness 这条安装路径，不是仓库里有没有文件。'),
            h('div', { className: 'tap-caps' }, ((snapshot && snapshot.dsh) || []).map(function (item) {
              return h('article', { key: item.id, className: 'tap-cap' },
                h('small', { className: 'tap-mark tap-mark-' + (item.mark || 'unknown') }, MARKS[item.mark] || MARKS.unknown),
                h('b', null, item.label),
                h('span', null, item.detail));
            })))) : pageTab === 'skills' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '概览'),
            h('p', { className: 'tap-note' }, needle
              ? '数字跟着上面的筛选走。'
              : '团队仓库与实际生效目录分开显示。'),
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
          selected ? h('div', { className: 'tap-tools', style: { marginTop: 12 } },
            h('button', {
              className: 'tap-button',
              type: 'button',
              disabled: busy ? true : undefined,
              onClick: function () {
                ask('安装到本机。pull 会安装当前配置应该收到的全部技能，并同步规则、文档、环境变量和钩子。没有按单个技能拉取的命令。', { action: 'pull', confirm: 'pull' });
              },
            }, busy === 'pull' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '安装中') : '安装到本机')) : null,
          h('div', { className: 'tap-tabs', role: 'tablist', 'aria-label': '技能清单' },
            [
              ['repo', '团队仓库', repoRows.length],
              ['catalog', '实际生效', catalogRows.length],
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
            ? '团队仓库里的技能。安装到本机会按当前配置全部安装。'
            : '本机合并后真正加载的那一份。可以把新增或修改的技能推送到团队仓库。'),
          list.length
            ? list.map(function (row) {
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
                  actions: h(React.Fragment, null,
                    pushSkillButton(row.name),
                    (row.inTeamRepo && row.name !== 'teamai') ? h('button', {
                      className: 'tap-button',
                      style: { color: 'var(--dsw-alias-state-warn-label, #b54708)' },
                      type: 'button',
                      disabled: busy ? true : undefined,
                      onClick: function () {
                        ask('从团队仓库及本机工具中彻底删除技能 ' + row.name + '。这会提交并推送到团队仓库。', {
                          action: 'skill-delete',
                          confirm: 'delete-skill',
                          name: row.name,
                        });
                      },
                    }, busy === 'skill-delete' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '删除中') : '删除') : null),
                });
              }
              return h(Row, {
                key: 'repo-' + row.name + (row.namespace || ''),
                title: row.name,
                aside: row.excluded ? '已排除' : '将会下发',
                tone: row.excluded ? 'warn' : '',
                detail: row.description,
                meta: (row.namespace ? '命名空间 ' + row.namespace + ' · ' : '') + (row.repoCopies || []).join('，'),
                actions: h(React.Fragment, null,
                  h('button', {
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
                  row.name !== 'teamai' ? h('button', {
                    className: 'tap-button',
                    style: { color: 'var(--dsw-alias-state-warn-label, #b54708)' },
                    type: 'button',
                    disabled: busy ? true : undefined,
                    onClick: function () {
                      ask('从团队仓库及本机工具中彻底删除技能 ' + row.name + '。这会提交并推送到团队仓库。', {
                        action: 'skill-delete',
                        confirm: 'delete-skill',
                        name: row.name,
                      });
                    },
                  }, busy === 'skill-delete' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '删除中') : '删除') : null),
              });
            })
            : (tab === 'repo' && catalogRows.length
              ? h('div', { className: 'tap-empty', style: { padding: '24px 16px', textAlign: 'center' } },
                  h('p', { style: { marginBottom: 12, color: 'var(--dsw-alias-label-muted, #667085)' } },
                    '团队仓库暂无技能（新初始化的空骨架仓库）。本机已生效 ' + catalogRows.length + ' 个技能，可切换到「实际生效」推送到团队仓库。'),
                  h('button', {
                    className: 'tap-button tap-button-primary',
                    type: 'button',
                    onClick: function () { setTab('catalog'); },
                  }, '查看本机生效技能 (' + catalogRows.length + ')'))
              : h('p', { className: 'tap-empty' }, !selected
                  ? '还没有 TeamAI 配置。在这台机器上运行 teamai init 之后再打开。'
                  : '这一栏里没有匹配的技能。'))) : pageTab === 'prompts' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '团队提示词'),
            h('p', { className: 'tap-note' }, '提示词是 Markdown 文件，工作流用 prompt_file 引用。区分团队仓库与本机配置，只有本机列表支持发布。'),
            h('div', { className: 'tap-tools', style: { marginBottom: '14px' } },
              h('button', {
                className: 'tap-button',
                type: 'button',
                onClick: function () {
                  setPromptName('');
                  setPromptBody('');
                  setShowPromptForm(true);
                },
              }, '+ 新建提示词')),
            h('div', { className: 'tap-tabs', role: 'tablist', 'aria-label': '提示词清单' },
              [
                ['repo', '团队仓库', promptItems.length],
                ['catalog', '本机提示词', localPromptItems.length],
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
            tab === 'catalog'
              ? (localPromptItems.length
                ? localPromptItems.map(function (item, index) {
                  return h(Row, {
                    key: 'prompt-cat-' + index + '-' + item.name,
                    title: item.name,
                    aside: '本机',
                    detail: item.detail,
                    meta: item.meta,
                    actions: h(React.Fragment, null,
                      pushPromptButton(item.name),
                      h('button', {
                        className: 'tap-button',
                        type: 'button',
                        disabled: busy ? true : undefined,
                        onClick: function () {
                          setPromptName(item.name);
                          setShowPromptForm(true);
                          submit({ action: 'prompt-read', name: item.name });
                        },
                      }, '编辑')),
                  });
                })
                : h('p', { className: 'tap-empty' }, '本机暂无未同步的提示词。点击上方「+ 新建提示词」配置后可推送到团队仓库。'))
              : (promptItems.length
                ? promptItems.map(function (item, index) {
                  return h(Row, {
                    key: 'prompt-repo-' + index + '-' + item.name,
                    title: item.name,
                    aside: '仓库',
                    detail: item.detail,
                    actions: h(React.Fragment, null,
                      h('button', {
                        className: 'tap-button',
                        type: 'button',
                        disabled: busy ? true : undefined,
                        onClick: function () {
                          setPromptName(item.name);
                          setShowPromptForm(true);
                          submit({ action: 'prompt-read', name: item.name });
                        },
                      }, '编辑'),
                      h('button', {
                        className: 'tap-button',
                        style: { color: 'var(--dsw-alias-state-warn-label, #b54708)' },
                        type: 'button',
                        disabled: busy ? true : undefined,
                        onClick: function () {
                          ask('从仓库删除提示词 ' + item.name + '。', {
                            action: 'prompt-delete',
                            confirm: 'delete-prompt',
                            name: item.name,
                          });
                        },
                      }, busy === 'prompt-delete' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '删除中') : '从仓库删除')),
                  });
                })
                : (localPromptItems.length
                  ? h('div', { className: 'tap-empty', style: { padding: '24px 16px', textAlign: 'center' } },
                      h('p', { style: { marginBottom: 12, color: 'var(--dsw-alias-label-muted, #667085)' } },
                        '团队仓库暂无提示词文件。本机检测到 ' + localPromptItems.length + ' 个提示词，可切换到「本机提示词」发布至团队仓库。'),
                      h('button', {
                        className: 'tap-button tap-button-primary',
                        type: 'button',
                        onClick: function () { setTab('catalog'); },
                      }, '查看本机提示词 (' + localPromptItems.length + ')'))
                  : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有提示词。' : '还没有 TeamAI 配置。')))),
          showPromptForm ? h('div', {
            className: 'tap-modal-overlay',
            onClick: function (e) { if (e.target === e.currentTarget) setShowPromptForm(false); },
          },
            h('div', { className: 'tap-modal', role: 'dialog', 'aria-modal': 'true' },
              h('div', { className: 'tap-modal-head' },
                h('h3', null, promptName ? '编辑提示词：' + promptName : '新建提示词'),
                h('button', {
                  className: 'tap-modal-close',
                  type: 'button',
                  'aria-label': '关闭',
                  onClick: function () { setShowPromptForm(false); },
                }, '×')),
              h('div', { className: 'tap-modal-body tap-form', style: { border: 'none', padding: 0 } },
                h('label', null, '文件名称',
                  h('input', {
                    className: 'tap-field',
                    value: promptName,
                    placeholder: 'review.md',
                    'aria-label': '提示词文件',
                    onChange: function (event) { setPromptName(event.target.value); },
                  })),
                h('label', null, '提示词正文 (Markdown 格式)',
                  h('textarea', {
                    className: 'tap-area',
                    style: { minHeight: 200 },
                    value: promptBody,
                    placeholder: '编写提示词模板正文...',
                    'aria-label': '提示词正文',
                    onChange: function (event) { setPromptBody(event.target.value); },
                  }))),
              h('div', { className: 'tap-modal-foot' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  onClick: function () { setShowPromptForm(false); },
                }, '取消'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    setShowPromptForm(false);
                    ask('保存 ' + (promptName.trim() || '这个提示词') + '，并推送到团队仓库的当前分支。', {
                      action: 'prompt-save',
                      confirm: 'save-prompt',
                      name: promptName.trim(),
                      text: promptBody,
                    });
                  },
                }, busy === 'prompt-save' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '保存中') : '保存并推送')))) : null)
          : pageTab === 'other' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '同一仓库里的其他资源'),
            h('p', { className: 'tap-note' }, '这些和技能、MCP、提示词一样，是 TeamAI 放进团队仓库、给成员一起管理的东西。0 表示这份仓库还没放。'),
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
              : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有这一类。' : '还没有 TeamAI 配置。')))
          : pageTab === 'stats' ? h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '团队技能与贡献统计'),
            h('p', { className: 'tap-note' }, '统计基于团队仓库配置、成员档案及本机 AI 助手调用事件。向管理员提供全局技能使用趋势与团队成员协同概览。'),
            h('div', { className: 'tap-kpis' },
              h(Kpi, { label: '仓库技能', value: repoRows.length, hint: '团队统一共享的技能总数' }),
              h(Kpi, { label: '累计调用', value: stats.dshEvents + stats.otherEvents, hint: stats.used + ' 个技能已被实际调用' }),
              h(Kpi, { label: 'DSH 调用', value: stats.dshEvents, hint: 'DeepSeek Harness 会话调用' }),
              h(Kpi, { label: '团队成员', value: (inventory.members || []).length, hint: '仓库已注册成员档案' })),
            h('div', { className: 'tap-split', style: { marginTop: 14 } },
              h('section', { className: 'tap-card' },
                h('h3', null, '技能调用排行'),
                h('p', { className: 'tap-note' }, '按总调用次数（DSH 与其他 AI 助手）降序排列。'),
                usageRows.length
                  ? usageRows.map(function (row) {
                    var total = (row.dshCount || 0) + (row.otherCount || 0);
                    return h('div', { key: 'stat-skill-' + row.name, style: { marginBottom: 10 } },
                      h(Bar, {
                        label: row.name,
                        value: total,
                        max: Math.max(usageMax, 1),
                        tone: 'ok',
                      }),
                      h('div', { style: { display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--dsw-alias-label-tertiary, inherit)', marginLeft: 4, marginTop: 2 } },
                        h('span', null, 'DSH: ' + (row.dshCount || 0) + ' 次'),
                        row.otherCount ? h('span', null, '其他工具: ' + row.otherCount + ' 次') : null,
                        row.lastUsed ? h('span', null, '最近一次: ' + row.lastUsed) : null));
                  })
                  : h('p', { className: 'tap-empty' }, '还没有检测到技能调用事件。当助手通过钩子触发技能时将自动累加。')),
              h('section', { className: 'tap-card' },
                h('h3', null, '团队成员与角色'),
                h('p', { className: 'tap-note' }, '团队成员档案与职责角色构成。'),
                (inventory.members && inventory.members.length)
                  ? h('div', { style: { display: 'grid', gap: '8px' } },
                    inventory.members.map(function (m) {
                      return h('div', { key: 'm-' + m.name, className: 'tap-cfg-item', style: { padding: '8px 12px' } },
                        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                          h('strong', { style: { fontSize: '12.5px' } }, m.name),
                          h('span', { className: 'tap-pill' }, m.role || '成员')),
                        m.projects && m.projects.length
                          ? h('small', { style: { color: 'var(--dsw-alias-label-tertiary, inherit)', marginTop: 4 } }, '参与项目: ' + m.projects.join(', '))
                          : null);
                    }))
                  : h('p', { className: 'tap-empty' }, '仓库 members/ 目录下尚未配置成员 YAML。')))))
          : h(React.Fragment, null,
          h('section', { className: 'tap-section' },
            h('h2', null, '团队 MCP'),
            h('p', { className: 'tap-note' }, '这些服务器和技能在同一个插件里，用上面的选项卡分开。DeepSeek Harness 不加载它们，teamai mcp inject 写的是别的代理。命令、参数、请求头、环境变量和地址可以写进仓库，保存之后不再显示。'),
            h('div', { className: 'tap-tools', style: { marginBottom: '14px' } },
              h('button', {
                className: 'tap-button',
                type: 'button',
                onClick: function () { setShowMcpForm(true); },
              }, '+ 配置新 MCP'),
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
              }, busy === 'mcp-inject' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '注入中') : '注入到其他代理'),
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
              }, busy === 'mcp-clear-local' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '移除中') : '从其他代理移除')),
            h('div', { className: 'tap-tabs', role: 'tablist', 'aria-label': 'MCP 清单' },
              [
                ['repo', '团队仓库', mcpItems.length],
                ['catalog', '本机 MCP', localMcpItems.length],
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
            tab === 'catalog'
              ? (localMcpItems.length
                ? localMcpItems.map(function (item, index) {
                  return h(Row, {
                    key: 'mcp-cat-' + index + '-' + item.name,
                    title: item.name,
                    aside: '本机',
                    detail: item.detail,
                    meta: item.meta,
                    actions: h(React.Fragment, null,
                      pushMcpButton(item.name)),
                  });
                })
                : h('p', { className: 'tap-empty' }, '本机暂无未同步的 MCP 服务器。点击上方「+ 配置新 MCP」配置后可推送到团队仓库。'))
              : (mcpItems.length
                ? mcpItems.map(function (item, index) {
                  return h(Row, {
                    key: 'mcp-repo-' + index + '-' + item.name,
                    title: item.name,
                    aside: '仓库',
                    detail: item.detail,
                    meta: item.meta,
                    actions: h(React.Fragment, null,
                      h('button', {
                        className: 'tap-button',
                        style: { color: 'var(--dsw-alias-state-warn-label, #b54708)' },
                        type: 'button',
                        disabled: busy ? true : undefined,
                        onClick: function () {
                          ask('从仓库根 mcp.yaml 删除 ' + item.name + '。', {
                            action: 'mcp-delete',
                            confirm: 'delete-mcp',
                            name: item.name,
                          });
                        },
                      }, busy === 'mcp-delete' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '删除中') : '从仓库删除')),
                  });
                })
                : (localMcpItems.length
                  ? h('div', { className: 'tap-empty', style: { padding: '24px 16px', textAlign: 'center' } },
                      h('p', { style: { marginBottom: 12, color: 'var(--dsw-alias-label-muted, #667085)' } },
                        '团队仓库暂无 MCP 服务器配置 (mcp.yaml)。本机检测到 ' + localMcpItems.length + ' 个可用 MCP 服务，可切换到「本机 MCP」发布至团队仓库。'),
                      h('button', {
                        className: 'tap-button tap-button-primary',
                        type: 'button',
                        onClick: function () { setTab('catalog'); },
                      }, '查看本机 MCP (' + localMcpItems.length + ')'))
                  : h('p', { className: 'tap-empty' }, selected ? '仓库里还没有 MCP。' : '还没有 TeamAI 配置。')))),
          showMcpForm ? h('div', {
            className: 'tap-modal-overlay',
            onClick: function (e) { if (e.target === e.currentTarget) setShowMcpForm(false); }
          },
            h('div', { className: 'tap-modal', role: 'dialog', 'aria-modal': 'true', style: { maxWidth: 560 } },
              h('div', { className: 'tap-modal-head' },
                h('h3', null, '配置新 MCP 服务器'),
                h('button', {
                  className: 'tap-modal-close',
                  type: 'button',
                  'aria-label': '关闭',
                  onClick: function () { setShowMcpForm(false); },
                }, '×')),
              h('div', { className: 'tap-modal-body tap-form', style: { border: 'none', padding: 0 } },
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
                  }))),
              h('div', { className: 'tap-modal-foot' },
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  onClick: function () { setShowMcpForm(false); },
                }, '取消'),
                h('button', {
                  className: 'tap-button',
                  type: 'button',
                  disabled: busy ? true : undefined,
                  onClick: function () {
                    setShowMcpForm(false);
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
                }, busy === 'mcp-save' ? h(React.Fragment, null, h('span', { className: 'tap-spinner' }), '保存中') : '保存并推送')))) : null),
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
            label: 'TeamAI 资源中心',
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
