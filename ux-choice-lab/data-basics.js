// UX CHOICE LAB — コース6: カラーコーディネートの基本学習（30問）
// 色相・明度・彩度の「定義」から始め、色相環・トーン・配色技法・心理・実践へ段階的に積み上げる基礎コース。
// すべての色にHEX＋HSLを表記し、色の見え方に関わらず数値で学べる。
window.COURSE_BASICS = {
  id: "basics",
  title: "カラーコーディネートの基本学習",
  en: "COLOR BASICS",
  desc: "色相・明度・彩度とは何か、から始める30問。色の三属性、色相環、トーン、代表的な配色技法、色の心理効果までを、テスト形式で基礎から順に積み上げます。応用の「色彩ラベル編」の前に。",
  minutes: "約15",
  groups: [
    {name:"色の三属性", icon:"3", note:"色相・明度・彩度"},
    {name:"色相環のしくみ", icon:"○", note:"色の位置関係"},
    {name:"トーンと色の性格", icon:"◑", note:"明度×彩度の組み合わせ"},
    {name:"配色の技法", icon:"◐", note:"型を知る"},
    {name:"色の心理と実践", icon:"◉", note:"意味と使い方"}
  ],
  questions: [
// ---------- 色の三属性（7問） ----------
{
  g:"色の三属性", cat:"色を言葉にする",
  title:"色相（Hue）とは",
  context:"「色相」が表しているものはどちらでしょう？",
  la:"赤・青・黄などの「色みの違い」", lb:"色の「明るさ」",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#e08a2e"></span><span class="chip lg" style="background:#d9c227"></span><span class="chip lg" style="background:#3f9a4d"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#7b3fa8"></span></div><div class="cl">赤 H0° → 橙 H30° → 黄 H55° → 緑 H130° → 青 H210° → 紫 H275°<br>明るさ・鮮やかさはほぼ同じで、<b style="display:inline">色みだけ</b>が違う</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#1a1a1a"></span><span class="chip lg" style="background:#4d4d4d"></span><span class="chip lg" style="background:#808080"></span><span class="chip lg" style="background:#b3b3b3"></span><span class="chip lg" style="background:#e6e6e6"></span></div><div class="cl">L 10% → 30% → 50% → 70% → 90%<br>これは「明るさ」の違い。色みは変わっていない</div></div>`,
  principle:"色相＝赤・青・黄といった「色みの種類」。角度（0〜360°）で表す",
  explain:"色相（Hue）は、赤・橙・黄・緑・青・紫のような「何色か」を表す属性です。HSLでは0〜360°の角度で表し、0°が赤、120°が緑、240°が青。明るさや鮮やかさとは独立した軸で、色を語るときの最初の座標です。"
},
{
  g:"色の三属性", cat:"色を言葉にする",
  title:"明度（Lightness）とは",
  context:"「明度」が表しているものはどちらでしょう？",
  la:"色の「明るさ・暗さ」", lb:"色の「鮮やかさ」",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0a1a30"></span><span class="chip lg" style="background:#1c3f68"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#7ea3cc"></span><span class="chip lg" style="background:#c9dbee"></span></div><div class="cl">同じ青（H 210°）で、L 11% → 26% → 44% → 65% → 86%<br>色みは同じまま、<b style="display:inline">明るさだけ</b>が変わる</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#808080"></span><span class="chip lg" style="background:#6b7a90"></span><span class="chip lg" style="background:#5673a0"></span><span class="chip lg" style="background:#416cb0"></span><span class="chip lg" style="background:#2c65c0"></span></div><div class="cl">同じ青・同じ明るさで、S 0% → 20% → 40% → 60% → 80%<br>これは「鮮やかさ」の違い</div></div>`,
  principle:"明度＝色の明るさ。0%が黒、100%が白",
  explain:"明度（Lightness）は「どれだけ明るいか」で、0%が黒、100%が白、50%がその色相の最も鮮やかな中間点です。同じ青でも明度を上げれば水色に、下げれば紺になります。可読性やコントラストは、ほぼこの明度差で決まります。"
},
{
  g:"色の三属性", cat:"色を言葉にする",
  title:"彩度（Saturation）とは",
  context:"「彩度」が表しているものはどちらでしょう？",
  la:"色の「鮮やかさ・くすみ」", lb:"色の「明るさ」",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#8a8a8a"></span><span class="chip lg" style="background:#9a7f7f"></span><span class="chip lg" style="background:#b06e6e"></span><span class="chip lg" style="background:#c65858"></span><span class="chip lg" style="background:#e03c3c"></span></div><div class="cl">同じ赤（H 0°）・同じ明るさ（L 55%）で、S 0% → 20% → 40% → 60% → 80%<br>灰色から<b style="display:inline">鮮やかな赤</b>へ</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3a0f0f"></span><span class="chip lg" style="background:#7a2020"></span><span class="chip lg" style="background:#c03a3a"></span><span class="chip lg" style="background:#e08a8a"></span><span class="chip lg" style="background:#f5d5d5"></span></div><div class="cl">同じ赤で L 14% → 30% → 49% → 71% → 90%<br>これは「明るさ」の違い</div></div>`,
  principle:"彩度＝色の鮮やかさ。0%が灰色、100%が最も鮮やか",
  explain:"彩度（Saturation）は「どれだけ鮮やかか」で、0%は無彩色（灰色）、100%は最も純度の高い色です。彩度を下げると「くすんだ・落ち着いた」印象に、上げると「派手・元気」になります。上品さは多くの場合、彩度を少し下げることで生まれます。"
},
{
  g:"色の三属性", cat:"HSLの読み方",
  title:"HSL値を読む",
  context:"「#3b6ea5 ＝ H 211° / S 48% / L 44%」という色は、どんな色でしょう？",
  la:"やや落ち着いた中間の青", lb:"鮮やかで明るい黄色",
  good:`<div class="mock"><div class="msw"><span class="chip lg" style="background:#3b6ea5"></span><div class="cl"><b>ブルー</b>#3b6ea5<br>H 211°（青）／ S 48%（中程度に鮮やか）／ L 44%（中間の明るさ）</div></div></div>`,
  bad:`<div class="mock"><div class="msw"><span class="chip lg" style="background:#f0d020"></span><div class="cl"><b>イエロー</b>#f0d020<br>H 51°（黄）／ S 87%（鮮やか）／ L 53%（明るめ）</div></div><div class="ms">これは別の色（H 51°の黄）</div></div>`,
  principle:"HSLは「何色か（H）／どれだけ鮮やかか（S）／どれだけ明るいか（L）」の順",
  explain:"HSLを読めると、色見本がなくても色を想像できます。H 211°は青の領域、S 48%は「ほどよく鮮やか」、L 44%は「中間よりやや暗め」。この3つの数字で色を語る癖をつけると、配色の議論が「なんとなく」から「数値」に変わります。"
},
{
  g:"色の三属性", cat:"色の分類",
  title:"有彩色と無彩色",
  context:"「無彩色」に分類されるのはどちらのグループでしょう？",
  la:"白・グレー・黒", lb:"薄いピンク・水色・ベージュ",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#ffffff"></span><span class="chip lg" style="background:#bfbfbf"></span><span class="chip lg" style="background:#808080"></span><span class="chip lg" style="background:#404040"></span><span class="chip lg" style="background:#000000"></span></div><div class="cl">すべて S 0%——色相を持たない色（白・灰・黒）</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#f4c7d0"></span><span class="chip lg" style="background:#c7e0f4"></span><span class="chip lg" style="background:#efe0c7"></span></div><div class="cl">S 67% / S 67% / S 56%——薄くても彩度があるので「有彩色」</div></div>`,
  principle:"無彩色＝彩度0%の白・灰・黒。薄い色でも色みがあれば有彩色",
  explain:"白・灰・黒は彩度が0%で色相を持たない「無彩色」。ピンクや水色は薄くても色みを持つ「有彩色」です。無彩色はどんな有彩色とも喧嘩しないため、配色の土台（背景・文字）に使うのが基本。有彩色を「主役」、無彩色を「舞台」と考えます。"
},
{
  g:"色の三属性", cat:"色の温度感",
  title:"暖色と寒色",
  context:"「暖色」に分類されるのはどちらのグループでしょう？",
  la:"赤・橙・黄", lb:"青・青緑・青紫",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#e08a2e"></span><span class="chip lg" style="background:#d9c227"></span></div><div class="cl">H 0°〜60°付近——炎や太陽を連想させる「暖色」<br>前に出て見え、活動的・温かい印象</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#2e9a8f"></span><span class="chip lg" style="background:#5b5bb8"></span></div><div class="cl">H 180°〜260°付近——水や空を連想させる「寒色」<br>後ろに下がって見え、冷静・信頼の印象</div></div>`,
  principle:"赤〜黄が暖色、青系が寒色。暖色は前に出て、寒色は後ろに下がる",
  explain:"色相環の赤〜黄（H 0〜60°）は温かさ・活力を、青〜青紫（H 180〜260°）は冷静さ・信頼を感じさせます。暖色は膨張して前に出て見え（進出色）、寒色は引き締まって後ろに下がります（後退色）。目立たせたい要素に暖色を使う理由はここにあります。"
},
{
  g:"色の三属性", cat:"色の温度感",
  title:"中性色",
  context:"暖色でも寒色でもない「中性色」はどちらでしょう？",
  la:"緑・紫", lb:"橙・青",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3f9a4d"></span><span class="chip lg" style="background:#7b3fa8"></span></div><div class="cl">緑 H 130° ／ 紫 H 275°<br>暖色と寒色の中間に位置し、組み合わせ次第でどちらにも寄る</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#e08a2e"></span><span class="chip lg" style="background:#3b6ea5"></span></div><div class="cl">橙 H 30°（暖色）／ 青 H 210°（寒色）<br>温度感がはっきりした色</div></div>`,
  principle:"緑と紫は「中性色」——隣の色に温度感が引っ張られる",
  explain:"緑（黄と青の間）と紫（赤と青の間）は、暖色と寒色の境目にある中性色です。黄寄りの緑は暖かく、青寄りの緑は冷たく見えるなど、隣り合う色で印象が変わります。中性色は暖色にも寒色にも合わせやすい「つなぎ役」として重宝します。"
},
// ---------- 色相環のしくみ（6問） ----------
{
  g:"色相環のしくみ", cat:"色相環を読む",
  title:"隣り合う色（類似色）",
  context:"色相環で「隣り合う色（類似色）」の組み合わせはどちらでしょう？",
  la:"青と青緑", lb:"青と橙",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">青 H 210° と 青緑 H 175°：色相差 35°<br>近い色相＝穏やかで調和しやすい</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#e08a2e"></span></div><div class="cl">青 H 210° と 橙 H 30°：色相差 180°<br>これは正反対の「補色」</div></div>`,
  principle:"類似色＝色相環で隣り合う色（色相差30〜60°）。穏やかにまとまる",
  explain:"色相環で隣り合う色同士を類似色と呼びます。共通の色みを含むため、並べても喧嘩せず、自然にまとまります。「統一感のある配色」の多くはこの類似色の組み合わせです。反面、変化に乏しいので、アクセントには別の色相が必要になります。"
},
{
  g:"色相環のしくみ", cat:"色相環を読む",
  title:"向かい合う色（補色）",
  context:"色相環で「正反対（補色）」の関係にあるのはどちらの組み合わせでしょう？",
  la:"赤と青緑", lb:"赤と橙",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">赤 H 0° と 青緑 H 175°：色相差 約180°<br>互いを最も引き立て合う「補色」の関係</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#e08a2e"></span></div><div class="cl">赤 H 0° と 橙 H 30°：色相差 30°<br>これは隣り合う「類似色」</div></div>`,
  principle:"補色＝色相環で180°反対の色。最も対比が強く、引き立て合う",
  explain:"色相環で正反対（色相差180°）にある2色を補色と呼びます。赤と青緑、青と橙、黄と紫が代表例。互いを最も鮮やかに見せ合うので、アクセントに使うと強く目を引きます。ただし純色同士でぶつけると刺激が強すぎるため、片方のトーンを落として使うのが実践のコツです。"
},
{
  g:"色相環のしくみ", cat:"色相環を読む",
  title:"混色の関係（隣の色ができる仕組み）",
  context:"色相環で「赤」と「黄」の間に位置する色はどちらでしょう？",
  la:"橙", lb:"緑",
  good:`<div class="mock"><div style="display:flex;gap:5px;align-items:center;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span style="color:#8d97a3">→</span><span class="chip lg" style="background:#e08a2e"></span><span style="color:#8d97a3">→</span><span class="chip lg" style="background:#d9c227"></span></div><div class="cl">赤 H 0° → 橙 H 30° → 黄 H 55°<br>色相環は隣同士が連続的に混ざり合っている</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;align-items:center;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span style="color:#8d97a3">→</span><span class="chip lg" style="background:#3f9a4d"></span><span style="color:#8d97a3">→</span><span class="chip lg" style="background:#d9c227"></span></div><div class="cl">緑 H 130° は黄と青の間。赤と黄の間ではない</div></div>`,
  principle:"色相環は「隣の色を混ぜると間の色になる」連続した輪",
  explain:"色相環は、隣り合う色を混ぜると間の色が生まれる、という関係で並んでいます。赤と黄の間は橙、黄と青の間は緑、青と赤の間は紫。この構造を知っていると、「青に少し緑を足す＝色相を反時計回りに動かす」のように、色の調整を角度で考えられます。"
},
{
  g:"色相環のしくみ", cat:"色相環を読む",
  title:"三原色と二次色",
  context:"「赤・黄・青」の混色で作られる二次色の組み合わせはどちらでしょう？",
  la:"橙・緑・紫", lb:"ピンク・水色・ベージュ",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#e08a2e"></span><span class="chip lg" style="background:#3f9a4d"></span><span class="chip lg" style="background:#7b3fa8"></span></div><div class="cl">橙＝赤＋黄 ／ 緑＝黄＋青 ／ 紫＝青＋赤<br>三原色の中間にできる「二次色」</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#f4c7d0"></span><span class="chip lg" style="background:#c7e0f4"></span><span class="chip lg" style="background:#efe0c7"></span></div><div class="cl">これらは赤・青・黄の「明度を上げた」色（薄くしただけ）</div></div>`,
  principle:"色相環は三原色（赤・黄・青）と、その間の二次色（橙・緑・紫）で骨格ができる",
  explain:"伝統的な色相環は、赤・黄・青の三原色を等間隔に置き、その間に混色の橙・緑・紫（二次色）を配置して12色に展開したものです。この6色の位置関係を頭に入れておくだけで、「向かい＝補色」「隣＝類似色」がすぐ分かるようになります。"
},
{
  g:"色相環のしくみ", cat:"色相の距離感",
  title:"色相差と印象",
  context:"色相差が「大きい」組み合わせが与える印象はどちらでしょう？",
  la:"対比が強く、活発・目立つ", lb:"穏やかで、統一感がある",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d9c227"></span><span class="chip lg" style="background:#7b3fa8"></span></div><div class="cl">黄 H 55° × 紫 H 275°：色相差 約140°<br>→ コントラストが強く、元気で目立つ</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#5b5bb8"></span></div><div class="cl">青 H 210° × 青紫 H 240°：色相差 30°<br>→ これは穏やかで統一感がある側</div></div>`,
  principle:"色相差が大きいほど活発・対比、小さいほど穏やか・統一",
  explain:"色相環上の距離は、そのまま印象の距離です。差が小さい（30°以内）と穏やかで上品、差が大きい（120°以上）と活発でエネルギッシュ。狙う印象に合わせて色相差を選ぶ——これが色相環を使う最大の目的です。"
},
{
  g:"色相環のしくみ", cat:"色相の距離感",
  title:"色相差と統一感",
  context:"「落ち着いた統一感」を出したいとき、色相の選び方として正しいのはどちらでしょう？",
  la:"色相差を60°以内に収める", lb:"色相環から均等に3色取る",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">H 213° / H 211° / H 175°：幅 約40°<br>同じ「青系」の家族としてまとまる</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#d9c227"></span><span class="chip lg" style="background:#3b6ea5"></span></div><div class="cl">H 0° / H 55° / H 210°：120°ずつ離れた3色（トライアド）<br>元気で賑やかだが、統一感とは逆方向</div></div>`,
  principle:"統一感＝色相を近づける。賑やかさ＝色相を離す",
  explain:"配色の第一歩は「統一感が欲しいのか、賑やかさが欲しいのか」を決めること。統一感なら色相を60°以内に、賑やかさなら120°以上離す。この判断を先にしておくと、後の色選びで迷いません。多くのビジネス用途では、統一感（近い色相）が基本になります。"
},
// ---------- トーンと色の性格（6問） ----------
{
  g:"トーンと色の性格", cat:"トーンの考え方",
  title:"トーンとは何か",
  context:"「トーン」が指しているものはどちらでしょう？",
  la:"明度と彩度の組み合わせ", lb:"色相の種類",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#f4c7d0"></span><span class="chip lg" style="background:#f6e0c0"></span><span class="chip lg" style="background:#c7e0f4"></span><span class="chip lg" style="background:#d0efd0"></span></div><div class="cl">色相はバラバラ（H 348° / 33° / 210° / 120°）だが<br>すべて S 55〜70% / L 85〜88%——同じ「ペールトーン」</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#3f9a4d"></span><span class="chip lg" style="background:#3b6ea5"></span></div><div class="cl">これは色相の違い（赤・緑・青）。トーンとは別の軸</div></div>`,
  principle:"トーン＝明度×彩度で決まる「色の調子」。色相とは独立している",
  explain:"トーンは「明るい・暗い」と「鮮やか・くすんだ」の組み合わせで決まる、色の性格です。色相が違っても、トーンが同じ色同士は「同じ家族」に見えます。「パステル調」「ダークトーン」といった言葉は、色相ではなくトーンを指しています。"
},
{
  g:"トーンと色の性格", cat:"トーンの種類",
  title:"ビビッド（鮮やか）とペール（淡い）",
  context:"「ペールトーン（薄く淡い）」はどちらでしょう？",
  la:"高明度・中彩度", lb:"中明度・高彩度",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#f4c7d0"></span><span class="chip lg" style="background:#c7e0f4"></span><span class="chip lg" style="background:#d0efd0"></span></div><div class="cl">L 85〜88% / S 55〜70%<br>優しい・軽い・柔らかい印象の「ペールトーン」</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#e03c3c"></span><span class="chip lg" style="background:#2c65c0"></span><span class="chip lg" style="background:#2fb050"></span></div><div class="cl">L 50〜55% / S 60〜80%<br>元気・派手・強い印象の「ビビッドトーン」</div></div>`,
  principle:"ビビッド＝中明度×高彩度（派手）、ペール＝高明度×中彩度（優しい）",
  explain:"代表的なトーンを2つ覚えるなら、ビビッド（鮮やか）とペール（淡い）です。ビビッドは目立ちますが疲れやすく、面積を絞って使います。ペールは優しく背景にも使えますが、主張は弱くなります。同じ色相でも、トーンで印象は正反対になります。"
},
{
  g:"トーンと色の性格", cat:"トーンの種類",
  title:"ダーク（暗い）とダル（くすんだ）",
  context:"「落ち着き・信頼・高級感」を出したいとき、選ぶべきトーンはどちらでしょう？",
  la:"ダーク／ディープトーン", lb:"ブライトトーン",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#5c3a1e"></span><span class="chip lg" style="background:#1e4a2e"></span></div><div class="cl">L 17〜22% / S 40〜66%<br>重厚・落ち着き・格式——「ダーク／ディープトーン」</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#ff7f7f"></span><span class="chip lg" style="background:#7fbfff"></span><span class="chip lg" style="background:#7fdf9f"></span></div><div class="cl">L 70〜75% / S 100%<br>明るく健康的だがカジュアル——「ブライトトーン」</div></div>`,
  principle:"低明度のトーン（ダーク・ディープ）は重厚・信頼、高明度は軽快・親しみ",
  explain:"明度が低いほど色は「重く」なり、信頼感・高級感・落ち着きを演出します。金融・法律・コンサルなどのブランドカラーにネイビーやダークグリーンが多いのはこのため。逆に明るいトーンは軽やかで親しみやすく、消費者向けサービスに向きます。"
},
{
  g:"トーンと色の性格", cat:"トーンの種類",
  title:"グレイッシュ（灰みの）トーン",
  context:"「くすんだ・大人っぽい・上品」な印象を出す色の作り方はどちらでしょう？",
  la:"彩度を下げる（灰色を混ぜる）", lb:"彩度を上げる",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#8a7d8f"></span><span class="chip lg" style="background:#7d8f8a"></span><span class="chip lg" style="background:#8f8a7d"></span></div><div class="cl">S 7〜10% / L 52〜55%<br>灰色に近づけた「グレイッシュトーン」——上品で大人びた印象</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#b03ad0"></span><span class="chip lg" style="background:#3ad0b0"></span><span class="chip lg" style="background:#d0b03a"></span></div><div class="cl">S 60〜62% / L 52%<br>彩度が高いと「元気・派手」の方向へ</div></div>`,
  principle:"彩度を下げる（灰みを足す）と、色は落ち着き上品になる",
  explain:"「上品にしたい」ときの最も確実な操作は、彩度を下げることです。灰色を混ぜたようなグレイッシュトーンは、どんな色相でも大人っぽく落ち着いた印象になります。逆に「派手すぎる」と感じたら、色相を変える前に彩度を10〜20%下げてみてください。"
},
{
  g:"トーンと色の性格", cat:"トーンの操作",
  title:"同じ色相でトーンを変える",
  context:"ネイビー（H 213°）から派生色を作ります。「同じ家族の色」として使えるのはどちらでしょう？",
  la:"色相を固定して明度・彩度を変える", lb:"色相を変える",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#2d5580"></span><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#8fa9c5"></span><span class="chip lg" style="background:#e8eef5"></span></div><div class="cl">すべて H 210〜213°で、L 17% → 34% → 44% → 67% → 94%<br>1つの色相の「濃淡ファミリー」</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#4a0f2a"></span><span class="chip lg" style="background:#2a4a0f"></span><span class="chip lg" style="background:#4a2a0f"></span></div><div class="cl">同じ明度・彩度で色相だけ変えた4色（H 213° / 335° / 90° / 25°）<br>家族ではなく「別の色」</div></div>`,
  principle:"派生色は「色相を固定して明度・彩度を動かす」——これが濃淡の作り方",
  explain:"ブランドカラーから見出し・ボタン・枠線・背景の色を作るとき、色相は動かさず、明度と彩度だけを変えます。こうしてできた5〜6色は必ず調和し、画面が「1つの色でできている」ように見えます。色相を動かすのは、アクセントを足すときだけです。"
},
{
  g:"トーンと色の性格", cat:"トーンの操作",
  title:"トーンを揃える効果",
  context:"色相の異なる4色を並べます。まとまって見えるのはどちらでしょう？",
  la:"トーン（S・L）を揃える", lb:"トーンがバラバラ",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#c9a9b0"></span><span class="chip lg" style="background:#c9bfa9"></span><span class="chip lg" style="background:#a9bcc9"></span><span class="chip lg" style="background:#adc9a9"></span></div><div class="cl">H 348° / 41° / 204° / 113°——色相はバラバラ<br>だが S 23% / L 73%で揃っている→同じトーンで調和</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#f4c7d0"></span><span class="chip lg" style="background:#5c3a1e"></span><span class="chip lg" style="background:#2c65c0"></span><span class="chip lg" style="background:#adc9a9"></span></div><div class="cl">ペール／ダーク／ビビッド／グレイッシュが混在<br>色相以前にトーンが揃っておらず、寄せ集めに見える</div></div>`,
  principle:"多色配色は「トーンを揃える」だけで8割まとまる",
  explain:"色数を増やすときの鉄則は「トーンを揃える」です。明度と彩度を近い値に固定して色相だけを変えれば、何色でも同じ世界の色になります。「たくさんの色を使ってもうるさくならない配色」の正体は、色相の選び方ではなくトーンの統一です。"
},
// ---------- 配色の技法（6問） ----------
{
  g:"配色の技法", cat:"配色の型",
  title:"同一色相配色（モノクロマティック）",
  context:"1つの色相の濃淡だけで構成する配色の特徴として正しいのはどちらでしょう？",
  la:"最もまとまりやすく失敗しにくい", lb:"最も対比が強く目立つ",
  good:`<div class="mock"><div style="background:#0f2a4a;color:#fff;border-radius:6px 6px 0 0;padding:8px 10px;font-size:11px;font-weight:700">見出し L 17%</div><div style="background:#e8eef5;padding:8px 10px;font-size:11px;color:#2d5580">本文エリア L 94% ／ 文字 L 34%</div><div style="background:#fff;border:1px solid #dde3e8;border-radius:0 0 6px 6px;padding:8px 10px;text-align:right"><span class="mb mb-p" style="padding:5px 12px;font-size:10px">ボタン L 44%</span></div><div class="cl" style="margin-top:8px">全て H 210〜213°。同一色相の濃淡だけで完結</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">「最も対比が強い」のは補色配色の特徴。同一色相配色は対比ではなく統一が持ち味</div></div>`,
  principle:"同一色相配色＝1色の濃淡だけ。統一感は最強、迷ったらこれ",
  explain:"1つの色相の明度・彩度違いだけで構成する配色は、絶対に喧嘩せず、最も上品にまとまります。業務ツールやコーポレートサイトの多くはこの型です。単調に見えるという弱点は、無彩色（グレー）を混ぜたり、1色だけアクセントを足したりして補います。"
},
{
  g:"配色の技法", cat:"配色の型",
  title:"類似色相配色（アナロガス）",
  context:"「青・青緑・緑」のように隣り合う色相で構成する配色の印象はどちらでしょう？",
  la:"自然で穏やか、季節感が出る", lb:"人工的で強い緊張感",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#2e9a8f"></span><span class="chip lg" style="background:#3f9a4d"></span></div><div class="cl">H 210° / 175° / 130°——隣り合う3色相<br>海から森へ、のような自然のグラデーション感</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#d64541"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">「強い緊張感」は補色配色（色相差180°）の特徴</div></div>`,
  principle:"類似色相配色＝隣り合う2〜3色相。自然で穏やかな変化",
  explain:"色相環で隣り合う色を2〜3つ使う配色は、自然界の色の移り変わり（空→海、葉→実）に近く、穏やかで心地よい印象になります。同一色相より変化があり、補色より落ち着く、バランスの良い型です。1色を主役に、残りを従にすると締まります。"
},
{
  g:"配色の技法", cat:"配色の型",
  title:"補色配色（コンプリメンタリー）",
  context:"補色（青×橙）を実際の画面で使うとき、上手な使い方はどちらでしょう？",
  la:"片方を主に、もう片方を小さくアクセントに", lb:"2色を同じ面積で並べる",
  good:`<div class="mock" style="background:#0f2a4a;padding:16px"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px">青系を大きく、橙は1点だけ</div><span style="display:inline-block;background:#c77b3a;color:#fff;border-radius:6px;padding:6px 14px;font-size:11px;font-weight:700">申し込む</span><div class="cl" style="margin-top:8px;background:rgba(255,255,255,.92)">ネイビー H 213°（大面積）× オレンジ H 28°（小面積）</div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="display:flex;height:70px"><div style="flex:1;background:#2c65c0"></div><div style="flex:1;background:#ff7a1a"></div></div><div class="cl" style="margin:8px">青と橙を同じ面積・同じ彩度で——目がチカチカする（ハレーション）</div></div>`,
  principle:"補色は「主役と脇役」の面積差で使う。同量・同彩度は刺激が強すぎる",
  explain:"補色は最も引き立て合う組み合わせですが、同じ面積・同じ強さで並べると互いに主張して目が疲れます（ハレーション）。片方を大面積の主役に、もう片方を小面積のアクセントに——面積比を大きくつけることで、対比の効果だけを取り出せます。"
},
{
  g:"配色の技法", cat:"配色の型",
  title:"三色配色（トライアド）",
  context:"色相環を3等分（120°ずつ）した3色を使う配色の特徴はどちらでしょう？",
  la:"バランスが良く元気だが、面積配分が重要", lb:"落ち着いた統一感が出る",
  good:`<div class="mock"><div style="display:flex;height:34px;border-radius:6px;overflow:hidden;margin-bottom:8px"><span style="flex:70;background:#3b6ea5"></span><span style="flex:22;background:#d9c227"></span><span style="flex:8;background:#d64541"></span></div><div class="cl">青 H 210° 70% ／ 黄 H 55% 22% ／ 赤 H 0° 8%<br>3色を等量にせず、主・副・アクセントの面積差で使う</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#3b6ea5"></span></div><div class="cl">「落ち着いた統一感」は同一・類似色相配色の特徴。トライアドは活発さが持ち味</div></div>`,
  principle:"トライアド＝120°間隔の3色。活発で華やか、面積比（70:25:5）が命",
  explain:"色相環を3等分した3色（赤・黄・青など）を使う配色は、バランスが取れて元気な印象になります。ただし3色を等量に使うと幼稚に見えるので、主70%・副25%・アクセント5%のように面積差をつけるのが鉄則。子ども向けや祭事など、賑やかさが欲しい場面向きです。"
},
{
  g:"配色の技法", cat:"配色の型",
  title:"分裂補色配色（スプリット・コンプリメンタリー）",
  context:"「青」に対して、補色の橙そのものではなく「橙の両隣（黄橙と赤橙）」を組み合わせる技法の狙いはどちらでしょう？",
  la:"補色の対比を保ちつつ刺激を和らげる", lb:"色相を統一して穏やかにする",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span style="width:6px"></span><span class="chip lg" style="background:#d9a227"></span><span class="chip lg" style="background:#d6602e"></span></div><div class="cl">青 H 210° に対し、補色 H 30° の両隣（H 42° と H 18°）を採用<br>正面衝突を避けながら対比を残す</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#3b6ea5"></span><span class="chip lg" style="background:#2e9a8f"></span></div><div class="cl">「色相を統一」は類似色相配色。分裂補色は対比を残す技法</div></div>`,
  principle:"分裂補色＝補色の両隣を使い、対比を残しつつ刺激を抑える",
  explain:"補色は強すぎる、でも対比は欲しい——そんなときに使うのが分裂補色です。補色そのものではなく、その両隣の2色を組み合わせると、正面衝突のハレーションを避けながら、十分な対比が得られます。補色配色より扱いやすく、実務でよく使われる型です。"
},
{
  g:"配色の技法", cat:"配色の骨格",
  title:"ベース・メイン・アクセントの3役",
  context:"配色を組み立てるときの「3つの役割」の面積比として適切なのはどちらでしょう？",
  la:"ベース70／メイン25／アクセント5", lb:"3色を等分（33%ずつ）",
  good:`<div class="mock"><div style="display:flex;height:34px;border-radius:6px;overflow:hidden;margin-bottom:8px"><span style="flex:70;background:#f8f9fb;border:1px solid #dde3e8"></span><span style="flex:25;background:#0f2a4a"></span><span style="flex:5;background:#c77b3a"></span></div><div class="cl"><b>ベース</b>70%：背景・余白（無彩色や淡色）<br><b>メイン</b>25%：ブランドの顔（見出し・ナビ）<br><b>アクセント</b>5%：行動を促す（ボタン・強調）</div></div>`,
  bad:`<div class="mock"><div style="display:flex;height:34px;border-radius:6px;overflow:hidden;margin-bottom:8px"><span style="flex:1;background:#f8f9fb;border:1px solid #dde3e8"></span><span style="flex:1;background:#0f2a4a"></span><span style="flex:1;background:#c77b3a"></span></div><div class="cl">等分にすると、どれが主役か分からずアクセントが効かない</div></div>`,
  principle:"配色は3役（ベース70：メイン25：アクセント5）で組み立てる",
  explain:"どんな配色技法を使うにしても、色には役割があります。ベース（土台・最大面積）、メイン（ブランドの印象を決める）、アクセント（視線を集める・最小面積）。この70:25:5の比率は、良い配色に共通する骨格です。色を選ぶ前に、まず「どの色を何の役にするか」を決めます。"
},
// ---------- 色の心理と実践（5問） ----------
{
  g:"色の心理と実践", cat:"色の連想",
  title:"色が持つ意味",
  context:"「信頼・誠実・冷静」を伝えたい金融サービスのブランドカラーとして適切なのはどちらでしょう？",
  la:"青系", lb:"赤系",
  good:`<div class="mock"><div class="msw"><span class="chip lg" style="background:#0f2a4a"></span><div class="cl"><b>ネイビー</b>#0f2a4a　H 213°<br>青は「信頼・冷静・誠実・知性」の連想。銀行・保険・法律に多い</div></div></div>`,
  bad:`<div class="mock"><div class="msw"><span class="chip lg" style="background:#d64541"></span><div class="cl"><b>レッド</b>#d64541　H 1°<br>赤は「情熱・警告・食欲・セール」の連想。金融の基調色には不向き</div></div></div>`,
  principle:"色には文化的な連想がある——青＝信頼、赤＝情熱／警告、緑＝安心／自然、黄＝注意／活力",
  explain:"色はそれ自体が意味を運びます。青は信頼と冷静、赤は情熱と警告、緑は安全と自然、黄は注意と活力、紫は高貴と神秘、黒は高級と重厚。ブランドカラーは「伝えたい価値」に合う色相から選びます。金融にネイビーが多いのは、偶然ではなく連想の一致です。"
},
{
  g:"色の心理と実践", cat:"色の見え方",
  title:"面積効果",
  context:"色見本で選んだ色を、実際に大面積の背景に使いました。起きることとして正しいのはどちらでしょう？",
  la:"見本より明るく鮮やかに見える", lb:"見本と全く同じに見える",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="display:flex;align-items:center;gap:10px;padding:10px"><span class="chip" style="background:#7ea3cc"></span><span class="ms">小さな見本</span></div><div style="background:#7ea3cc;padding:22px;color:#0f2a4a;font-size:11px;font-weight:700">同じ #7ea3cc を大面積で——見本より明るく強く感じる</div><div class="cl" style="margin:8px">面積が大きいほど、明るい色はより明るく、暗い色はより暗く見える（面積効果）</div></div>`,
  bad:`<div class="mock" style="padding:14px"><div class="cl">「全く同じに見える」は誤り。人の目は面積によって色の感じ方が変わる</div></div>`,
  principle:"色は面積が大きいほど強く見える——背景色は見本より一段淡く選ぶ",
  explain:"小さな色見本で「ちょうどいい」と感じた色は、大面積に使うと明るさも鮮やかさも増して見えます（面積効果）。背景やヒーロー帯に使う色は、見本で「少し薄いかな」と感じるくらいがちょうど良い。逆に小さなボタンやアイコンは、見本より一段強い色でも大丈夫です。"
},
{
  g:"色の心理と実践", cat:"色の見え方",
  title:"同時対比",
  context:"同じグレーを、白い背景と黒い背景に置きました。見え方として正しいのはどちらでしょう？",
  la:"黒地の上のほうが明るく見える", lb:"どちらも同じ明るさに見える",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="display:flex"><div style="flex:1;background:#ffffff;padding:16px;display:grid;place-items:center"><span class="chip" style="background:#808080;border:0"></span></div><div style="flex:1;background:#1a1a1a;padding:16px;display:grid;place-items:center"><span class="chip" style="background:#808080;border:0"></span></div></div><div class="cl" style="margin:8px">どちらも同じ #808080（L 50%）。黒地の上では明るく、白地の上では暗く見える</div></div>`,
  bad:`<div class="mock" style="padding:14px"><div class="cl">「同じに見える」は誤り。周囲の色との対比で、同じ色でも見え方が変わる</div></div>`,
  principle:"色は隣の色に影響される（同時対比）——単体ではなく組み合わせで判断する",
  explain:"同じ色でも、周囲が暗ければ明るく、明るければ暗く見えます。色相でも同じことが起き、灰色は隣の色の補色を帯びて見えます。だから色は「単体で良いか」ではなく「隣に置いたときにどう見えるか」で判断します。配色は必ず、実際の組み合わせで確認してください。"
},
{
  g:"色の心理と実践", cat:"実践の手順",
  title:"配色を組み立てる順番",
  context:"新しいサービスの配色を決める手順として適切なのはどちらでしょう？",
  la:"印象→メイン色相→トーン→派生→アクセント", lb:"好きな色を思いつくまま並べる",
  good:`<div class="mock"><div class="cl" style="line-height:1.9"><b>1.</b> 伝えたい印象を言葉にする（信頼／親しみ／高級…）<br><b>2.</b> 印象に合う色相を1つ選ぶ（メイン）<br><b>3.</b> 印象に合うトーンを決める（暗め／淡め…）<br><b>4.</b> 色相を固定して濃淡の派生色を作る<br><b>5.</b> 補色側から小面積のアクセントを1色</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#ff69b4"></span><span class="chip lg" style="background:#00ced1"></span><span class="chip lg" style="background:#ffa500"></span><span class="chip lg" style="background:#9400d3"></span></div><div class="cl">「好きな色」を根拠なく並べる——印象もトーンも揃わず、役割もない</div></div>`,
  principle:"配色は「印象→色相→トーン→派生→アクセント」の順で組み立てる",
  explain:"配色に迷わない人は、順番を守っています。まず言葉で印象を決め、それに合う色相とトーンを選び、色相を固定して濃淡を作り、最後にアクセントを1色足す。この順番なら、色彩の知識が浅くても破綻しません。「好きな色を並べる」は最後まで残しておく贅沢です。"
},
{
  g:"色の心理と実践", cat:"実践の点検",
  title:"配色の最終チェック",
  context:"作った配色を公開する前に確認すべきことはどちらでしょう？",
  la:"モノクロで明度差を確認する", lb:"自分の画面で綺麗に見えればOK",
  good:`<div class="mock"><div style="display:flex;gap:5px;margin-bottom:5px"><span class="chip lg" style="background:#0f2a4a"></span><span class="chip lg" style="background:#c77b3a"></span><span class="chip lg" style="background:#e8eef5"></span></div><div style="display:flex;gap:5px;margin-bottom:8px"><span class="chip lg" style="background:#2c2c2c"></span><span class="chip lg" style="background:#8a8a8a"></span><span class="chip lg" style="background:#efefef"></span></div><div class="cl">上：配色 ／ 下：彩度0にした状態<br>L 17% / 50% / 94%——モノクロでも3色が区別できれば合格</div></div>`,
  bad:`<div class="mock"><div class="cl">自分の画面・自分の目だけで判断すると、色覚の違い・モノクロ印刷・屋外の画面で破綻することに気づけない</div></div>`,
  principle:"最後は彩度0にして「明度差だけで区別できるか」を確認する",
  explain:"配色ができたら、必ずグレースケールにして確認します。明度差で区別できる配色は、色覚の多様性にも、モノクロ印刷にも、日光下のスマホにも耐えます。色相や彩度は見え方に個人差がありますが、明度差はほぼ誰にでも見えます。これが色彩の基本学習の締めくくりです。"
},
]};
