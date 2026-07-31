# -*- coding: utf-8 -*-
"""index.html からポータル構成 (tools.html / discussion.html / training.html / 新index) を生成"""
import io, re

src = io.open('index.html', encoding='utf-8').read()

# ---- パーツ切り出し ----
head_end = src.index('<main>')
head = src[:head_end]                      # head + グローバルヘッダー
hero_start = src.index('<!-- ===== ヒーロー ===== -->')
hero_end = src.index('<!-- ===== ツール一覧 ===== -->')
hero = src[hero_start:hero_end]
life_m = re.search(r'<div id="toolPanelLife".*?</div>\s*(?=<div id="toolPanelDs")', src, re.S)
life_grid = life_m.group(0)
ds_m = re.search(r'<div id="toolPanelDs".*?\n      </div>\s*\n    </div>\n  </section>', src, re.S)
ds_grid_full = ds_m.group(0)
ds_grid = ds_grid_full[:ds_grid_full.rindex('</div>\n    </div>\n  </section>')]
footer = src[src.index('<!-- ===== フッター ===== -->'):]
footer = footer.replace('<script src="js/index-tabs.js?v=20260723a"></script>\n', '')

# グリッドのタブ属性を除去
life_grid = life_grid.replace(' hidden', '').replace(' data-tab-panel="life"', '')
ds_grid = ds_grid.replace(' hidden', '').replace(' data-tab-panel="ds"', '')

# ---- 共有: タブナビ (aタグ版) ----
def tabs(active):
    def cls(k):
        return 'tool-tab-btn active' if k == active else 'tool-tab-btn'
    return f'''      <div class="tool-tabs" role="tablist">
        <a href="tools.html" class="{cls('life')}">
          <span class="tool-tab-jp">生命保険ツール</span>
          <span class="font-brand-en tool-tab-en">LIFE INSURANCE (1&ndash;7)</span>
        </a>
        <a href="discussion.html" class="{cls('ds')}">
          <span class="tool-tab-jp">ディスカッションシート</span>
          <span class="font-brand-en tool-tab-en">DISCUSSION SHEET (8&ndash;13)</span>
        </a>
        <a href="training.html" class="{cls('tr')}">
          <span class="tool-tab-jp">トレーニング</span>
          <span class="font-brand-en tool-tab-en">TRAINING (OP.1&ndash;9)</span>
        </a>
        <a href="basic-info.html" class="tool-tab-btn">
          <span class="tool-tab-jp">基本情報入力</span>
          <span class="font-brand-en tool-tab-en">BASIC INFO INPUT</span>
        </a>
      </div>
'''

def page(title, desc, hero_jp, hero_en, active, grid):
    h = head.replace(
        '<title>BizPlan Laboratory | 生命保険の価値を最大化する試算ツール</title>',
        f'<title>{title}</title>')
    h = re.sub(r'<meta name="description" content="[^"]*" />',
               f'<meta name="description" content="{desc}" />', h)
    hr = hero.replace('生命保険の価値を<br class="sm:hidden" />最大化する試算ツール', hero_jp)
    hr = hr.replace('Maximize the Value of Life Insurance', hero_en)
    return (h + '<main>\n\n' + hr +
            '  <!-- ===== 一覧 ===== -->\n  <section class="py-16 sm:py-20 md:py-24">\n    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">\n\n'
            + tabs(active) + '\n' + grid +
            '\n    </div>\n  </section>\n\n</main>\n\n' + footer)

# ---- tools.html ----
io.open('tools.html', 'w', encoding='utf-8').write(page(
    'BizPlan Laboratory | 生命保険ツール',
    '自社株・将来負債・金庫株・退職金・非課税・原資創出・減額充当。中小企業における生命保険の活用・効果・価値を数字で見える化する7つの試算ツールです。',
    '生命保険の価値を<br class="sm:hidden" />最大化する試算ツール',
    'Maximize the Value of Life Insurance', 'life', life_grid))

# ---- discussion.html ----
io.open('discussion.html', 'w', encoding='utf-8').write(page(
    'BizPlan Laboratory | ディスカッションシート',
    '医療法人・宗教法人・ベンチャー企業・資産管理会社・赤字会社・ホールディングス。お客様との対話を深める6つのディスカッションシートです。',
    'お客様との対話を深める<br class="sm:hidden" />ディスカッションシート',
    'Discussion Sheets for Deeper Dialogue', 'ds', ds_grid))

# ---- training.html ----
def training_card(n, live=False):
    if live:
        return '''        <a href="training/zaimu3hyo-master/index.html" class="lift-card group relative bg-white border border-gray-200 rounded-xl p-8 pt-9 block shadow-sm overflow-hidden">
          <span class="font-brand-en absolute -right-1 -bottom-4 text-6xl font-black text-[#5b4b8a] opacity-10 pointer-events-none select-none">MASTER</span>
          <span class="absolute top-0 left-0 right-0 h-1.5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" style="background-color:#5b4b8a"></span>
          <span class="absolute top-4 right-4 text-[10px] font-black tracking-widest text-white px-2.5 py-1 rounded-full" style="background-color:#c2452d">NEW</span>
          <div class="mb-5">
            <span class="text-5xl font-black leading-none tracking-tight text-[#0f2a4a]">Opus.<span style="color:#5b4b8a">1</span></span>
            <div class="w-8 h-[3px] mt-3 rounded-full" style="background-color:#5b4b8a"></div>
          </div>
          <p class="font-brand-en text-[11px] font-bold tracking-[0.2em] uppercase mb-2" style="color:#5b4b8a">Financial Statements Game</p>
          <h2 class="mb-3 leading-tight"><span class="font-black text-3xl text-[#0f2a4a]">財務3表</span><span class="font-bold text-2xl text-gray-500 ml-1">マスター</span></h2>
          <p class="text-sm text-gray-600 leading-relaxed mb-5">会社設立から2期目の決算まで完走するベーシック編、取引カードをさばくランダム経理処理、保険の経理処理の3モード。PL・BS・CSのつながりをゲームで体得します。</p>
          <span class="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#0f2a4a] bg-white text-[#0f2a4a] transition-colors duration-200 group-hover:bg-[#0f2a4a] group-hover:text-white">トレーニングを始める <span aria-hidden="true">&rarr;</span></span>
        </a>
'''
    return f'''        <div class="relative bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 pt-9 overflow-hidden">
          <div class="mb-5">
            <span class="text-5xl font-black leading-none tracking-tight text-gray-300">Opus.<span>{n}</span></span>
            <div class="w-8 h-[3px] mt-3 rounded-full bg-gray-200"></div>
          </div>
          <p class="font-brand-en text-[11px] font-bold tracking-[0.2em] uppercase mb-2 text-gray-400">Coming Soon</p>
          <h2 class="mb-3 leading-tight"><span class="font-black text-3xl text-gray-300">準備中</span></h2>
          <p class="text-sm text-gray-400 leading-relaxed mb-5">新しいトレーニングを製作中です。公開をお楽しみに。</p>
          <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-400">COMING SOON</span>
        </div>
'''

tr_grid = ('      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">\n\n'
           + training_card(1, live=True)
           + ''.join(training_card(n) for n in range(2, 10))
           + '\n      </div>')
io.open('training.html', 'w', encoding='utf-8').write(page(
    'BizPlan Laboratory | トレーニング',
    '財務3表マスターをはじめ、数字に強くなるためのトレーニングをゲーム感覚で。BizPlan Laboratoryのトレーニングシリーズです。',
    'ゲームで鍛える<br class="sm:hidden" />財務トレーニング',
    'Training Lab &mdash; Learn by Playing', 'tr', tr_grid))

# ---- 新 index.html (ポータル) ----
portal_card = '''
        <a href="{href}" class="lift-card group relative bg-white border border-gray-200 rounded-xl p-9 pt-10 block shadow-sm overflow-hidden">
          <span class="font-brand-en absolute -right-1 -bottom-4 text-6xl font-black opacity-10 pointer-events-none select-none" style="color:{color}">{wm}</span>
          <span class="absolute top-0 left-0 right-0 h-1.5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" style="background-color:{color}"></span>
          {badge}<p class="font-brand-en text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style="color:{color}">{en}</p>
          <h2 class="mb-1 leading-tight"><span class="font-black text-3xl text-[#0f2a4a]">{jp}</span></h2>
          <p class="font-brand-en text-xs font-bold tracking-[0.15em] text-gray-400 mb-4">{range}</p>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">{desc}</p>
          <span class="relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold border border-[#0f2a4a] bg-white text-[#0f2a4a] transition-colors duration-200 group-hover:bg-[#0f2a4a] group-hover:text-white">{cta} <span aria-hidden="true">&rarr;</span></span>
        </a>
'''
cards = ''.join([
 portal_card.format(href='tools.html', color='#3b6ea5', wm='TOOLS', en='Life Insurance Tools', jp='生命保険ツール',
   range='OPUS.1&ndash;7', badge='',
   desc='自社株・将来負債・金庫株・退職金・非課税・原資創出・減額充当。生命保険の活用価値を数字で見える化する7つの試算ツール。',
   cta='ツール一覧へ'),
 portal_card.format(href='discussion.html', color='#826f5c', wm='DISCUSSION', en='Discussion Sheets', jp='ディスカッションシート',
   range='OPUS.8&ndash;13', badge='',
   desc='医療法人・宗教法人・ベンチャー企業・資産管理会社・赤字会社・ホールディングス。お客様との対話を深める6つのシート。',
   cta='シート一覧へ'),
 portal_card.format(href='training.html', color='#5b4b8a', wm='TRAINING', en='Training Lab', jp='トレーニング',
   range='OP.1&ndash;9', badge='<span class="absolute top-4 right-4 text-[10px] font-black tracking-widest text-white px-2.5 py-1 rounded-full" style="background-color:#c2452d">NEW</span>\n          ',
   desc='第1弾「財務3表マスター」公開中。PL・BS・CSのつながりをゲーム感覚で体得するトレーニングシリーズ。',
   cta='トレーニングへ'),
])

# ヒーローに基本情報入力ピルを追加
hero_portal = hero.replace(
    '      <p class="font-brand-en text-white/75 font-bold tracking-[0.2em] text-[11px] sm:text-xs uppercase">\n        Maximize the Value of Life Insurance\n      </p>',
    '''      <p class="font-brand-en text-white/75 font-bold tracking-[0.2em] text-[11px] sm:text-xs uppercase mb-4">
        Maximize the Value of Life Insurance
      </p>
      <a href="basic-info.html" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold border border-white/50 text-white hover:bg-white hover:text-[#0f2a4a] transition-colors">基本情報入力 <span aria-hidden="true">&rarr;</span></a>''')

new_index = (head + '<main>\n\n' + hero_portal +
'''  <!-- ===== ポータル ===== -->
  <section class="py-16 sm:py-20 md:py-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
''' + cards + '''
      </div>
    </div>
  </section>

</main>

''' + footer)
io.open('index.html', 'w', encoding='utf-8').write(new_index)
print('generated: tools.html discussion.html training.html index.html')
