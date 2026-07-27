# -*- coding: utf-8 -*-
"""管理者用ページの「Claude Code 指示ルール一覧」(admin-rules.html)を生成する。

Claude Codeのメモリ(.mdファイル)を読み、このサイトに関係するルールだけを1枚のHTMLにまとめる。
ルールを追加・変更したらこのスクリプトを実行し直すと、ページが最新の内容に更新される。

    python tools/build-admin-rules.py

このサイトはGitHub Pagesで公開されるため、既定では何も公開しない。
公開するルールは下の PUBLISH に明示的に並べる(他プロジェクトのメモを載せないための安全策)。
"""
import io
import os
import re
import datetime

MEMORY_DIR = os.path.join(
    os.path.expanduser('~'), '.claude', 'projects',
    'C--Users-inqui-OneDrive--------80-Claude', 'memory')
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'admin-rules.html')

# このサイト(bizplan-lab-website)に関係するルールだけを公開する。
# 新しくルールを決めたらここに追記してから実行すること。
PUBLISH = [
    'trigger-button-design-rule',
    'clear-button-design-pattern',
    'header-nav-simplification',
    'unit-smaller-than-number-rule',
    'comma-format-numbers-everywhere',
    'hide-explanations-behind-help-tip',
    'recalc-on-commit-not-while-typing',
    'avoid-window-confirm-for-inline-actions',
    'scope-font-fixes-narrowly',
    'arial-bold-to-bahnschrift-rule',
    'tk-company-logo-spec',
    'bizplan-push-every-change',
    'reduce-token-heavy-browser-debugging',
]

TYPE_LABEL = {
    'feedback': '進め方の指示',
    'project': 'プロジェクト',
    'user': 'ユーザー',
    'reference': '参考資料',
}


def parse(path):
    """frontmatter付きmdを {name, description, type, modified, body} に分解する"""
    raw = io.open(path, encoding='utf-8').read()
    meta, body = {}, raw
    m = re.match(r'^---\n(.*?)\n---\n', raw, re.S)
    if m:
        body = raw[m.end():]
        for line in m.group(1).split('\n'):
            kv = re.match(r'^\s*([A-Za-z_]+):\s*(.*)$', line)
            if kv and kv.group(2).strip():
                meta.setdefault(kv.group(1), kv.group(2).strip())
    return {
        'name': meta.get('name', os.path.splitext(os.path.basename(path))[0]),
        'description': meta.get('description', ''),
        'type': meta.get('type', ''),
        'modified': (meta.get('modified', '') or '')[:10],
        'body': body.strip(),
    }


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def inline(s, known):
    """太字・コード・リンク・[[別ルールへの参照]]を変換する(エスケープ済み文字列に適用)"""
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'\[([^\]\[]+)\]\((https?://[^)]+)\)',
               r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)

    def wiki(m):
        key = m.group(1)
        if key in known:
            return '<a href="#%s">%s</a>' % (key, key)
        return '<span class="rule-ref-plain">%s</span>' % key
    return re.sub(r'\[\[([^\]]+)\]\]', wiki, s)


def md_to_html(body, known):
    out, buf, lis = [], [], []

    def flush_p():
        if buf:
            out.append('<p>' + inline(esc(' '.join(buf)).replace('&lt;br /&gt;', '<br />'), known) + '</p>')
            del buf[:]

    def flush_li():
        if lis:
            out.append('<ul>' + ''.join(
                '<li>' + inline(esc(x).replace('&lt;br /&gt;', '<br />'), known) + '</li>' for x in lis) + '</ul>')
            del lis[:]

    for line in body.split('\n'):
        t = line.rstrip()
        if not t.strip():
            flush_p(); flush_li(); continue
        if t.lstrip().startswith('- '):
            flush_p()
            lis.append(t.lstrip()[2:])
            continue
        h = re.match(r'^(#{1,4})\s+(.*)$', t)
        if h:
            flush_p(); flush_li()
            lv = min(4, len(h.group(1)) + 2)
            out.append('<h%d>%s</h%d>' % (lv, inline(esc(h.group(2)), known), lv))
            continue
        flush_li()
        buf.append(t.strip())
    flush_p(); flush_li()
    return '\n'.join(out)


def main():
    files = {}
    for fn in os.listdir(MEMORY_DIR):
        if fn.endswith('.md') and fn != 'MEMORY.md':
            files[os.path.splitext(fn)[0]] = os.path.join(MEMORY_DIR, fn)

    known = set(PUBLISH)
    rules = []
    for key in PUBLISH:
        if key not in files:
            print('  [skip] メモリに見つかりません:', key)
            continue
        rules.append(parse(files[key]))

    skipped = sorted(set(files) - known)
    if skipped:
        print('  公開していないメモリ(必要ならPUBLISHに追加):')
        for k in skipped:
            print('   -', k)

    now = datetime.datetime.now().strftime('%Y年%m月%d日 %H:%M')
    cards = []
    for r in rules:
        meta_bits = []
        if r['type']:
            meta_bits.append('<span class="rule-tag">%s</span>' % esc(TYPE_LABEL.get(r['type'], r['type'])))
        if r['modified']:
            meta_bits.append('<span class="rule-date">更新 %s</span>' % esc(r['modified']))
        cards.append(
            '<article class="rule" id="%s">\n'
            '  <p class="rule-name">%s</p>\n'
            '  <h2>%s</h2>\n'
            '  <div class="rule-meta">%s</div>\n'
            '  <div class="rule-body">%s</div>\n'
            '</article>' % (
                esc(r['name']), esc(r['name']), esc(r['description']),
                ''.join(meta_bits), md_to_html(r['body'], known)))

    toc = ''.join('<li><a href="#%s">%s</a></li>' % (esc(r['name']), esc(r['description'] or r['name']))
                  for r in rules)

    html = TEMPLATE % {
        'count': len(rules),
        'generated': now,
        'toc': toc,
        'cards': '\n\n'.join(cards),
    }
    io.open(OUT, 'w', encoding='utf-8').write(html)
    print('  生成:', OUT, '(%d件)' % len(rules))


TEMPLATE = u'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Claude Code 指示ルール一覧</title>
<style>
  :root {
    --paper: #f4f6f8; --card: #ffffff; --ink: #1c2229; --ink-soft: #5b6672; --ink-faint: #8b959f;
    --line: #dde3e9; --navy: #0f2a4a; --navy-soft: #eef2f7; --red: #a83d3d;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0 0 4rem; background: var(--paper); color: var(--ink);
    font-family: "BIZ UDPGothic", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif;
    font-size: 14px; line-height: 1.8;
  }
  .head { background: var(--navy); color: #fff; padding: 1.1rem 1.4rem; }
  .head h1 { margin: 0; font-size: 1.05rem; font-weight: 900; }
  .head p { margin: .3rem 0 0; font-size: .75rem; color: rgba(255,255,255,.72); }
  .back {
    position: fixed; top: 10px; right: 12px; z-index: 10; padding: .3rem .85rem; border-radius: 999px;
    background: var(--red); color: #fff; font-size: 11px; font-weight: 700; text-decoration: none;
    box-shadow: 0 2px 10px rgba(0,0,0,.2);
  }
  .wrap { max-width: 900px; margin: 0 auto; padding: 1.2rem 1.4rem; }
  .notice {
    border: 2px solid var(--red); background: #f9ecec; color: #5f2020;
    border-radius: .7rem; padding: .7rem .9rem; font-size: .75rem; line-height: 1.7; margin-bottom: 1.2rem;
  }
  .toc { background: var(--card); border: 1px solid var(--line); border-radius: .7rem; padding: .9rem 1.1rem; margin-bottom: 1.4rem; }
  .toc-title { margin: 0 0 .4rem; font-size: .7rem; font-weight: 700; letter-spacing: .08em; color: var(--ink-faint); }
  .toc ol { margin: 0; padding-left: 1.2rem; }
  .toc li { font-size: .8rem; margin: .15rem 0; }
  .toc a { color: var(--navy); text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .rule {
    background: var(--card); border: 1px solid var(--line); border-radius: .7rem;
    padding: 1.1rem 1.3rem; margin-bottom: 1rem; scroll-margin-top: 1rem;
  }
  .rule-name { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .68rem; color: var(--ink-faint); }
  .rule h2 { margin: .15rem 0 .5rem; font-size: 1rem; font-weight: 900; color: var(--navy); line-height: 1.5; }
  .rule-meta { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin-bottom: .7rem; }
  .rule-tag { background: var(--navy-soft); color: var(--navy); border-radius: .3rem; padding: .1rem .5rem; font-size: .68rem; font-weight: 700; }
  .rule-date { font-size: .68rem; color: var(--ink-faint); }
  .rule-body p { margin: 0 0 .6rem; }
  .rule-body ul { margin: 0 0 .6rem; padding-left: 1.2rem; }
  .rule-body li { margin: .15rem 0; }
  .rule-body h3, .rule-body h4 { margin: .8rem 0 .3rem; font-size: .85rem; color: var(--navy); }
  .rule-body code {
    background: #eef1f4; border-radius: .25rem; padding: .05rem .35rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .78em;
  }
  .rule-body strong { color: #0b2038; }
  .rule-body a { color: var(--navy); }
  .rule-ref-plain { color: var(--ink-faint); }
  .foot { max-width: 900px; margin: 1.5rem auto 0; padding: 0 1.4rem; font-size: .7rem; color: var(--ink-faint); }
</style>
</head>
<body>
<a class="back" href="admin.html">&larr; 管理者用ページ</a>
<div class="head">
  <h1>Claude Code 指示ルール一覧</h1>
  <p>このサイト(bizplan-lab-website)の制作でClaude Codeに指定したルール %(count)d 件 ／ 生成日時 %(generated)s</p>
</div>
<div class="wrap">
  <div class="notice">
    このページはGitHub Pagesで公開されているため、URLを直接叩けば誰でも閲覧できます。掲載しているのはこのサイトの制作ルールのみで、他プロジェクトのメモは含めていません。
  </div>
  <nav class="toc">
    <p class="toc-title">目次</p>
    <ol>%(toc)s</ol>
  </nav>

%(cards)s
</div>
<p class="foot">このページは <code>tools/build-admin-rules.py</code> で Claude Code のメモリから自動生成しています。ルールを追加・変更したら再生成してください。</p>
</body>
</html>
'''

if __name__ == '__main__':
    main()
