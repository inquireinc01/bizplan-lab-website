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
    'empty-input-placeholder-rule',
    'remaining-count-error-rule',
    'tab-skips-help-tips-rule',
    'hide-explanations-behind-help-tip',
    'recalc-on-commit-not-while-typing',
    'avoid-window-confirm-for-inline-actions',
    'scope-font-fixes-narrowly',
    'arial-bold-to-bahnschrift-rule',
    'tk-company-logo-spec',
    'bizplan-push-every-change',
    'reduce-token-heavy-browser-debugging',
]

# ページ冒頭のサマリー。カテゴリごとに「何をするルールか」を一言でまとめ、
# クリックで該当ルールの詳細(記事)へ飛ばす。文章はメモリの丸写しではなく、
# 読む人が一読して分かる平易な言葉で手書きする。
SUMMARY = [
    ('入力欄の見せ方とふるまい', [
        ('未入力の欄はグレーで「0 万円」、サンプル値は「入力例：3,000 万円」と単位付きで見せる',
         'empty-input-placeholder-rule'),
        ('自動計算の欄は既定でグレーの「自動計算：万円」。元の欄を入力すると数字が入る',
         'empty-input-placeholder-rule'),
        ('未入力エラーは「あと〇項目入力してください」。自動計算の欄は数に入れない',
         'remaining-count-error-rule'),
        ('計算し直すのは入力を確定したとき(欄から離れたとき)。入力中は動かさない',
         'recalc-on-commit-not-while-typing'),
        ('Tabキーは入力欄だけを移動する。「?」マークには止まらない',
         'tab-skips-help-tips-rule'),
    ]),
    ('数字の表示', [
        ('金額・数量は必ず3桁カンマ区切り。入力例の数字も同じ',
         'comma-format-numbers-everywhere'),
        ('万円・％・年などの単位は、数字より一回り小さく控えめに',
         'unit-smaller-than-number-rule'),
        ('数字の太字はArialのまま使う(Bahnschriftに変える案は廃止)',
         'arial-bold-to-bahnschrift-rule'),
    ]),
    ('ボタンと画面まわり', [
        ('「試算する」など主操作ボタンは専用デザイン(角丸□・ネイビー固定)',
         'trigger-button-design-rule'),
        ('ヒーロー帯は同じ幅の□アイコンボタン。全消しは白い「全データクリア」',
         'clear-button-design-pattern'),
        ('各入力エリアの小さいボタンは名前を「データクリア」で統一する',
         'clear-button-design-pattern'),
        ('ヘッダーのメニューは2つだけ・右寄せ',
         'header-nav-simplification'),
        ('項目の解説や計算式は画面に直書きせず「?」の中に隠す',
         'hide-explanations-behind-help-tip'),
    ]),
    ('確認のとり方', [
        ('window.confirm()は使わない(LINE等のアプリ内ブラウザで反応しないため)',
         'avoid-window-confirm-for-inline-actions'),
        ('クリア等はボタン自身が赤字で「本当にクリア？」に変わり、2回目クリックで実行',
         'avoid-window-confirm-for-inline-actions'),
    ]),
    ('ブランド', [
        ('TK&Company Inc.ロゴのフォント・配置・生成スクリプトの確定仕様',
         'tk-company-logo-spec'),
    ]),
    ('Claude Codeへの作業指示', [
        ('変更したら都度コミットしてpushする(確認待ちしない)',
         'bizplan-push-every-change'),
        ('フォント修正は指摘された箇所だけ。サイト全体の指定を勝手に変えない',
         'scope-font-fixes-narrowly'),
        ('ブラウザ検証はスクリーンショットと往復回数を絞る',
         'reduce-token-heavy-browser-debugging'),
    ]),
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

    # サマリーの整合性チェック(飛び先が存在しないリンク・要約に載っていないルールを検出)
    linked = set()
    for _, items in SUMMARY:
        for text, anchor in items:
            linked.add(anchor)
            if anchor not in known:
                print('  [警告] サマリーの飛び先が公開ルールにありません:', anchor)
    for key in PUBLISH:
        if key not in linked:
            print('  [警告] サマリーに載っていないルール:', key)

    summary = ''.join(
        '<div class="sum-cat"><h3>%s</h3><ul>%s</ul></div>' % (
            esc(cat),
            ''.join('<li><a href="#%s">%s</a></li>' % (esc(anchor), esc(text)) for text, anchor in items))
        for cat, items in SUMMARY)

    html = TEMPLATE % {
        'count': len(rules),
        'generated': now,
        'summary': summary,
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
  /* 冒頭サマリー: カテゴリごとに一言でまとめ、クリックで下の詳細へ飛ばす */
  .summary { background: var(--card); border: 1px solid var(--line); border-radius: .7rem; padding: 1rem 1.2rem 1.1rem; margin-bottom: 1rem; }
  .summary-title { margin: 0 0 .1rem; font-size: .95rem; font-weight: 900; color: var(--navy); }
  .summary-lead { margin: 0 0 .9rem; font-size: .72rem; color: var(--ink-faint); }
  .sum-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem .9rem; }
  @media (max-width: 700px) { .sum-grid { grid-template-columns: 1fr; } }
  .sum-cat { border-left: 3px solid var(--navy); padding: .1rem 0 .1rem .7rem; }
  .sum-cat h3 { margin: 0 0 .25rem; font-size: .78rem; font-weight: 900; color: var(--navy); letter-spacing: .02em; }
  .sum-cat ul { margin: 0; padding-left: 1rem; }
  .sum-cat li { font-size: .78rem; line-height: 1.65; margin: .1rem 0; }
  .sum-cat a { color: var(--ink); text-decoration: none; border-bottom: 1px dotted var(--line); }
  .sum-cat a:hover { color: var(--red); border-bottom-color: var(--red); }
  .sum-cat a::after { content: " ›"; color: var(--ink-faint); font-weight: 700; }
  .toc { background: var(--card); border: 1px solid var(--line); border-radius: .7rem; padding: .9rem 1.1rem; margin-bottom: 1.4rem; }
  .toc-title { margin: 0 0 .4rem; font-size: .7rem; font-weight: 700; letter-spacing: .08em; color: var(--ink-faint); }
  .toc ol { margin: 0; padding-left: 1.2rem; }
  .toc li { font-size: .8rem; margin: .15rem 0; }
  .toc a { color: var(--navy); text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .toc details summary { cursor: pointer; font-size: .7rem; font-weight: 700; letter-spacing: .08em; color: var(--ink-faint); }
  .toc details[open] summary { margin-bottom: .4rem; }
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
  <section class="summary">
    <p class="summary-title">サマリー</p>
    <p class="summary-lead">決まっていることの要点。項目をクリックすると、下の詳細ルールへ移動します。</p>
    <div class="sum-grid">%(summary)s</div>
  </section>
  <nav class="toc">
    <details>
      <summary>ルール一覧(全%(count)d件・タイトルで探す)</summary>
      <ol>%(toc)s</ol>
    </details>
  </nav>

%(cards)s
</div>
<p class="foot">このページは <code>tools/build-admin-rules.py</code> で Claude Code のメモリから自動生成しています。ルールを追加・変更したら再生成してください。</p>
</body>
</html>
'''

if __name__ == '__main__':
    main()
