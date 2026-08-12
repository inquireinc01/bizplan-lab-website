// UX CHOICE LAB — コース3: デザインセンス編（50問）
window.COURSE_SENSE = {
  id: "sense",
  title: "デザインセンス編",
  en: "DESIGN SENSE",
  desc: "「なんとなくダサい」「AIっぽい」を言語化する50問。補色・明度・彩度などの色彩理論、質感と装飾、画面の整え方に加えて、AI生成にありがちな配色・装飾・言葉遣いの見抜き方まで扱います。",
  minutes: "約25",
  groups: [
    {name:"色彩の設計", icon:"◐", note:"色を組み立てる"},
    {name:"質感と装飾", icon:"◆", note:"品よく飾る"},
    {name:"画面の整え方", icon:"▤", note:"すっきり見せる"},
    {name:"言葉とトーン", icon:"❝", note:"文は人なり"}
  ],
  questions: [
// ---------- 色彩の設計（13問） ----------
{
  g:"色彩の設計", cat:"キャンペーンバナー",
  title:"補色の組み合わせ方",
  context:"青系のブランドにオレンジ（補色）でアクセントを入れます。品よく見えるのはどちらでしょう？",
  la:"トーンを落として使う", lb:"純色同士をぶつける",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#0f2a4a;padding:16px;color:#fff"><div style="font-size:10px;letter-spacing:.15em;color:#d9a05b;font-weight:700;margin-bottom:4px">SUMMER CAMPAIGN</div><div style="font-size:15px;font-weight:700">夏の相談会、受付中</div><span style="display:inline-block;margin-top:8px;background:#c77b3a;color:#fff;border-radius:6px;padding:6px 14px;font-size:11px;font-weight:700">予約する</span></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#0000ff;padding:16px;color:#fff"><div style="font-size:10px;letter-spacing:.15em;color:#ff7f00;font-weight:700;margin-bottom:4px">SUMMER CAMPAIGN</div><div style="font-size:15px;font-weight:700;color:#ffa500">夏の相談会、受付中</div><span style="display:inline-block;margin-top:8px;background:#ff6600;color:#fff;border-radius:6px;padding:6px 14px;font-size:11px;font-weight:700">予約する</span></div></div>`,
  principle:"補色は、どちらかのトーンを落として使う",
  explain:"補色（色相環の反対側の色）は最も引き立て合う組み合わせですが、純色同士でぶつけると互いに主張して目がチカチカします（ハレーション）。片方の彩度・明度を落とせば、緊張感は残しつつ品よくまとまります。"
},
{
  g:"色彩の設計", cat:"サービス紹介ページ",
  title:"色相のまとまり",
  context:"ページ全体の配色です。統一感が出るのはどちらでしょう？",
  la:"色相を絞って1色外す", lb:"色相をバラバラに使う",
  good:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#0f2a4a;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">経営分析</div><div style="background:#3b6ea5;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">資金繰り</div><div style="background:#8fa9c5;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">事業承継</div><div style="background:#c77b3a;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">今月のおすすめ ←アクセント1色</div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#e91e63;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">経営分析</div><div style="background:#4caf50;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">資金繰り</div><div style="background:#9c27b0;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">事業承継</div><div style="background:#ff9800;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700">今月のおすすめ</div></div></div>`,
  principle:"色相を絞り、外すのは1色だけにする",
  explain:"項目ごとに色相を変えると、色が情報の意味を持たなくなり、画面はただ騒がしくなります。基調の色相（例：青系）の濃淡でまとめ、色相を外すのは「本当に目立たせたい1色」だけ。外した1色は絞るほど強く効きます。"
},
{
  g:"色彩の設計", cat:"ステータス表示",
  title:"明度差で読ませる",
  context:"色付きの背景に文字を載せます。誰にでも読みやすいのはどちらでしょう？",
  la:"明度差のある組み合わせ", lb:"色相だけ違う組み合わせ",
  good:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#0f2a4a;color:#fff;border-radius:6px;padding:10px;font-size:12px;font-weight:700">濃い青地 × 白文字（明度差 大）</div><div style="background:#e8eef5;color:#0f2a4a;border-radius:6px;padding:10px;font-size:12px;font-weight:700">淡い青地 × 濃紺文字（明度差 大）</div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#d64541;color:#3a8a3f;border-radius:6px;padding:10px;font-size:12px;font-weight:700">赤地 × 緑文字（明度がほぼ同じ）</div><div style="background:#3b6ea5;color:#c77b3a;border-radius:6px;padding:10px;font-size:12px;font-weight:700">青地 × 橙文字（明度がほぼ同じ）</div></div></div>`,
  principle:"色の見分けは色相ではなく明度差で作る",
  explain:"「色相が違えば読める」は誤解です。赤地に緑文字のように明度が近い組み合わせは、輪郭が振動して読めず、モノクロにするとほぼ消えます。文字と背景は必ず明度差で分離させる——白黒コピーしても読めるか、が簡単な判定法です。"
},
{
  g:"色彩の設計", cat:"注意喚起のデザイン",
  title:"彩度と面積の関係",
  context:"重要なお知らせを目立たせたい場面です。品を保ちながら目を引くのはどちらでしょう？",
  la:"ビビッドは小さく使う", lb:"ビビッドを大面積に",
  good:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:12px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="background:#d64541;color:#fff;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700">重要</span><b style="font-size:12px;color:#0f2a4a">料率改定のお知らせ</b></div><div style="font-size:11px;color:#56626f">2026年10月より保険料率が変わります。</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#ff2020;padding:14px;color:#fff"><div style="font-size:13px;font-weight:700;margin-bottom:2px">⚠ 重要！料率改定のお知らせ ⚠</div><div style="font-size:11px">2026年10月より保険料率が変わります。</div></div></div>`,
  principle:"彩度の高い色ほど、面積を小さく",
  explain:"ビビッドな色のパワーは面積に比例して暴走します。画面の1%の赤いバッジは視線を集めますが、100%の赤い箱は威圧するだけで、かえって読み飛ばされます。「強い色は切手サイズまで」と覚えておくと外しません。"
},
{
  g:"色彩の設計", cat:"カテゴリタグの配色",
  title:"トーンの統一",
  context:"複数のカテゴリタグに色を付けます。色数が多くてもまとまるのはどちらでしょう？",
  la:"トーンを揃える", lb:"トーンがバラバラ",
  good:`<div class="mock"><div style="display:flex;flex-wrap:wrap;gap:6px"><span style="background:#dce8f2;color:#3d6285;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">財務</span><span style="background:#dff0e4;color:#3f7050;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">税務</span><span style="background:#f6e8d9;color:#8a6335;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">労務</span><span style="background:#efe0ec;color:#7d4a72;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">法務</span></div><div class="ms" style="margin-top:6px">全て「淡く・くすんだ」同じトーン</div></div>`,
  bad:`<div class="mock"><div style="display:flex;flex-wrap:wrap;gap:6px"><span style="background:#ff0000;color:#fff;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">財務</span><span style="background:#ccffcc;color:#3f7050;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">税務</span><span style="background:#8b4513;color:#fff;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">労務</span><span style="background:#ff69b4;color:#fff;border-radius:9999px;padding:4px 12px;font-size:11px;font-weight:700">法務</span></div><div class="ms" style="margin-top:6px">ビビッド・パステル・ダークが混在</div></div>`,
  principle:"トーン（明度×彩度）を揃えれば、色数が増えてもまとまる",
  explain:"色相が違っても、明度と彩度（＝トーン）が揃っていれば「同じ世界の色」に見えます。逆にトーンが混ざると、たった3色でもチグハグに見えます。タグやグラフのような多色が必要な場面ほど、トーンの統一が効きます。"
},
{
  g:"色彩の設計", cat:"ボタンとリンクの色",
  title:"原色をそのまま使わない",
  context:"ボタンとリンクの色を決めます。洗練されて見えるのはどちらでしょう？",
  la:"一段調整した色", lb:"純色（#FF0000等）",
  good:`<div class="mock"><span class="mb mb-block" style="background:#c0473f;color:#fff;margin-bottom:8px">解約する</span><div style="font-size:12px;font-weight:400">詳しくは<span style="color:#2d5580;text-decoration:underline">ご利用ガイド</span>をご覧ください。</div></div>`,
  bad:`<div class="mock"><span class="mb mb-block" style="background:#ff0000;color:#fff;margin-bottom:8px">解約する</span><div style="font-size:12px;font-weight:400">詳しくは<span style="color:#0000ff;text-decoration:underline">ご利用ガイド</span>をご覧ください。</div></div>`,
  principle:"原色（純色）はそのまま使わず、一段落ち着かせる",
  explain:"#FF0000や#0000FFのような純色はディスプレイの限界の彩度で発光するため、素人っぽさ・警告感が出ます。少し彩度を落とし明度を調整した「調整済みの色」を使うだけで、画面全体の格が一段上がります。プロのUIに純色はほぼ登場しません。"
},
{
  g:"色彩の設計", cat:"本文と背景の色",
  title:"純黒・純白を避ける",
  context:"長文を読ませる画面の文字色と背景色です。目が疲れにくいのはどちらでしょう？",
  la:"わずかに色味のある黒", lb:"純黒 × 純白",
  good:`<div class="mock" style="background:#f8f9fb"><div style="font-size:12px;font-weight:400;color:#2b323d;line-height:1.8">文字色 #2b323d ／ 背景 #f8f9fb。<br>わずかに青みを含んだ黒と、ごく淡いグレーの背景。コントラストは十分なまま、まぶしさが抑えられます。</div></div>`,
  bad:`<div class="mock" style="background:#ffffff"><div style="font-size:12px;font-weight:400;color:#000000;line-height:1.8">文字色 #000000 ／ 背景 #ffffff。<br>純黒と純白の組み合わせはコントラストが最大になり、長文では文字がギラついて目が疲れやすくなります。</div></div>`,
  principle:"純黒・純白より、わずかに色味を持たせる",
  explain:"コントラストは高いほど良いわけではなく、純黒×純白は強すぎて長文で目が疲れます。黒はブランド色の色味をわずかに混ぜた濃灰（#2b323d等）、背景はごく淡いグレーやオフホワイトにすると、読みやすさと上品さが両立します。"
},
{
  g:"色彩の設計", cat:"セクション背景の色選び",
  title:"大面積の背景の彩度",
  context:"コンテンツの背景に色を敷きます。文字が主役でいられるのはどちらでしょう？",
  la:"低彩度の淡い色", lb:"高彩度の鮮やかな色",
  good:`<div class="mock" style="background:#eef1f4"><div class="mtitle" style="margin-bottom:4px;color:#0f2a4a">ご利用の流れ</div><div style="font-size:11px;font-weight:400;color:#4a5460">背景は「白より一段濃いだけ」の低彩度。文字とコンテンツが主役のまま、セクションの区切りが伝わります。</div></div>`,
  bad:`<div class="mock" style="background:#ffe600"><div class="mtitle" style="margin-bottom:4px;color:#0f2a4a">ご利用の流れ</div><div style="font-size:11px;font-weight:400;color:#4a5460">背景が高彩度だと、面積の広さ×彩度の強さで背景そのものが主役になり、上に載る文字が読みにくくなります。</div></div>`,
  principle:"大面積に敷く色は、彩度を思い切り下げる",
  explain:"背景は画面で最も面積の大きい要素です。ここに彩度の高い色を使うと、色のパワーが最大化されて内容より背景が目立ちます。背景に使ってよいのは「色がついていると意識されないくらい淡い色」までです。"
},
{
  g:"色彩の設計", cat:"見出しと本文の文字色",
  title:"文字色の彩度",
  context:"読ませるテキストの色です。内容が頭に入るのはどちらでしょう？",
  la:"低彩度で締める", lb:"高彩度の色文字",
  good:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#0f2a4a;margin-bottom:4px">決算前に確認したい3つの数字</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8">利益・現預金・借入残高。この3つを毎月同じ形式で眺めるだけで、会社の異変には早く気づけます。</div></div>`,
  bad:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#ff00aa;margin-bottom:4px">決算前に確認したい3つの数字</div><div style="font-size:11px;font-weight:400;color:#00aaff;line-height:1.8">利益・現預金・借入残高。この3つを毎月同じ形式で眺めるだけで、会社の異変には早く気づけます。</div></div>`,
  principle:"長く読ませる文字に、高彩度の色を使わない",
  explain:"彩度の高い文字は網膜への刺激が強く、数行で目が疲れます。見出しは低彩度の濃色、本文は濃灰が基本。色文字は「1〜2語の強調」までに絞ります。カラフルな文字が増えるほど、どこも読まれなくなります。"
},
{
  g:"色彩の設計", cat:"配色に迷ったとき",
  title:"同系色の濃淡で設計する",
  context:"リストの階層に色を付けます。失敗しにくいのはどちらでしょう？",
  la:"1色の濃淡でまとめる", lb:"階層ごとに別の色",
  good:`<div class="mock"><div style="background:#0f2a4a;color:#fff;border-radius:6px 6px 0 0;padding:8px 10px;font-size:12px;font-weight:700">収益性</div><div style="background:#3b6ea5;color:#fff;padding:7px 10px;font-size:11px;font-weight:700">営業利益率</div><div style="background:#e8eef5;color:#0f2a4a;border-radius:0 0 6px 6px;padding:7px 10px;font-size:11px;font-weight:400">13.1%（前期 10.8%）</div></div>`,
  bad:`<div class="mock"><div style="background:#8e24aa;color:#fff;border-radius:6px 6px 0 0;padding:8px 10px;font-size:12px;font-weight:700">収益性</div><div style="background:#f57c00;color:#fff;padding:7px 10px;font-size:11px;font-weight:700">営業利益率</div><div style="background:#c8e6c9;color:#2b323d;border-radius:0 0 6px 6px;padding:7px 10px;font-size:11px;font-weight:400">13.1%（前期 10.8%）</div></div>`,
  principle:"迷ったら同系色の濃淡——это最も失敗しない配色",
  explain:"1つの色相の濃淡（ネイビー→ブルー→淡青）は、そのまま情報の階層として読まれ、絶対に喧嘩しません。複数の色相を組み合わせるのは難易度の高い技術です。配色に自信がないときほど「1色+グレー+アクセント1色」に絞るのが正解です。"
},
{
  g:"色彩の設計", cat:"上位プランの訴求デザイン",
  title:"「高級風」配色の落とし穴",
  context:"プレミアムプランをリッチに見せたい場面です。本当に格が出るのはどちらでしょう？",
  la:"抑制と余白で格を出す", lb:"ネイビー×ゴールドの定番",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#0f2a4a;padding:18px;color:#fff"><div style="font-size:10px;letter-spacing:.2em;opacity:.6;margin-bottom:4px">PREMIUM</div><div style="font-size:14px;font-weight:700;margin-bottom:2px">プレミアムプラン</div><div style="font-size:10px;opacity:.75">専任担当と月次レビューが付きます</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#0a1224;padding:18px;color:#d4af37;border:2px solid #d4af37"><div style="font-size:10px;letter-spacing:.2em;margin-bottom:4px">👑 PREMIUM 👑</div><div style="font-size:14px;font-weight:700;margin-bottom:2px;background:linear-gradient(90deg,#f5d76e,#d4af37);-webkit-background-clip:text;background-clip:text;color:transparent">プレミアムプラン</div><div style="font-size:10px;color:#c9b465">最高峰のラグジュアリー体験を</div></div></div>`,
  principle:"紺×金＋王冠の「高級テンプレ」は、AI生成の定番になった",
  explain:"「高級感を出して」とAIに頼むと、ほぼ確実に濃紺×ゴールド×王冠が出てきます。多用された結果、この組み合わせ自体が既製品の記号になりました。本物の高級ブランドのサイトほど、金色ではなく余白・抑制・タイポグラフィで格を作っています。"
},
{
  g:"色彩の設計", cat:"サービスサイト全体の配色",
  title:"ページごとの多色展開",
  context:"複数ページのサイトの基調色です。ブランドが積み上がるのはどちらでしょう？",
  la:"全ページ同じ基調色", lb:"ページごとにテーマ色",
  good:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#0f2a4a;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">サービス｜ネイビー基調</div><div style="background:#0f2a4a;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">料金　　｜ネイビー基調</div><div style="background:#0f2a4a;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">会社概要｜ネイビー基調</div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;flex-direction:column;gap:6px"><div style="background:#16a085;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">サービス｜グリーン</div><div style="background:#8e44ad;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">料金　　｜パープル</div><div style="background:#e67e22;color:#fff;border-radius:6px;padding:8px 10px;font-size:11px;font-weight:700">会社概要｜オレンジ</div></div></div>`,
  principle:"ページが変わっても基調色は変えない",
  explain:"「分かりやすく色分けしましょう」という発想でページごとにテーマ色を変えると、1ページごとに別のサイトに見え、ブランドの記憶が積み上がりません。基調色は1つに固定し、ページの区別はパンくずや見出しで行います。色分けが本当に有効なのは、カテゴリが5個以上あって常に並ぶ場合くらいです。"
},
{
  g:"色彩の設計", cat:"見出し帯のグラデーション",
  title:"グラデーションの色数",
  context:"帯にグラデーションを使います。上品にまとまるのはどちらでしょう？",
  la:"近い2色でつなぐ", lb:"3色以上の虹色",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#0f2a4a,#1c3f68);padding:14px;color:#fff"><div style="font-size:13px;font-weight:700">2026年度 決算サマリー</div><div style="font-size:10px;opacity:.7">同系色の濃淡をなめらかにつなぐ</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(90deg,#e74c3c,#f1c40f,#2ecc71,#3498db);padding:14px;color:#fff"><div style="font-size:13px;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.4)">2026年度 決算サマリー</div><div style="font-size:10px;text-shadow:0 1px 2px rgba(0,0,0,.4)">赤→黄→緑→青の虹グラデーション</div></div></div>`,
  principle:"グラデーションは「隣り合う2色」まで",
  explain:"色相環で近い2色（紺→青、青→青緑）のグラデーションは1つの色の陰影として自然に見えますが、3色以上またぐと途中に濁った色が生まれ、文字も読みにくくなります。虹色のグラデーションが似合うのは、多様性そのものを表現したい場面だけです。"
},
// ---------- 質感と装飾（14問） ----------
{
  g:"質感と装飾", cat:"業務ツールのカードUI",
  title:"角丸のきつさ",
  context:"財務ツールのカードとボタンの角丸です。信頼感が出るのはどちらでしょう？",
  la:"控えめな角丸", lb:"全部まん丸",
  good:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:12px;margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">自社株評価</b><div class="ms">3方式で株価を算定</div></div><span class="mb mb-p" style="border-radius:8px;padding:8px 18px;font-size:12px">試算する</span></div>`,
  bad:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:26px;padding:16px;margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">自社株評価</b><div class="ms">3方式で株価を算定</div></div><span class="mb mb-p" style="border-radius:9999px;padding:8px 22px;font-size:12px">試算する</span></div>`,
  principle:"業務系の角丸は小さめ（4〜12px）に抑える",
  explain:"角丸は大きいほど「親しみやすく・カジュアルに」、小さいほど「堅く・信頼感がある」印象になります。お金を扱う業務ツールで全要素をまん丸にすると、おもちゃのような軽さが出てしまいます。用途に合わせて角丸の値を1つ決め、全体で統一します。"
},
{
  g:"質感と装飾", cat:"カードの浮かせ方",
  title:"影の強さ",
  context:"カードを背景から浮かせる影の付け方です。上品なのはどちらでしょう？",
  la:"淡くぼかした影", lb:"濃くズレた影",
  good:`<div class="mock" style="background:#f4f6f8"><div style="background:#fff;border-radius:8px;padding:14px;box-shadow:0 4px 16px rgba(15,42,74,.08)"><b style="font-size:12px;color:#0f2a4a">月次サマリー</b><div class="ms">影は「淡く・ぼかして・下方向に」</div></div></div>`,
  bad:`<div class="mock" style="background:#f4f6f8"><div style="background:#fff;border-radius:8px;padding:14px;box-shadow:8px 8px 0 #000000"><b style="font-size:12px;color:#0f2a4a">月次サマリー</b><div class="ms">真っ黒の影がベタッと付いている</div></div></div>`,
  principle:"影は「浮いて見える最小限」まで薄くする",
  explain:"現実の柔らかい光の影は、淡く・ぼけて・わずかに下に落ちます。真っ黒でくっきりした影は物理的に不自然で、画面が重く安っぽくなります。影の透明度は10%前後から始めて、「気づくかどうか」の薄さに留めるのがコツです。"
},
{
  g:"質感と装飾", cat:"ボタンの質感",
  title:"立体表現の時代感",
  context:"実行ボタンの質感です。今のWebで洗練されて見えるのはどちらでしょう？",
  la:"フラット基調", lb:"ベベル・エンボス",
  good:`<div class="mock" style="text-align:center"><span class="mb mb-p" style="padding:10px 26px">試算する</span><div class="ms" style="margin-top:6px">単色＋控えめな影のフラット表現</div></div>`,
  bad:`<div class="mock" style="text-align:center"><span style="display:inline-block;padding:10px 26px;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(180deg,#7ab6f5 0%,#2a5d99 50%,#123c6e 51%,#2a5d99 100%);border:2px outset #9cc4ec;border-radius:8px;text-shadow:1px 1px 2px #000">試算する</span><div class="ms" style="margin-top:6px">グラデ＋ベベル＋文字影の立体ボタン</div></div>`,
  principle:"立体表現（ベベル・エンボス・強グラデ）は時代感が出る",
  explain:"ガラスのようなテカり、盛り上がったベベル、文字の影——2000年代のWebの記号で、今使うと一気に古く見えます。現代の主流はフラット＋最小限の影。質感は「引く」方向で作るのが現在のセンスです。"
},
{
  g:"質感と装飾", cat:"セクションの背景",
  title:"文字の下の柄",
  context:"見出しセクションの背景です。読みやすさを保てるのはどちらでしょう？",
  la:"無地または淡い地紋", lb:"賑やかな柄を敷く",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#091a30,#1c3f68);padding:16px;color:#fff"><div style="font-size:14px;font-weight:700">経営者のための財務講座</div><div style="font-size:10px;opacity:.7">全8回・オンライン開催</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:repeating-linear-gradient(45deg,#3b6ea5 0 10px,#5c8272 10px 20px,#c9a227 20px 30px,#a83d3d 30px 40px);padding:16px;color:#fff"><div style="font-size:14px;font-weight:700;">経営者のための財務講座</div><div style="font-size:10px">全8回・オンライン開催</div></div></div>`,
  principle:"文字の下に柄を敷かない",
  explain:"文字の可読性は背景の均一さに支えられています。ストライプや写真など明暗が入り混じる背景に文字を載せると、場所によって読める・読めないのムラができます。柄を使いたいなら、文字のない領域か、判別できないほど淡い地紋までです。"
},
{
  g:"質感と装飾", cat:"見出し文字の加工",
  title:"文字そのものの装飾",
  context:"目立たせたい見出しの加工です。プロっぽく見えるのはどちらでしょう？",
  la:"サイズと余白で目立たせる", lb:"縁取り＋影＋斜体",
  good:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:18px;font-weight:900;color:#0f2a4a;letter-spacing:.02em">秋の経営セミナー</div><div style="width:36px;height:3px;background:#3b6ea5;border-radius:2px;margin:8px auto 0"></div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:18px;font-weight:900;font-style:italic;color:#ffe600;-webkit-text-stroke:1.5px #d64541;text-shadow:2px 2px 0 #0f2a4a,4px 4px 6px rgba(0,0,0,.4)">秋の経営セミナー</div></div>`,
  principle:"文字の装飾（縁取り・影・斜体）は原則使わない",
  explain:"縁取りや影は文字の輪郭を壊し、読みにくくした上に「チラシ感」を出します。見出しを目立たせる正攻法は、サイズの差・太さ・周囲の余白です。装飾を足すより、周りを引き算する方が視線は集まります。"
},
{
  g:"質感と装飾", cat:"ヒーローセクションの配色",
  title:"「AIっぽい」グラデーション",
  context:"トップページの雰囲気づくりです。独自性と信頼感が出るのはどちらでしょう？",
  la:"ブランド色の落ち着いた背景", lb:"紫〜ピンクの流行グラデ",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#091a30,#0f2a4a 55%,#1c3f68);padding:18px;color:#fff"><div style="font-size:14px;font-weight:700;margin-bottom:2px">退職金原資を、3分で試算。</div><div style="font-size:10px;opacity:.75">自社の決算書だけで始められます</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#8b5cf6,#d946ef 50%,#ec4899);padding:18px;color:#fff"><div style="font-size:14px;font-weight:700;margin-bottom:2px">✨ 未来の経営を、AIとともに。</div><div style="font-size:10px;opacity:.85">Next-Gen Financial Platform</div></div></div>`,
  principle:"紫系グラデーションは「AI生成テンプレ」の記号になった",
  explain:"紫→ピンクのグラデーションは、AIツールやAI生成サイトが多用した結果、「AIで作った・手を入れていない」という記号として読まれるようになりました。ブランド固有の色で堂々と塗る方が、独自性と信頼感が伝わります。流行の質感ほど寿命が短いことにも注意です。"
},
{
  g:"質感と装飾", cat:"カードの質感",
  title:"すりガラス表現の使いどころ",
  context:"情報カードの質感です。読みやすく品があるのはどちらでしょう？",
  la:"不透明の白カード", lb:"全面すりガラス",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#0f2a4a,#1c3f68);padding:14px"><div style="background:#fff;border-radius:8px;padding:10px"><b style="font-size:12px;color:#0f2a4a">流動比率 142.3%</b><div class="ms">背景が透けないので数字がくっきり</div></div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);padding:14px"><div style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:10px;color:#fff"><b style="font-size:12px">流動比率 142.3%</b><div style="font-size:10px;opacity:.85">背景が透けて数字の輪郭がにじむ</div></div></div></div>`,
  principle:"すりガラス（グラスモーフィズム）は飾りであって、読む場所には使わない",
  explain:"半透明のすりガラスカードはAI生成UIの定番装飾ですが、背景が透けるぶん文字のコントラストが不安定になり、数値を読む用途には不向きです。使うなら装飾的な1箇所まで。データを載せる面は不透明が原則です。"
},
{
  g:"質感と装飾", cat:"空きスペースの飾り",
  title:"意味のない装飾イラスト",
  context:"サービス紹介の視覚要素です。内容の理解を助けるのはどちらでしょう？",
  la:"内容に即した図", lb:"浮遊する抽象3Dオブジェ",
  good:`<div class="mock"><b style="font-size:12px;color:#0f2a4a">株価算定の3ステップ</b><div style="display:flex;align-items:center;gap:6px;margin-top:8px"><span style="background:#e8eef5;color:#2d5580;border-radius:6px;padding:6px 8px;font-size:10px;font-weight:700">決算書<br>入力</span><span style="color:#8d97a3">→</span><span style="background:#e8eef5;color:#2d5580;border-radius:6px;padding:6px 8px;font-size:10px;font-weight:700">3方式で<br>計算</span><span style="color:#8d97a3">→</span><span style="background:#0f2a4a;color:#fff;border-radius:6px;padding:6px 8px;font-size:10px;font-weight:700">評価額<br>表示</span></div></div>`,
  bad:`<div class="mock"><b style="font-size:12px;color:#0f2a4a">株価算定の3ステップ</b><div style="position:relative;height:70px;margin-top:8px"><span style="position:absolute;left:8%;top:6px;width:34px;height:34px;border-radius:38% 62% 55% 45%/48% 40% 60% 52%;background:linear-gradient(135deg,#a78bfa,#f472b6)"></span><span style="position:absolute;left:42%;top:22px;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#818cf8)"></span><span style="position:absolute;right:10%;top:2px;width:30px;height:30px;transform:rotate(24deg);border-radius:8px;background:linear-gradient(135deg,#fbbf24,#f472b6)"></span></div><div class="ms">キラキラした玉が浮いているだけで、内容とは無関係</div></div>`,
  principle:"意味を運ばない装飾イラストは置かない",
  explain:"浮遊するグラデーションの球体や抽象3Dオブジェは、AI生成LPの典型的な埋め草です。視覚要素は「内容の理解を1秒速くするか」で採否を決めます。説明の代わりになる図・フロー・実画面のスクリーンショットこそが、価値のある「飾り」です。"
},
{
  g:"質感と装飾", cat:"業務ダッシュボードの雰囲気",
  title:"ネオン×ダークの使いどころ",
  context:"経営者向け財務ダッシュボードの配色テーマです。適切なのはどちらでしょう？",
  la:"明るく落ち着いた配色", lb:"ダーク＋ネオン発光",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="font-size:12px;color:#0f2a4a">月次ダッシュボード</b><span class="ms">2026年7月</span></div><div style="display:flex;gap:6px"><div style="flex:1;background:#eef1f4;border-radius:6px;padding:8px"><div class="ms">売上高</div><b style="font-family:Arial;font-size:13px;color:#0f2a4a">3,120万円</b></div><div style="flex:1;background:#eef1f4;border-radius:6px;padding:8px"><div class="ms">営業利益</div><b style="font-family:Arial;font-size:13px;color:#0f2a4a">410万円</b></div></div></div>`,
  bad:`<div class="mock" style="background:#0a0a14;border-color:#1e2a45"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="font-size:12px;color:#22d3ee;text-shadow:0 0 8px #22d3ee">MONTHLY DASHBOARD</b><span style="font-size:10px;color:#a78bfa">2026.07</span></div><div style="display:flex;gap:6px"><div style="flex:1;background:#111827;border:1px solid #22d3ee;border-radius:6px;padding:8px;box-shadow:0 0 10px rgba(34,211,238,.4)"><div style="font-size:10px;color:#67e8f9">売上高</div><b style="font-family:Arial;font-size:13px;color:#f0abfc;text-shadow:0 0 6px #f0abfc">3,120万円</b></div></div></div>`,
  principle:"ネオン×ダークは世界観の演出であり、業務の読み取りには不向き",
  explain:"黒地に発光するシアンやピンクは、AI生成の「近未来ダッシュボード」イメージの定番ですが、発光表現は文字の輪郭をにじませ、長時間の数値確認には向きません。ゲームやエンタメの世界観演出と、毎月見る業務画面では、選ぶべき質感が違います。"
},
{
  g:"質感と装飾", cat:"機能一覧のアイコン",
  title:"絵文字ピクトグラムの多用",
  context:"機能紹介に添えるアイコンです。プロダクトの顔として信頼できるのはどちらでしょう？",
  la:"統一された線画アイコン", lb:"カラフル絵文字を乱用",
  good:`<div class="mock"><div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 12l3 3 5-6"/></svg><span style="font-size:12px;font-weight:700;color:#0f2a4a">自動チェック</span></div><div style="display:flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg><span style="font-size:12px;font-weight:700;color:#0f2a4a">推移グラフ</span></div><div style="display:flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8"/></svg><span style="font-size:12px;font-weight:700;color:#0f2a4a">自動保存</span></div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">✅</span><span style="font-size:12px;font-weight:700;color:#0f2a4a">自動チェック</span></div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">📈</span><span style="font-size:12px;font-weight:700;color:#0f2a4a">推移グラフ</span></div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">💾</span><span style="font-size:12px;font-weight:700;color:#0f2a4a">自動保存</span></div></div></div>`,
  principle:"カラフルな絵文字ピクトグラムの多用は「AIっぽさ」の筆頭",
  explain:"✅📈💾のような絵文字アイコンは手軽ですが、OSごとに見た目が変わり、色もタッチも制御できず、そして何よりAI生成コンテンツの定番の見た目になりました。線の太さと色を統一した1セットのアイコンに置き換えるだけで、「作り込まれたプロダクト」の顔になります。"
},
{
  g:"質感と装飾", cat:"メニューに並ぶアイコン",
  title:"アイコンの色数",
  context:"各機能に添えるアイコンの塗り方です。プロダクトとして締まるのはどちらでしょう？",
  la:"単色の線画で揃える", lb:"機能ごとに多色塗り",
  good:`<div class="mock"><div style="display:flex;gap:10px;justify-content:center"><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>分析</span><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>帳票</span><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>保護</span></div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:10px;justify-content:center"><span class="micon" style="border:0"><span style="display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#34d399,#059669);color:#fff;font-size:13px">📈</span>分析</span><span class="micon" style="border:0"><span style="display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;font-size:13px">📄</span>帳票</span><span class="micon" style="border:0"><span style="display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#a78bfa,#7c3aed);color:#fff;font-size:13px">🔒</span>保護</span></div></div>`,
  principle:"アイコンは単色1トーンで統一する（多色アイコンはノイズ）",
  explain:"緑・オレンジ・紫…と1個ずつ違う色のグラデーションタイルに載ったアイコンは、AI生成LPやテンプレートの典型で、画面の色数を一気に押し上げます。アイコンの仕事は目印であって主役ではありません。ブランド色1色の線画に揃えると、画面全体が静かに締まります。"
},
{
  g:"質感と装飾", cat:"AI機能のアピール",
  title:"「THE AI」ピクトグラム",
  context:"AIを使った機能を紹介します。中身が伝わり信頼されるのはどちらでしょう？",
  la:"何ができるかを書く", lb:"✨と🤖の記号で語る",
  good:`<div class="mock"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b6ea5" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 12l3 3 5-6"/></svg><b style="font-size:12px;color:#0f2a4a">仕訳の自動提案</b></div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.7">過去の仕訳パターンを学習し、摘要から勘定科目を提案します。確定は必ず人が行います。</div></div>`,
  bad:`<div class="mock" style="text-align:center"><div style="font-size:22px;margin-bottom:2px">✨🤖✨</div><b style="font-size:13px;background:linear-gradient(90deg,#8b5cf6,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent">AI搭載！次世代スマート会計</b><div style="font-size:10px;color:#8d97a3;margin-top:2px">🧠 最先端AIがすべてを自動化 ✨</div></div>`,
  principle:"✨🤖🧠の「AIピクト」は、中身のなさの記号",
  explain:"キラキラ・ロボット・脳のピクトグラムでAIを表現するのは、いまや全プロダクトがやり尽くした型で、「詳細は考えていません」というシグナルにすらなっています。信頼されるAI機能の見せ方は、何を入力すると何が起き、人は何を確認するのかを普通の言葉で書くことです。"
},
{
  g:"質感と装飾", cat:"セクションの空きスペース",
  title:"意味のない装飾シェイプ",
  context:"見出しまわりの装飾です。洗練されて見えるのはどちらでしょう？",
  la:"余白をそのまま活かす", lb:"図形やドットを散らす",
  good:`<div class="mock" style="padding:22px 16px"><div style="font-size:10px;letter-spacing:.18em;color:#3b6ea5;font-weight:700">FLOW</div><div style="font-size:15px;font-weight:900;color:#0f2a4a;margin-top:2px">ご利用の流れ</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-top:6px">お申し込みから最短3日で利用開始できます。</div></div>`,
  bad:`<div class="mock" style="padding:22px 16px;position:relative;overflow:hidden"><span style="position:absolute;left:6px;top:6px;width:34px;height:34px;background:radial-gradient(circle,#c3d2e2 2px,transparent 2.5px);background-size:8px 8px"></span><span style="position:absolute;right:-8px;top:-8px;width:40px;height:40px;border-radius:50%;border:6px solid #f6c26b;opacity:.5"></span><span style="position:absolute;right:30px;bottom:8px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:16px solid #9db8d2;transform:rotate(18deg);opacity:.6"></span><div style="font-size:10px;letter-spacing:.18em;color:#3b6ea5;font-weight:700">〜 FLOW 〜</div><div style="font-size:15px;font-weight:900;color:#0f2a4a;margin-top:2px">ご利用の流れ</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-top:6px">お申し込みから最短3日で利用開始できます。</div></div>`,
  principle:"意味を持たない図形・ドット・波線は置かない",
  explain:"角のドットパターン、浮いた円、散らばる三角——空白を埋めるための装飾は、テンプレートやAI生成デザインの「賑やかし」の典型です。空白は埋めるものではなく、視線を休ませ内容を際立たせる道具。飾りたくなったら、まず余白のまま様子を見るのが正解です。"
},
{
  g:"質感と装飾", cat:"ヒーローの見出し文字",
  title:"文字へのグラデーション",
  context:"キャッチコピーの文字の塗りです。読みやすく品があるのはどちらでしょう？",
  la:"単色の文字", lb:"グラデーション文字",
  good:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:16px;font-weight:900;color:#0f2a4a;line-height:1.5">会社の未来を、<br>数字から考える。</div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:16px;font-weight:900;line-height:1.5;background:linear-gradient(90deg,#8b5cf6,#ec4899 50%,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent">会社の未来を、<br>数字から考える。</div></div>`,
  principle:"文字にグラデーションをかけない",
  explain:"グラデーション文字はAI生成ヒーローセクションの定番装飾ですが、場所によって文字色が変わるため輪郭の知覚が不安定になり、可読性が下がります。コピーの説得力は塗りの派手さではなく言葉とタイポグラフィから生まれます。文字は単色、が原則です。"
},
// ---------- 画面の整え方（13問） ----------
{
  g:"画面の整え方", cat:"カード内の詰め込み",
  title:"余白のゆとり",
  context:"同じ内容のカードです。内容が頭に入りやすいのはどちらでしょう？",
  la:"余白にゆとり", lb:"隙間なく詰め込む",
  good:`<div class="mock" style="padding:20px"><b style="font-size:13px;color:#0f2a4a">決算診断レポート</b><div style="height:8px"></div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8">直近3期の決算書から、収益性・安全性・成長性を診断します。</div><div style="height:12px"></div><span class="mb mb-p" style="padding:7px 16px;font-size:11px">診断を始める</span></div>`,
  bad:`<div class="mock" style="padding:6px"><b style="font-size:13px;color:#0f2a4a">決算診断レポート</b><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.3;margin:1px 0">直近3期の決算書から、収益性・安全性・成長性を診断します。財務の弱点と改善の方向性がわかります。所要3分。</div><span class="mb mb-p" style="padding:4px 10px;font-size:11px;margin-top:1px">診断を始める</span></div>`,
  principle:"余白は要素と同じくらい重要な部品",
  explain:"余白は「無駄なスペース」ではなく、情報の切れ目と重要度を伝える設計要素です。詰め込まれた画面は一見情報量が多く見えて、実際にはどこも読まれません。窮屈に感じたら、要素を削って余白を守るのが正しい順番です。"
},
{
  g:"画面の整え方", cat:"重要なお知らせの強調",
  title:"強調手段の重ね掛け",
  context:"1つの文を目立たせたい場面です。上品に伝わるのはどちらでしょう？",
  la:"強調は1つに絞る", lb:"全部盛りにする",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">お申し込みは<b style="color:#0f2a4a">9月30日（水）まで</b>です。定員になり次第、受付を終了します。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">お申し込みは<b style="color:#ff0000;text-decoration:underline;background:#ffff00;font-size:14px;font-style:italic">『9月30日（水）まで』！！</b>です。定員になり次第、受付を終了します！</div></div>`,
  principle:"強調手段は1つに絞る（太字＋赤＋マーカー＋！は逆効果）",
  explain:"太字・赤・下線・マーカー・感嘆符を重ねるほど切迫感は増しますが、信頼感は急落します（迷惑メールの見た目に近づくため）。強調は「太字だけ」「色だけ」のように1手段で十分。静かな強調ほど、大人の説得力があります。"
},
{
  g:"画面の整え方", cat:"ページの区切り方",
  title:"枠で囲みすぎ問題",
  context:"複数のセクションを区切ります。すっきり見えるのはどちらでしょう？",
  la:"余白と見出しで区切る", lb:"全部枠で囲む",
  good:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#2d5580;border-left:3px solid #3b6ea5;padding-left:8px;margin-bottom:4px">収益性</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-bottom:12px">営業利益率 13.1%</div><div style="font-size:12px;font-weight:700;color:#2d5580;border-left:3px solid #3b6ea5;padding-left:8px;margin-bottom:4px">安全性</div><div style="font-size:11px;font-weight:400;color:#4a5460">自己資本比率 42.5%</div></div>`,
  bad:`<div class="mock"><div style="border:2px solid #8d97a3;border-radius:6px;padding:8px;margin-bottom:8px"><div style="border:1px dashed #8d97a3;padding:6px"><div style="font-size:12px;font-weight:700;color:#2d5580;border-bottom:1px solid #8d97a3;padding-bottom:3px;margin-bottom:3px">収益性</div><div style="font-size:11px;font-weight:400;color:#4a5460">営業利益率 13.1%</div></div></div><div style="border:2px solid #8d97a3;border-radius:6px;padding:8px"><div style="border:1px dashed #8d97a3;padding:6px"><div style="font-size:12px;font-weight:700;color:#2d5580;border-bottom:1px solid #8d97a3;padding-bottom:3px;margin-bottom:3px">安全性</div><div style="font-size:11px;font-weight:400;color:#4a5460">自己資本比率 42.5%</div></div></div></div>`,
  principle:"枠で囲む前に、余白と見出しで区切れないか考える",
  explain:"枠線は最も「うるさい」区切り方です。枠の中に枠、その中にまた線…と重なると、線を見るだけで疲れる画面になります。まず余白で区切り、足りなければ見出し、それでも足りないときに初めて枠——の順で検討します。"
},
{
  g:"画面の整え方", cat:"メニューのラベル",
  title:"バッジの乱用",
  context:"メニュー項目に付けるNEW・おすすめバッジです。効果があるのはどちらでしょう？",
  la:"本当に新しい1つだけ", lb:"全項目に何かのバッジ",
  good:`<div class="mock"><div class="mmenu"><div>自社株評価</div><div>退職金試算 <span style="background:#a83d3d;color:#fff;border-radius:3px;padding:1px 6px;font-size:9px;font-weight:700;margin-left:4px">NEW</span></div><div>将来負債の試算</div><div>非課税枠の確認</div></div></div>`,
  bad:`<div class="mock"><div class="mmenu"><div>自社株評価 <span style="background:#ff9800;color:#fff;border-radius:3px;padding:1px 6px;font-size:9px;font-weight:700;margin-left:4px">人気</span></div><div>退職金試算 <span style="background:#a83d3d;color:#fff;border-radius:3px;padding:1px 6px;font-size:9px;font-weight:700;margin-left:4px">NEW</span></div><div>将来負債の試算 <span style="background:#4caf50;color:#fff;border-radius:3px;padding:1px 6px;font-size:9px;font-weight:700;margin-left:4px">おすすめ</span></div><div>非課税枠の確認 <span style="background:#9c27b0;color:#fff;border-radius:3px;padding:1px 6px;font-size:9px;font-weight:700;margin-left:4px">HOT</span></div></div></div>`,
  principle:"バッジは希少だから機能する",
  explain:"全項目にNEW・人気・おすすめが付いていると、どれも特別ではなくなり、バッジは単なるノイズになります。強調の総量は一定で、配るほど1つあたりの効果が薄まります。「本当に推したい1つ」にだけ付けるのがバッジの正しい使い方です。"
},
{
  g:"画面の整え方", cat:"見出しの飾り文字",
  title:"記号による見出し装飾",
  context:"セクション見出しの見せ方です。洗練されて見えるのはどちらでしょう？",
  la:"タイポグラフィで見せる", lb:"【】★◆で飾る",
  good:`<div class="mock"><div style="font-size:10px;letter-spacing:.18em;color:#3b6ea5;font-weight:700;margin-bottom:2px">SERVICE</div><div style="font-size:15px;font-weight:900;color:#0f2a4a">サービス内容</div><div style="width:36px;height:3px;background:#3b6ea5;border-radius:2px;margin-top:6px"></div></div>`,
  bad:`<div class="mock"><div style="font-size:15px;font-weight:900;color:#0f2a4a;text-align:center">◆◇【 ★サービス内容★ 】◇◆</div><div style="font-size:10px;color:#8d97a3;text-align:center;margin-top:2px">～充実のラインナップ～</div></div>`,
  principle:"見出しを記号で飾らない（【】★◆～は素人感の記号）",
  explain:"【】や★、～～は「装飾の道具がなかった時代」の名残で、今使うとチラシ的な素人感が出ます。現代の見出しは、英字キッカー・サイズ差・短いアンダーラインなど、タイポグラフィそのもので格を作ります。記号を消すだけで一段洗練されます。"
},
{
  g:"画面の整え方", cat:"特徴リストの書き方",
  title:"行頭の絵文字連打",
  context:"サービスの特徴を箇条書きにします。信頼感が出るのはどちらでしょう？",
  la:"静かな箇条書き", lb:"行頭に絵文字を連打",
  good:`<div class="mock"><b style="font-size:12px;color:#0f2a4a">このツールの特徴</b><ul style="margin:8px 0 0 18px;font-size:11px;font-weight:400;color:#4a5460;line-height:2"><li>決算書2期分だけで診断できます</li><li>結果はA4一枚のPDFで出力できます</li><li>データはブラウザ内にのみ保存されます</li></ul></div>`,
  bad:`<div class="mock"><b style="font-size:12px;color:#0f2a4a">🚀 このツールの特徴 ✨</b><div style="margin-top:8px;font-size:11px;font-weight:400;color:#4a5460;line-height:2">✅ 決算書2期分だけで診断できます！<br>📊 結果はA4一枚のPDFで出力できます！<br>🔒 データはブラウザ内にのみ保存されます！</div></div>`,
  principle:"行頭の絵文字連打（✅🚀✨）はAI生成テキストの記号",
  explain:"各行の頭に✅や🚀を並べるスタイルは、AIが生成する文章の定番フォーマットとして広く認知されてしまいました。ビジネスの文面では、静かな「・」の箇条書きと文末の抑制（！を使わない）の方が、内容への信頼を生みます。"
},
{
  g:"画面の整え方", cat:"特徴セクションの構成",
  title:"均質カードの羅列",
  context:"6つの特徴を見せるセクションです。記憶に残るのはどちらでしょう？",
  la:"重要度で強弱をつける", lb:"同じ顔のカードを並べる",
  good:`<div class="mock"><div style="background:#0f2a4a;color:#fff;border-radius:8px;padding:12px;margin-bottom:6px"><div style="font-size:12px;font-weight:700">決算書2期分で、3分で診断</div><div style="font-size:10px;opacity:.75">いちばんの特徴を大きく1枚で</div></div><div style="display:flex;gap:6px"><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:8px"><div style="font-size:10px;font-weight:700;color:#0f2a4a">PDF出力</div></div><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:8px"><div style="font-size:10px;font-weight:700;color:#0f2a4a">自動保存</div></div><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:8px"><div style="font-size:10px;font-weight:700;color:#0f2a4a">業界比較</div></div></div></div>`,
  bad:`<div class="mock"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">📊</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">かんたん診断</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">📄</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">PDF出力</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">💾</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">自動保存</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">📈</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">業界比較</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">🔒</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">安全設計</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px">💬</div><div style="font-size:9px;font-weight:700;color:#0f2a4a">サポート</div><div style="font-size:8px;color:#8d97a3">説明テキスト</div></div></div></div>`,
  principle:"「アイコン＋見出し＋3行」の均質グリッドはテンプレ感の温床",
  explain:"同じ大きさのカードを3×2で並べる構成は、AI生成LPやテンプレートの典型で、6つ並べても1つも記憶に残りません。特徴には必ず序列があります。一番の強みを大きく扱い、残りを小さく従わせる——強弱こそが「設計した」証拠になります。"
},
{
  g:"画面の整え方", cat:"トップページのコピー",
  title:"無個性なキャッチコピー",
  context:"財務ツールのファーストビューです。使う理由が伝わるのはどちらでしょう？",
  la:"具体的な価値を書く", lb:"抽象的なかっこいい言葉",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#091a30,#1c3f68);padding:18px;color:#fff"><div style="font-size:14px;font-weight:700;line-height:1.5;margin-bottom:4px">決算書2期分で、<br>自社の「値段」がわかる。</div><div style="font-size:10px;opacity:.75">自社株評価を3分で試算・登録不要</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#091a30,#1c3f68);padding:18px;color:#fff"><div style="font-size:14px;font-weight:700;line-height:1.5;margin-bottom:4px">未来を、もっとスマートに。</div><div style="font-size:10px;opacity:.75">Empowering Your Business Journey</div></div></div>`,
  principle:"「未来を、もっとスマートに」型の抽象コピーは何も伝えない",
  explain:"どの会社にも当てはまる抽象コピーは、AIに「かっこいいコピーを書いて」と頼んだときの典型出力でもあります。ファーストビューの仕事は雰囲気づくりではなく、「誰の・何が・どれだけ良くなるか」を5秒で伝えること。具体性こそ最強の差別化です。"
},
{
  g:"画面の整え方", cat:"実績・レビューの見せ方",
  title:"信頼の演出のリアリティ",
  context:"利用者の声セクションです。信頼につながるのはどちらでしょう？",
  la:"具体的な事実", lb:"星5と匿名の顔アイコン",
  good:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:10px"><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.7">「退職金の原資計画を、顧問税理士との打ち合わせ前に自分で確認できるようになりました」</div><div style="font-size:10px;color:#8d97a3;margin-top:6px">製造業・従業員28名・代表取締役（利用2年目）</div></div></div>`,
  bad:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;margin-bottom:2px">👤</div><div style="color:#f59e0b;font-size:13px;letter-spacing:2px">★★★★★</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-top:4px">「最高のツールです！人生が変わりました！」</div><div style="font-size:10px;color:#8d97a3;margin-top:4px">— A.Tさん</div></div></div>`,
  principle:"汎用の星5＋匿名アイコンは、かえって信頼を下げる",
  explain:"顔のない👤アイコン、星5つ、「人生が変わりました！」——この組み合わせは捏造レビューやAI生成LPの定番で、見た人の警戒心を起動します。業種・規模・利用場面という検証可能な具体性が、演出をやめた分だけ信頼を積み上げます。"
},
{
  g:"画面の整え方", cat:"ページ全体のレイアウト",
  title:"全部中央寄せの誘惑",
  context:"説明の多いページの組み方です。読みやすく設計されて見えるのはどちらでしょう？",
  la:"左揃え基調で強弱", lb:"完全対称・全部中央",
  good:`<div class="mock"><div style="font-size:13px;font-weight:900;color:#0f2a4a;margin-bottom:4px">診断でわかること</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8;margin-bottom:8px">収益性・安全性・成長性の3分野を、業界平均と比較しながら診断します。</div><ul style="margin-left:18px;font-size:11px;font-weight:400;color:#4a5460;line-height:1.9"><li>強み・弱みの分野がわかる</li><li>改善の優先順位がわかる</li></ul></div>`,
  bad:`<div class="mock" style="text-align:center"><div style="font-size:13px;font-weight:900;color:#0f2a4a;margin-bottom:4px">診断でわかること</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8;margin-bottom:8px">収益性・安全性・成長性の3分野を、業界平均と比較しながら診断します。</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.9">強み・弱みの分野がわかる<br>改善の優先順位がわかる</div></div>`,
  principle:"長い文章と箇条書きを中央寄せにしない",
  explain:"すべてを中央寄せにした完全対称のページは、一見整って見えますが、行頭の位置が毎行変わるため長文が読みにくく、AI生成スライドのような均質さも出ます。中央寄せは短い見出しの特権。本文と箇条書きは左揃えが原則です。"
},
{
  g:"画面の整え方", cat:"注釈だらけの画面",
  title:"小さい文字の使いすぎ",
  context:"注意書きの多い画面です。誠実に情報が届くのはどちらでしょう？",
  la:"本文サイズを基本に", lb:"極小文字が画面の大半",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">試算結果は概算です。実際の税額は税理士等の専門家にご確認ください。</div><div class="ms" style="margin-top:8px">※2026年8月時点の税制に基づく</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a">試算完了！</div><div style="font-size:8px;font-weight:400;color:#8d97a3;line-height:1.5;margin-top:4px">※本試算結果はあくまで概算値であり実際の数値とは異なる場合があります※税制改正等により計算結果が変動する可能性があります※本ツールの利用により生じたいかなる損害についても当社は責任を負いかねます※詳細は利用規約をご確認ください※実際の税務判断は必ず税理士等の専門家にご相談ください</div></div>`,
  principle:"「※の極小文字」が増えるのは、情報設計の敗北",
  explain:"8px前後の注釈がびっしり並ぶ画面は、読ませる気がないことが透けて見え、かえって不信感を生みます（AI生成ページにも異様に小さい文字の多用がよく見られます）。注意書きは本当に必要なものに絞って読めるサイズで書き、法的な定型文は規約ページへ逃がします。"
},
{
  g:"画面の整え方", cat:"見出しと本文のメリハリ",
  title:"サイズ差（ジャンプ率）",
  context:"見出しと本文の大きさの関係です。構造が一瞬で伝わるのはどちらでしょう？",
  la:"はっきりしたサイズ差", lb:"どれも似たサイズ",
  good:`<div class="mock"><div style="font-size:17px;font-weight:900;color:#0f2a4a;line-height:1.4">損益分岐点を知る</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8;margin-top:4px">売上がいくらを下回ると赤字になるのか。固定費と変動費率から、その境界線を計算できます。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12.5px;font-weight:700;color:#2b323d;line-height:1.6">損益分岐点を知る</div><div style="font-size:11.5px;font-weight:700;color:#2b323d;line-height:1.6;margin-top:2px">売上がいくらを下回ると赤字になるのか。固定費と変動費率から、その境界線を計算できます。</div></div>`,
  principle:"ジャンプ率（サイズ差）が小さい画面は、単調で読みにくい",
  explain:"見出し12.5px・本文11.5pxのような僅差では、どこが見出しでどこが本文か一瞥で判別できず、画面全体がのっぺりします。見出しは本文の1.5〜2倍を目安に思い切って差をつける。メリハリは飾りではなく、読み手への道案内です。"
},
{
  g:"画面の整え方", cat:"キャッチコピーの折り返し",
  title:"見出しの改行位置",
  context:"2行になる見出しの改行の入れ方です。すっと読めるのはどちらでしょう？",
  la:"意味の切れ目で改行", lb:"中途半端な位置で切れる",
  good:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.6">決算書を入れるだけで、<br>会社の値段がわかる。</div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.6">決算書を入れるだけで、会社の値<br>段がわかる。</div></div>`,
  principle:"見出しは意味の単位で改行を制御する",
  explain:"「会社の値／段」のように単語の途中で折り返された見出しは、読み手の頭の中で一度分解・再結合が起き、コピーの力が半減します。重要な見出しは幅任せにせず、意味の切れ目に改行を入れて制御します。日本語の見出しは「どこで切るか」までがデザインです。"
},
// ---------- 言葉とトーン（10問） ----------
{
  g:"言葉とトーン", cat:"サービスの紹介文",
  title:"華美な言葉遣い",
  context:"ツールの強みを伝える文章です。信頼されるのはどちらでしょう？",
  la:"数字と事実で語る", lb:"圧倒的・究極・革命的",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">決算書2期分の入力で、株価を<b style="color:#0f2a4a">3分</b>で試算。全国<b style="color:#0f2a4a">1,200社</b>の保険営業の現場で使われています。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8"><b style="color:#0f2a4a">圧倒的</b>な精度と<b style="color:#0f2a4a">究極</b>の使いやすさ。<b style="color:#0f2a4a">革命的</b>な財務分析体験が、あなたのビジネスを新次元へ導きます。</div></div>`,
  principle:"「圧倒的・究極・革命的」は中身がない印——数字で語る",
  explain:"最上級の形容詞を重ねる文体は、AIにコピーを頼んだときの典型出力でもあり、読み手は無意識に「具体的な強みがないのだな」と翻訳します。かかった時間・使っている社数・削減できた工数——検証できる事実だけが信頼を積みます。"
},
{
  g:"言葉とトーン", cat:"コピーの強調記号",
  title:"『』と“”の多用",
  context:"キャッチコピーでの括弧の使い方です。すっきり伝わるのはどちらでしょう？",
  la:"語順と太字で強調", lb:"括弧をちりばめる",
  good:`<div class="mock"><div style="font-size:13px;font-weight:400;color:#2b323d;line-height:1.9">経営の数字を見える化し、<b>次の一手</b>を考える材料にする。それがこのツールの役割です。</div></div>`,
  bad:`<div class="mock"><div style="font-size:13px;font-weight:400;color:#2b323d;line-height:1.9">『経営』の数字を“見える化”し、『未来』への“羅針盤”に——。それが“このツール”の『役割』です。</div></div>`,
  principle:"『』や“”の多用はAI文体の癖——括弧に頼らず語順で強調する",
  explain:"AIが生成する日本語コピーには『』と“”を過剰にちりばめる癖があり、いまや見た瞬間に生成文だと分かる記号になりました。括弧の強調は1文に1箇所まで。それ以上強調したいなら、文を短くして語順を工夫する方がはるかに強く伝わります。"
},
{
  g:"言葉とトーン", cat:"日本語サイトのボタン",
  title:"中途半端な英語ボタン",
  context:"日本の中小企業経営者向けサイトのボタン文言です。迷わず押せるのはどちらでしょう？",
  la:"日本語で書く", lb:"Get Started / Learn More",
  good:`<div class="mock" style="text-align:center"><span class="mb mb-p mb-block" style="margin-bottom:8px">無料で試算を始める</span><span class="mb mb-g mb-block">機能の詳細を見る</span></div>`,
  bad:`<div class="mock" style="text-align:center"><span class="mb mb-p mb-block" style="margin-bottom:8px">Get Started</span><span class="mb mb-g mb-block">Learn More</span></div>`,
  principle:"行動を求めるボタンに、読者の母語以外を使わない",
  explain:"「Get Started」「Learn More」は海外テンプレートやAI生成UIをそのまま持ってきた痕跡で、日本の経営者層には意味の解読という余計な一手間を課します。ボタンは迷いをゼロにする場所。かっこよさは英字キッカーなどの装飾に任せ、行動の言葉は日本語で書きます。"
},
{
  g:"言葉とトーン", cat:"セクションの見出し",
  title:"英語かぶれの見出し",
  context:"サービス紹介セクションの見出しです。内容が伝わるのはどちらでしょう？",
  la:"日本語見出し＋英字飾り", lb:"英語だけの見出し",
  good:`<div class="mock"><div style="font-size:10px;letter-spacing:.18em;color:#3b6ea5;font-weight:700">SERVICE</div><div style="font-size:15px;font-weight:900;color:#0f2a4a;margin-top:2px">私たちができること</div></div>`,
  bad:`<div class="mock"><div style="font-size:15px;font-weight:900;color:#0f2a4a">Our Solutions</div><div style="font-size:10px;color:#8d97a3;margin-top:2px">Empowering your business growth</div></div>`,
  principle:"英語は飾り（キッカー）に、意味は日本語で",
  explain:"見出しそのものを英語にすると、読み飛ばす人が確実に出ます。英字の雰囲気が欲しいなら、小さなキッカー（SERVICE等）として日本語見出しの上に添えるのが定石。「装飾は英語・情報は日本語」と役割を分ければ、雰囲気と伝達を両立できます。"
},
{
  g:"言葉とトーン", cat:"提案書風の説明文",
  title:"カタカナ語の乱用",
  context:"中小企業の経営者に向けた説明文です。話が入ってくるのはどちらでしょう？",
  la:"平易な日本語", lb:"カタカナ語で武装",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">部門ごとの数字を一つにまとめ、会社全体でどこに無駄があるかを見つけます。改善の効果は毎月の数字で確認できます。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">セクション間のシナジーをマキシマイズし、ボトルネックをアジャイルにソリューション。KPIドリブンなPDCAでビジネスをドライブします。</div></div>`,
  principle:"カタカナ語は、相手が日常で使う語彙まで絞る",
  explain:"カタカナ語の密度が上がるほど、内容は薄く見え、読者は置き去りになります。専門家に見せたいという動機で使われがちですが、実際には逆効果。「中学生にも伝わる言葉で書けるか」を通過してから、業界で必須の用語だけを残します。"
},
{
  g:"言葉とトーン", cat:"お知らせ文のトーン",
  title:"「！」の乱用",
  context:"機能リリースのお知らせ文です。大人のプロダクトに見えるのはどちらでしょう？",
  la:"静かに伝える", lb:"感嘆符を連打",
  good:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:4px">PDF出力に対応しました</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.7">試算結果をA4一枚のレポートとして保存できます。金融機関への提出資料にもご利用ください。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:4px">PDF出力に対応しました！！</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.7">試算結果をA4一枚のレポートとして保存できます！金融機関への提出資料にも使えて超便利！ぜひお試しください！！</div></div>`,
  principle:"「！」は在庫僅少——ここぞの一回だけ",
  explain:"感嘆符は使うたびに効果が目減りする資源です。毎文に付くと文章全体が軽くなり、業務ツールの信頼感と相性が最悪です。良い知らせは内容が伝われば十分に嬉しい。トーンは静かに、事実は具体的に、が大人のプロダクトの文体です。"
},
{
  g:"言葉とトーン", cat:"機能一覧のコピー",
  title:"機械的な言い回しの連発",
  context:"3つの機能を紹介する文言です。それぞれの価値が伝わるのはどちらでしょう？",
  la:"具体的な動詞で書き分ける", lb:"「〜を実現/加速/最大化」",
  good:`<div class="mock"><div style="font-size:11.5px;font-weight:400;color:#4a5460;line-height:2"><b style="color:#0f2a4a">株価試算</b>｜決算書2期分から3分で算出<br><b style="color:#0f2a4a">原資計画</b>｜退職金の不足額を毎年更新<br><b style="color:#0f2a4a">帳票出力</b>｜金融機関に出せるA4一枚に</div></div>`,
  bad:`<div class="mock"><div style="font-size:11.5px;font-weight:400;color:#4a5460;line-height:2"><b style="color:#0f2a4a">株価試算</b>｜スマートな経営を実現<br><b style="color:#0f2a4a">原資計画</b>｜意思決定を加速<br><b style="color:#0f2a4a">帳票出力</b>｜業務効率を最大化</div></div>`,
  principle:"「〜を実現・加速・最大化」の三段活用は、AIコピーの型",
  explain:"どの機能にも付けられる汎用述語（実現・加速・最大化・向上）は、何も説明していないのと同じで、AI生成コピーの典型的な癖でもあります。機能ごとに「何が・どれだけ・どうなる」を固有の動詞と数字で書き分けたとき、初めて読み手は違いを理解できます。"
},
{
  g:"言葉とトーン", cat:"操作説明の文章",
  title:"へりくだりすぎる文",
  context:"機能の説明文です。すっと頭に入るのはどちらでしょう？",
  la:"簡潔な敬体", lb:"「させていただく」の連打",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">試算結果はPDFで保存できます。保存したファイルはマイページからいつでも確認できます。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">本ツールでは、試算結果をPDF形式にてダウンロードさせていただくことが可能となっております。保存させていただいたファイルにつきましては、マイページよりご確認いただけるようになっております。</div></div>`,
  principle:"「させていただく」を削ると、文が立つ",
  explain:"「〜させていただくことが可能となっております」は、丁寧に見えて実は読み手の時間を奪う脂肪です。UIの文章は敬意を保ちつつ最短で意味が届くこと。「保存できます」「確認できます」——シンプルな敬体こそが、ユーザーへの本当の敬意です。"
},
{
  g:"言葉とトーン", cat:"案内メッセージの温度感",
  title:"過剰なフレンドリーさ",
  context:"業務ツールの操作案内です。経営者向けとして適切なのはどちらでしょう？",
  la:"落ち着いた案内", lb:"テンション高めの口語",
  good:`<div class="mock"><div class="mcoach" style="margin-top:0"><span class="cstep">STEP 1</span><br>まず、直近の決算書2期分をご用意ください。貸借対照表と損益計算書を使用します。</div></div>`,
  bad:`<div class="mock"><div class="mcoach" style="margin-top:0"><span class="cstep">STEP 1</span><br>さっそく始めちゃいましょう！まずは決算書を2期分、サクッと用意してくださいね♪ 難しくないので安心してください！</div></div>`,
  principle:"トーンは読者の場面に合わせる——業務には静かな敬体",
  explain:"「〜しちゃいましょう！」「サクッと」「♪」は、消費者向けアプリなら親しみでも、お金の判断をする場面では軽薄さに変わります。文体はUIの制服です。読者が誰で、どんな気持ちのときに読むのかから逆算して、温度を一定に保ちます。"
},
{
  g:"言葉とトーン", cat:"専門的な結果の説明",
  title:"専門用語の裸出し",
  context:"試算結果の項目名です。専門家でない社長にも伝わるのはどちらでしょう？",
  la:"相手の言葉に橋を架ける", lb:"正式名称をそのまま",
  good:`<div class="mock"><div class="ms" style="margin-bottom:2px">会社の値段（株価評価額）</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:22px">4</span><span style="font-size:13px;color:#56626f">億</span><span style="font-size:22px">2,800</span><span style="font-size:13px;color:#56626f">万円</span></div><div class="ms" style="margin-top:4px">国税庁の方式（類似業種比準×純資産の併用）で算定</div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:2px">類似業種比準方式及び純資産価額方式の併用方式による評価額（L=0.75）</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:22px">4</span><span style="font-size:13px;color:#56626f">億</span><span style="font-size:22px">2,800</span><span style="font-size:13px;color:#56626f">万円</span></div></div>`,
  principle:"専門用語には、相手の言葉の橋を架ける",
  explain:"正式名称は正確ですが、読み手が翻訳できなければ情報は届いていません。「会社の値段（株価評価額）」のように相手の言葉を先に置き、正式名称は括弧や補足に降ろす。正確さと分かりやすさは、順番を工夫すれば両立できます。"
},
]};
