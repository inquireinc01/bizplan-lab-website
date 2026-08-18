// UX CHOICE LAB — コース4: 色彩ラベル編（20問）
// すべての色に「色名＋HEX＋HSL（色相・彩度・明度）」を表記。色の見え方に関わらず数値で判断できる。
window.COURSE_COLOR = {
  id: "color",
  title: "色彩ラベル編",
  en: "COLOR BY NUMBERS",
  desc: "すべての色に色名・HEX・HSL（色相/彩度/明度）を表記した色彩テスト20問。色の見え方に個人差があっても、数値と名前でカラーコーディネートのルールを身につけられます。",
  minutes: "約10",
  groups: [
    {name:"色相の組み立て", icon:"H", note:"色相環で考える"},
    {name:"明度とコントラスト", icon:"L", note:"明るさの差で読ませる"},
    {name:"彩度とトーン", icon:"S", note:"鮮やかさを制御する"},
    {name:"配色の実践", icon:"◐", note:"画面に落とし込む"}
  ],
  questions: [
// ---------- 色相の組み立て（5問） ----------
{
  g:"色相の組み立て", cat:"ブランドカラーの決め方",
  title:"ベースカラーとアクセントの色相差",
  context:"ベースがネイビー（色相 210°）です。アクセントとして目を引きやすい色相はどちらでしょう？",
  la:"補色側のオレンジ（30°）", lb:"隣のブルー（220°）",
  good:`<div class="mock"><div class="msw"><span class="chip" style="background:#0f2a4a"></span><div class="cl"><b>ネイビー</b>#0f2a4a<br>H 213° / S 66% / L 17%</div></div><div class="msw"><span class="chip" style="background:#c77b3a"></span><div class="cl"><b>アクセント：オレンジ</b>#c77b3a<br>H 28° / S 55% / L 50%</div></div><div class="ms" style="margin-top:6px">色相差 約185°（補色関係）</div></div>`,
  bad:`<div class="mock"><div class="msw"><span class="chip" style="background:#0f2a4a"></span><div class="cl"><b>ネイビー</b>#0f2a4a<br>H 213° / S 66% / L 17%</div></div><div class="msw"><span class="chip" style="background:#2f5f9e"></span><div class="cl"><b>アクセント：ブルー</b>#2f5f9e<br>H 214° / S 54% / L 40%</div></div><div class="ms" style="margin-top:6px">色相差 約1°（ほぼ同じ色相）</div></div>`,
  principle:"アクセントはベースの補色側（色相差150〜180°）から選ぶ",
  explain:"色相環で反対側（補色）に近い色ほど、ベースとの対比が強く「目を引く」役割を果たします。ネイビー（210°付近）に対して同じ青系（220°）ではベースに溶けて主張できません。数値で言えば「色相差150〜180°」を狙うのが基本です。"
},
{
  g:"色相の組み立て", cat:"配色の骨格づくり",
  title:"類似色相でまとめる",
  context:"落ち着いた統一感を出したい画面です。色相の選び方として正しいのはどちらでしょう？",
  la:"色相30°以内に収める", lb:"色相を120°ずつ離す",
  good:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#2f5f9e"></span><span class="chip lg" style="background:#4d84b8"></span></div><div class="cl">ネイビー H213° ／ ブルー H214° ／ ライトブルー H210°<br>→ 色相の幅は約4°（類似色相）</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#8a2f2f"></span><span class="chip lg" style="background:#2f7a3a"></span></div><div class="cl">ネイビー H213° ／ レッド H0° ／ グリーン H128°<br>→ 色相が約120°ずつ離れている（3色配色）</div></div>`,
  principle:"統一感は「色相の幅を30°以内」で作る",
  explain:"色相環上で近い色（類似色相）だけを使うと、色数があっても1つの世界観にまとまります。目安は色相の幅30°以内。逆に120°ずつ離した3色は「トライアド」と呼ばれる元気な配色で、統一感より賑やかさを求める場面向きです。"
},
{
  g:"色相の組み立て", cat:"警告色の設計",
  title:"意味色の色相を守る",
  context:"「エラー・警告」を伝える色を決めます。誰にでも意図が伝わりやすいのはどちらでしょう？",
  la:"赤系（色相0°付近）", lb:"紫系（色相280°）",
  good:`<div class="mock"><div class="msw"><span class="chip" style="background:#a83d3d"></span><div class="cl"><b>エラー：レッド</b>#a83d3d<br>H 0° / S 47% / L 45%</div></div><div class="merr" style="margin-top:6px">入力内容に誤りがあります</div><div class="ms">色相0°＝赤は世界共通の「警告」の色相</div></div>`,
  bad:`<div class="mock"><div class="msw"><span class="chip" style="background:#7b3fa8"></span><div class="cl"><b>エラー：パープル</b>#7b3fa8<br>H 274° / S 45% / L 45%</div></div><div style="color:#7b3fa8;font-size:11px;margin-top:6px">入力内容に誤りがあります</div><div class="ms">紫には「警告」の文化的意味がない</div></div>`,
  principle:"赤＝警告、緑＝成功、黄＝注意——意味色の色相は慣習に従う",
  explain:"色には文化的に定着した意味があります。エラーは赤（H 0°前後）、成功は緑（H 120°前後）、注意は黄〜橙（H 40°前後）。ここを独自の色にすると、ユーザーは学習し直しを強いられます。ブランド色は自由に選べますが、意味色は慣習に合わせるのが原則です。"
},
{
  g:"色相の組み立て", cat:"グラデーションの設計",
  title:"グラデーションの色相の跨ぎ方",
  context:"帯にグラデーションを使います。中間色が濁らないのはどちらでしょう？",
  la:"色相差20°以内", lb:"色相差120°",
  good:`<div class="mock"><div style="height:34px;border-radius:6px;background:linear-gradient(90deg,#0f2a4a,#2f5f9e);margin-bottom:8px"></div><div class="cl">ネイビー H213° → ブルー H214°<br>色相差 約1°：途中の色も同じ青系のまま</div></div>`,
  bad:`<div class="mock"><div style="height:34px;border-radius:6px;background:linear-gradient(90deg,#d64541,#2f7a3a);margin-bottom:8px"></div><div class="cl">レッド H2° → グリーン H128°<br>色相差 約126°：中間で茶色く濁る</div></div>`,
  principle:"グラデーションは色相差20°以内で（大きく跨ぐと中間が濁る）",
  explain:"RGBで補間されるグラデーションは、色相を大きく跨ぐと中間に灰色や茶色の濁った帯が生まれます。同系色（色相差20°以内）の濃淡グラデーションなら、どこを切り取っても綺麗な色です。色相を跨ぐなら、間に中継色を挟むのが安全です。"
},
{
  g:"色相の組み立て", cat:"カテゴリ色の割り当て",
  title:"多色を使うときの色相の間隔",
  context:"4カテゴリに色を割り当てます。互いに見分けやすいのはどちらでしょう？",
  la:"色相を90°ずつ均等に", lb:"色相が偏った4色",
  good:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#5c8272"></span><span class="chip lg" style="background:#c9a227"></span><span class="chip lg" style="background:#a83d3d"></span></div><div class="cl">ブルー H211° ／ グリーン H155° ／ イエロー H46° ／ レッド H0°<br>→ 色相が離れて配置されている</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#3f78b0"></span><span class="chip lg" style="background:#4682b8"></span><span class="chip lg" style="background:#4d8cc0"></span></div><div class="cl">H211° ／ H210° ／ H208° ／ H207°<br>→ 4色とも色相が5°以内に固まっている</div></div>`,
  principle:"見分けさせたい色は、色相を均等に離す（4色なら約90°間隔）",
  explain:"「統一感」と「識別性」は逆方向の要求です。カテゴリを見分けさせたいなら、色相環上で均等に離した色を選びます（4色なら約90°間隔）。同じ青系の微妙な差で分類すると、凡例と見比べないと判別できません。用途によって色相の間隔を使い分けます。"
},
// ---------- 明度とコントラスト（6問） ----------
{
  g:"明度とコントラスト", cat:"本文テキストの色",
  title:"文字と背景の明度差",
  context:"白背景（L 100%）に載せる本文の色です。誰でも読めるのはどちらでしょう？",
  la:"L 20%の濃いグレー", lb:"L 75%の薄いグレー",
  good:`<div class="mock"><div style="color:#2b323d;font-size:13px;margin-bottom:8px">読みやすい本文の見本です。</div><div class="cl"><b>文字：チャコール</b>#2b323d　H 217° / S 17% / <u>L 20%</u><br>背景：白 L 100%　→ 明度差 80pt／コントラスト比 約13:1</div></div>`,
  bad:`<div class="mock"><div style="color:#bfc4ca;font-size:13px;margin-bottom:8px">読みにくい本文の見本です。</div><div class="cl"><b>文字：ライトグレー</b>#bfc4ca　H 213° / S 9% / <u>L 77%</u><br>背景：白 L 100%　→ 明度差 23pt／コントラスト比 約1.8:1</div></div>`,
  principle:"本文は明度差50pt以上（コントラスト比4.5:1以上）を確保する",
  explain:"色の見分けは色相ではなく明度差で決まります。WCAGの基準は本文でコントラスト比4.5:1以上。数値の目安として、白背景なら文字の明度（L）は45%以下にします。「おしゃれな薄いグレー」は明度が高すぎて基準を満たせません。"
},
{
  g:"明度とコントラスト", cat:"ボタンの文字色",
  title:"色付き背景に載せる文字",
  context:"アクセントカラーのボタンに文字を載せます。読めるのはどちらでしょう？",
  la:"L 40%の背景に白文字", lb:"L 70%の背景に白文字",
  good:`<div class="mock"><span class="mb mb-block" style="background:#2d5580;color:#fff;margin-bottom:8px">試算する</span><div class="cl"><b>背景：ダークブルー</b>#2d5580　H 211° / S 48% / <u>L 34%</u><br>文字：白 L 100%　→ 明度差 66pt／約7.5:1</div></div>`,
  bad:`<div class="mock"><span class="mb mb-block" style="background:#8fb3d9;color:#fff;margin-bottom:8px">試算する</span><div class="cl"><b>背景：ライトブルー</b>#8fb3d9　H 211° / S 49% / <u>L 71%</u><br>文字：白 L 100%　→ 明度差 29pt／約2:1</div></div>`,
  principle:"白文字を載せる背景は明度45%以下にする",
  explain:"背景に白文字を使うなら、背景の明度（L）は45%以下が目安です。明度70%の淡い色に白文字を載せると、色相に関係なく必ず読めません。逆に淡い背景を使いたいなら、文字は濃色（L 30%以下）にします。判断基準は色ではなく明度の数値です。"
},
{
  g:"明度とコントラスト", cat:"色覚多様性への配慮",
  title:"色相だけで区別しない",
  context:"「良好」と「要改善」を色で示します。赤緑の区別がつきにくい人にも伝わるのはどちらでしょう？",
  la:"明度差＋記号を併用", lb:"色相差のみ",
  good:`<div class="mock"><div style="display:flex;gap:8px;margin-bottom:8px"><span style="flex:1;background:#2f7a3a;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700;text-align:center">✓ 良好</span><span style="flex:1;background:#e8b8b8;color:#6b1f1f;border-radius:6px;padding:8px;font-size:11px;font-weight:700;text-align:center">！ 要改善</span></div><div class="cl">グリーン L 33% ／ ピンク L 82%<br>→ 明度差 49pt。モノクロでも濃淡で判別でき、記号でも区別できる</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:8px;margin-bottom:8px"><span style="flex:1;background:#3a8a3f;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700;text-align:center">良好</span><span style="flex:1;background:#b03a3a;color:#fff;border-radius:6px;padding:8px;font-size:11px;font-weight:700;text-align:center">要改善</span></div><div class="cl">グリーン L 39% ／ レッド L 46%<br>→ 明度差 7pt。色相以外の手がかりがなく、モノクロでは同じ色に見える</div></div>`,
  principle:"状態の区別は「明度差＋記号」で二重化する（色相差だけに頼らない）",
  explain:"日本人男性の約5%は赤と緑の色相差を判別しにくいと言われます。しかし明度差は誰にでも見えます。区別させたい2色は明度で30pt以上離し、さらに記号や文字を添えれば、色の見え方に関わらず伝わります。判定方法は「モノクロにしても区別できるか」です。"
},
{
  g:"明度とコントラスト", cat:"淡い背景の設計",
  title:"セクション背景の明度",
  context:"白ページの中でセクションを区切る背景色です。適切な明度はどちらでしょう？",
  la:"L 94%（白より一段濃い）", lb:"L 60%（中間の明度）",
  good:`<div class="mock" style="background:#eef1f4"><div style="font-size:12px;font-weight:700;color:#0f2a4a">セクションの見出し</div><div style="font-size:11px;color:#4a5460;margin-bottom:8px">本文がそのまま読める</div><div class="cl"><b>背景：ペールグレー</b>#eef1f4　H 210° / S 18% / <u>L 94%</u><br>白との差は6pt。区切りは伝わり、濃い文字はそのまま載せられる</div></div>`,
  bad:`<div class="mock" style="background:#7d94ac"><div style="font-size:12px;font-weight:700;color:#0f2a4a">セクションの見出し</div><div style="font-size:11px;color:#4a5460;margin-bottom:8px">濃い文字も白文字も中途半端</div><div class="cl" style="background:rgba(255,255,255,.85)"><b>背景：スレートブルー</b>#7d94ac　H 211° / S 22% / <u>L 58%</u><br>中間明度は、黒文字とも白文字とも十分なコントラストが取れない</div></div>`,
  principle:"背景は明度90%以上か25%以下——中間明度（40〜70%）は避ける",
  explain:"背景色は「とても明るい（L 90%以上）」か「とても暗い（L 25%以下）」の二択が安全です。中間の明度は、濃い文字とも白い文字とも十分なコントラストが取れない帯域で、載せられる文字がなくなります。淡い背景で区切るなら、白との差は5〜8ptで十分に伝わります。"
},
{
  g:"明度とコントラスト", cat:"情報の階層づくり",
  title:"明度で階層を作る",
  context:"見出し・本文・注釈の3階層を文字色で表現します。序列が伝わるのはどちらでしょう？",
  la:"明度を段階的に上げる", lb:"全て同じ明度",
  good:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#0f2a4a">見出し</div><div style="font-size:12px;color:#4a5460">本文のテキスト</div><div style="font-size:11px;color:#8d97a3;margin-bottom:8px">注釈のテキスト</div><div class="cl">見出し L 17% → 本文 L 34% → 注釈 L 60%<br>明度が上がるほど視覚的な重要度が下がる</div></div>`,
  bad:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#0f2a4a">見出し</div><div style="font-size:12px;color:#0f2a4a">本文のテキスト</div><div style="font-size:11px;color:#0f2a4a;margin-bottom:8px">注釈のテキスト</div><div class="cl">見出し L 17% ／ 本文 L 17% ／ 注釈 L 17%<br>全て同じ明度で、サイズ以外に序列の手がかりがない</div></div>`,
  principle:"重要度が下がるほど明度を上げる（見出し→本文→注釈）",
  explain:"文字色の明度は「重要度のボリューム」です。見出しは最も暗く（L 15〜20%）、本文はやや明るく（L 30〜40%）、注釈はさらに明るく（L 55〜65%）。同じ色相のまま明度だけを段階的に変えると、色数を増やさずに情報の階層が生まれます。"
},
{
  g:"明度とコントラスト", cat:"リンクテキストの色",
  title:"本文中のリンク色の明度",
  context:"本文（L 34%）の中に置くリンクの色です。リンクだと分かり、かつ読めるのはどちらでしょう？",
  la:"L 35%前後の濃い青", lb:"L 75%の薄い青",
  good:`<div class="mock"><div style="font-size:12px;color:#4a5460;margin-bottom:8px">詳しくは<span style="color:#2d5580;text-decoration:underline">利用ガイド</span>をご覧ください。</div><div class="cl"><b>リンク：ダークブルー</b>#2d5580　H 211° / S 48% / <u>L 34%</u><br>本文と同程度の明度で読め、色相差と下線で「リンク」と分かる</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;color:#4a5460;margin-bottom:8px">詳しくは<span style="color:#a9c6e6;text-decoration:underline">利用ガイド</span>をご覧ください。</div><div class="cl"><b>リンク：ペールブルー</b>#a9c6e6　H 211° / S 55% / <u>L 78%</u><br>白背景との明度差が小さく、リンク自体が読めない</div></div>`,
  principle:"リンク色は本文と同じ明度帯で、色相だけを変える",
  explain:"リンクを「青くする」のは正しいですが、青ければ何でもよいわけではありません。白背景で読める明度（L 45%以下）を保ったまま、本文と色相を変えるのがポイント。薄い水色のリンクは、色相は正しくても明度で失格になります。"
},
// ---------- 彩度とトーン（5問） ----------
{
  g:"彩度とトーン", cat:"大面積の色",
  title:"面積と彩度の反比例",
  context:"画面の広い範囲に敷く色を選びます。長時間見ても疲れないのはどちらでしょう？",
  la:"彩度15%の淡色", lb:"彩度90%のビビッド",
  good:`<div class="mock" style="background:#e8eef5"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:8px">広い背景に載せたテキスト</div><div class="cl"><b>ペールブルー</b>#e8eef5　H 212° / <u>S 39%</u> / L 94%<br>広い面積では、彩度と明度の両方を落とした色が安全</div></div>`,
  bad:`<div class="mock" style="background:#1e6fe0"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px">広い背景に載せたテキスト</div><div class="cl" style="background:rgba(255,255,255,.9)"><b>ビビッドブルー</b>#1e6fe0　H 215° / <u>S 76%</u> / L 50%<br>高彩度を大面積に使うと、色が主張しすぎて内容が読まれない</div></div>`,
  principle:"面積が広いほど彩度を下げる（大面積は彩度40%以下）",
  explain:"色の「強さ」は彩度×面積で決まります。ボタンのような小さな要素なら彩度60〜80%でも良いですが、背景のような大面積に使う色は彩度40%以下、できれば明度も90%以上まで上げます。「小さく鮮やか、大きく淡く」が配色の基本原理です。"
},
{
  g:"彩度とトーン", cat:"純色の扱い",
  title:"純色を避ける理由",
  context:"ボタンの赤を決めます。上品に見えるのはどちらでしょう？",
  la:"S 47%の調整した赤", lb:"S 100%の純赤",
  good:`<div class="mock"><span class="mb mb-block" style="background:#a83d3d;color:#fff;margin-bottom:8px">削除する</span><div class="cl"><b>ブリックレッド</b>#a83d3d　H 0° / <u>S 47%</u> / L 45%<br>彩度と明度を落とした「調整済みの赤」</div></div>`,
  bad:`<div class="mock"><span class="mb mb-block" style="background:#ff0000;color:#fff;margin-bottom:8px">削除する</span><div class="cl"><b>ピュアレッド</b>#ff0000　H 0° / <u>S 100%</u> / L 50%<br>RGB(255,0,0)：ディスプレイの限界まで発光する原色</div></div>`,
  principle:"彩度100%の純色は使わない（S 40〜75%に調整する）",
  explain:"#FF0000や#0000FFのような彩度100%の色は、ディスプレイの限界まで発光するため目に刺さり、素人っぽさや安っぽさが出ます。プロのUIで使われる色は例外なく彩度が調整されています。HSLで見て彩度が90%を超えていたら、まず疑ってください。"
},
{
  g:"彩度とトーン", cat:"タグの配色",
  title:"トーン（明度×彩度）を揃える",
  context:"4種類のタグに色を付けます。色相が違ってもまとまって見えるのはどちらでしょう？",
  la:"S・Lを揃えて色相だけ変える", lb:"S・Lがバラバラ",
  good:`<div class="mock"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><span class="tag" style="background:#dce8f2;color:#3d6285">財務</span><span class="tag" style="background:#dff0e4;color:#3f7050">税務</span><span class="tag" style="background:#f6e8d9;color:#8a6335">労務</span><span class="tag" style="background:#efe0ec;color:#7d4a72">法務</span></div><div class="cl">背景はすべて S 30〜50% / L 90〜91%<br>色相：H 208° ／ H 138° ／ H 31° ／ H 312°<br>→ トーンが揃い、色相だけが違う</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><span class="tag" style="background:#ff0000;color:#fff">財務</span><span class="tag" style="background:#ccffcc;color:#3f7050">税務</span><span class="tag" style="background:#8b4513;color:#fff">労務</span><span class="tag" style="background:#ff69b4;color:#fff">法務</span></div><div class="cl">S 100%/L 50% ／ S 100%/L 90% ／ S 76%/L 31% ／ S 100%/L 71%<br>→ 彩度も明度も揃っておらず、寄せ集めに見える</div></div>`,
  principle:"多色を使うときは、SとLを固定して色相（H）だけ動かす",
  explain:"HSLで考えると「トーンを揃える」は簡単です。彩度（S）と明度（L）を固定値にして、色相（H）だけを変えれば、何色使っても同じ世界の色になります。逆にS・Lがバラバラだと、3色でもチグハグに見えます。カラーパレットはHSLで設計すると失敗しません。"
},
{
  g:"彩度とトーン", cat:"グレーの作り方",
  title:"無彩色に色味を混ぜる",
  context:"UIで使うグレーの決め方です。画面になじむのはどちらでしょう？",
  la:"ブランド色相のグレー", lb:"S 0%の純グレー",
  good:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#2b323d"></span><span class="chip lg" style="background:#56626f"></span><span class="chip lg" style="background:#8d97a3"></span><span class="chip lg" style="background:#dde3e8"></span></div><div class="cl">#2b323d / #56626f / #8d97a3 / #dde3e8<br>すべて H 210〜217° / <u>S 9〜17%</u>：ネイビーの色相をわずかに含むグレー</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#333333"></span><span class="chip lg" style="background:#666666"></span><span class="chip lg" style="background:#999999"></span><span class="chip lg" style="background:#dddddd"></span></div><div class="cl">#333333 / #666666 / #999999 / #dddddd<br>すべて <u>S 0%</u>：色味を持たない純粋なグレー</div></div>`,
  principle:"グレーにはブランドの色相を5〜15%混ぜる",
  explain:"S 0%の純グレーは、ブランド色と並べたときに「浮いた」印象になります。グレーの色相をブランド色（例：ネイビーのH 210°）に合わせ、彩度を5〜15%だけ含ませると、画面全体が1つの色調でまとまります。#333333の代わりに#2b323d、というわずかな差が上品さの正体です。"
},
{
  g:"彩度とトーン", cat:"高級感の演出",
  title:"「格」を出す彩度",
  context:"信頼感・高級感を出したいサービスの配色です。狙い通りになるのはどちらでしょう？",
  la:"低彩度・低明度で締める", lb:"高彩度で華やかに",
  good:`<div class="mock" style="background:#0f2a4a"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:2px">プレミアムプラン</div><div style="font-size:10px;color:rgba(255,255,255,.7);margin-bottom:8px">専任担当と月次レビュー</div><div class="cl" style="background:rgba(255,255,255,.92)"><b>ネイビー</b>#0f2a4a　H 213° / S 66% / <u>L 17%</u><br>低明度で締めた色は「重さ＝信頼感」を生む</div></div>`,
  bad:`<div class="mock" style="background:linear-gradient(135deg,#ff2d95,#ffb400)"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:2px">プレミアムプラン</div><div style="font-size:10px;color:#fff;margin-bottom:8px">専任担当と月次レビュー</div><div class="cl" style="background:rgba(255,255,255,.92)"><b>ホットピンク→アンバー</b>#ff2d95→#ffb400<br>S 100% / L 59% → S 100% / L 50%：高彩度は「元気・安価」の記号</div></div>`,
  principle:"高級感・信頼感は低彩度×低明度、親しみ・安さは高彩度×高明度",
  explain:"彩度と明度は、それだけで印象を決めます。低彩度×低明度（S 40〜70% / L 15〜30%）は重厚・信頼・高級。高彩度×高明度は元気・カジュアル・お買い得。狙う印象から逆算して、まずSとLの範囲を決めてから色相を選ぶと、配色は迷いません。"
},
// ---------- 配色の実践（4問） ----------
{
  g:"配色の実践", cat:"パレットの構成比",
  title:"70:25:5の法則",
  context:"画面全体の色の使用比率です。バランスが良いのはどちらでしょう？",
  la:"ベース70／サブ25／アクセント5", lb:"3色を均等に33%ずつ",
  good:`<div class="mock"><div style="display:flex;height:28px;border-radius:6px;overflow:hidden;margin-bottom:8px"><span style="flex:70;background:#f8f9fb;border:1px solid #dde3e8"></span><span style="flex:25;background:#0f2a4a"></span><span style="flex:5;background:#c77b3a"></span></div><div class="cl">ベース（オフホワイト L 98%）70% ／ サブ（ネイビー L 17%）25% ／ アクセント（オレンジ H 28°）5%</div></div>`,
  bad:`<div class="mock"><div style="display:flex;height:28px;border-radius:6px;overflow:hidden;margin-bottom:8px"><span style="flex:1;background:#f8f9fb;border:1px solid #dde3e8"></span><span style="flex:1;background:#0f2a4a"></span><span style="flex:1;background:#c77b3a"></span></div><div class="cl">オフホワイト 33% ／ ネイビー 33% ／ オレンジ 33%<br>→ アクセントが大面積を占め、主役が分からない</div></div>`,
  principle:"ベース70％・サブ25％・アクセント5％の面積比を守る",
  explain:"どんなに良い3色を選んでも、面積比が均等だと騒がしくなります。ベース（背景・余白）70%、サブ（ブランド色）25%、アクセント（行動を促す色）5%が黄金比。アクセントは「5%しかないから効く」のであって、増やすほど効果は薄れます。"
},
{
  g:"配色の実践", cat:"パレットの明度設計",
  title:"明度の段階を先に決める",
  context:"UIのカラーパレットの作り方です。破綻しにくいのはどちらでしょう？",
  la:"明度を等間隔に刻む", lb:"感覚で明るさを選ぶ",
  good:`<div class="mock"><div style="display:flex;gap:4px;margin-bottom:8px"><span class="chip lg" style="background:#091a30"></span><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#2d5580"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#8fa9c5"></span><span class="chip lg" style="background:#e8eef5"></span></div><div class="cl">L 11% → 17% → 34% → 44% → 67% → 94%<br>同じ色相（H 210〜213°）で明度を段階的に刻んだ6色</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:4px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#112c4c"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#3f72a9"></span><span class="chip lg" style="background:#e8eef5"></span><span class="chip lg" style="background:#eaf0f6"></span></div><div class="cl">L 17% / 18% / 44% / 45% / 94% / 94%<br>→ ほぼ同じ明度が2つずつ。使い分けができない</div></div>`,
  principle:"パレットは「1色相×明度6段階」から作る",
  explain:"配色の失敗の多くは「似た明るさの色が何個もある」ことから起きます。まず1つの色相で明度を10〜15%刻みで6段階ほど作れば、見出し・ボタン・枠線・背景のすべてがその中から選べます。HSLのL値を等間隔に並べるだけで、破綻しないパレットができます。"
},
{
  g:"配色の実践", cat:"アクセントの置き場所",
  title:"アクセントカラーは1画面1〜2箇所",
  context:"アクセント色（オレンジ H 28°）の使い方です。効果が最大になるのはどちらでしょう？",
  la:"主ボタン1箇所だけ", lb:"見出し・枠・ボタン全部",
  good:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:2px">退職金原資の試算</div><div style="font-size:11px;color:#4a5460;margin-bottom:8px">決算書2期分から算出します</div><span class="mb mb-block" style="background:#c77b3a;color:#fff;margin-bottom:8px">試算する</span><div class="cl">オレンジ（H 28° / S 55%）はボタン1箇所のみ→視線が集まる</div></div>`,
  bad:`<div class="mock" style="border:2px solid #c77b3a"><div style="font-size:12px;font-weight:700;color:#c77b3a;margin-bottom:2px">退職金原資の試算</div><div style="font-size:11px;color:#c77b3a;margin-bottom:8px">決算書2期分から算出します</div><span class="mb mb-block" style="background:#c77b3a;color:#fff;margin-bottom:8px">試算する</span><div class="cl">同じオレンジが枠・見出し・本文・ボタンに→どこも目立たない</div></div>`,
  principle:"アクセントカラーは1画面あたり1〜2箇所に絞る",
  explain:"アクセントの価値は希少性にあります。1画面で1〜2箇所（主ボタン、重要な数値）だけに使えば「ここを見て」が伝わりますが、見出しや枠にも使うとアクセントは背景の一部になります。色相差が正しくても、使う場所を増やした瞬間に効果は消えます。"
},
{
  g:"配色の実践", cat:"配色の点検方法",
  title:"モノクロ検証",
  context:"作った配色が問題ないか確かめる方法です。信頼できる検証はどちらでしょう？",
  la:"彩度0にして見る", lb:"自分の目で見て問題なければOK",
  good:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:6px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#5c8272"></span><span class="chip lg" style="background:#c9a227"></span><span class="chip lg" style="background:#eef1f4"></span></div><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#2c2c2c"></span><span class="chip lg" style="background:#787878"></span><span class="chip lg" style="background:#a3a3a3"></span><span class="chip lg" style="background:#f0f0f0"></span></div><div class="cl">上：元の配色 ／ 下：彩度0にした状態<br>L 17% / 42% / 47% / 94%（下段でも区別できる）</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:6px"><span class="chip lg" style="background:#b03a3a"></span><span class="chip lg" style="background:#3a8a3f"></span><span class="chip lg" style="background:#3a6fb0"></span><span class="chip lg" style="background:#b07a3a"></span></div><div style="display:flex;gap:6px;margin-bottom:8px"><span class="chip lg" style="background:#5e5e5e"></span><span class="chip lg" style="background:#666666"></span><span class="chip lg" style="background:#6a6a6a"></span><span class="chip lg" style="background:#7a7a7a"></span></div><div class="cl">上：元の配色 ／ 下：彩度0にした状態<br>L 46% / 39% / 46% / 46%（下段でほぼ同じ灰色になる）</div></div>`,
  principle:"配色は彩度0（モノクロ）にして明度差を確認する",
  explain:"配色ができたら、必ず彩度を0にして（グレースケールで）確認します。モノクロで区別できる配色は、色覚の違いにも、モノクロ印刷にも、日光下のスマホにも耐えます。区別できなければ明度差が足りない証拠です。「見た目で綺麗」ではなく「数値で検証」が配色のプロの習慣です。"
},
]};
