// UX CHOICE LAB — コース5: 余白と文字バランス編（30問）
// 余白＝メッセージ。「詰めれば正解」ではなく、コンセプトに合った余白と文字の関係を問う。
window.COURSE_SPACE = {
  id: "space",
  title: "余白と文字バランス編",
  en: "SPACE & TYPE",
  desc: "デザインの土台である「余白」と「文字の配置・大きさ」を30問で鍛えます。近接・比率・黄金比・ジャンプ率から、コンセプトによって余白そのものがメッセージになる、という一段深い視点まで踏み込みます。",
  minutes: "約15",
  groups: [
    {name:"余白の原理", icon:"□", note:"空白が構造をつくる"},
    {name:"余白とコンセプト", icon:"◻", note:"空白がメッセージになる"},
    {name:"文字の大きさと比率", icon:"Aa", note:"ジャンプ率と黄金比"},
    {name:"文字の配置と組み", icon:"≡", note:"揃え・行長・行間"}
  ],
  questions: [
// ---------- 余白の原理（8問） ----------
{
  g:"余白の原理", cat:"見出しと本文の関係",
  title:"近接の原則",
  context:"見出しと、それに続く本文の距離です。どの見出しがどの本文か一目で分かるのはどちらでしょう？",
  la:"見出しは本文に近く", lb:"見出しが上下等距離",
  good:`<div class="mock"><div class="sh" style="margin-bottom:12px">前のセクションの本文が続いています。</div><div style="font-size:13px;font-weight:700;color:#0f2a4a;margin-bottom:3px">安全性の分析</div><div class="sh">自己資本比率は42.5%で、業界平均を上回っています。</div><div style="height:16px"></div><div style="font-size:13px;font-weight:700;color:#0f2a4a;margin-bottom:3px">成長性の分析</div><div class="sh">売上成長率は3期平均で8.1%です。</div></div>`,
  bad:`<div class="mock"><div class="sh" style="margin-bottom:9px">前のセクションの本文が続いています。</div><div style="font-size:13px;font-weight:700;color:#0f2a4a;margin-bottom:9px">安全性の分析</div><div class="sh">自己資本比率は42.5%で、業界平均を上回っています。</div><div style="height:9px"></div><div style="font-size:13px;font-weight:700;color:#0f2a4a;margin-bottom:9px">成長性の分析</div><div class="sh">売上成長率は3期平均で8.1%です。</div></div>`,
  principle:"見出しは「上を広く・下を狭く」——余白の差で所属を示す",
  explain:"見出しの上下の余白が同じだと、見出しがどちらの本文に属するのか曖昧になります。関連するものは近く、関連しないものは遠く（近接の原則）。見出しの上の余白を下の2〜3倍にするだけで、線を引かなくても文章の構造が見えます。"
},
{
  g:"余白の原理", cat:"カード内のパディング",
  title:"内側の余白と外側の余白",
  context:"カードの内側の余白（パディング）と、カード同士の間隔の関係です。まとまって見えるのはどちらでしょう？",
  la:"内側 ＞ 外側", lb:"内側 ＜ 外側",
  good:`<div class="mock" style="background:#eef1f4;padding:10px"><div style="background:#fff;border-radius:8px;padding:18px;margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">売上高</b><div class="sh">3,120万円</div></div><div style="background:#fff;border-radius:8px;padding:18px"><b style="font-size:12px;color:#0f2a4a">営業利益</b><div class="sh">410万円</div></div></div>`,
  bad:`<div class="mock" style="background:#eef1f4;padding:10px"><div style="background:#fff;border-radius:8px;padding:5px;margin-bottom:24px"><b style="font-size:12px;color:#0f2a4a">売上高</b><div class="sh">3,120万円</div></div><div style="background:#fff;border-radius:8px;padding:5px"><b style="font-size:12px;color:#0f2a4a">営業利益</b><div class="sh">410万円</div></div></div>`,
  principle:"内側の余白は外側より大きく——中身が「箱の中に収まる」",
  explain:"カードの中の余白が外より小さいと、中身が箱の縁に張り付いて窮屈に見え、隣のカードとの隙間ばかりが目立ちます。内側の余白を外側より大きく取ると、要素が箱に「収まっている」安心感が出ます。入れ子構造は必ず「内 ＞ 外」が基本です。"
},
{
  g:"余白の原理", cat:"画面全体の余白設計",
  title:"余白のスケール（8の倍数）",
  context:"要素間の余白の刻み方です。整って見えるのはどちらでしょう？",
  la:"8px単位の一定のリズム", lb:"要素ごとにバラバラ",
  good:`<div class="mock"><div class="sh" style="margin-bottom:8px">項目1（下に8px）</div><div class="sh" style="margin-bottom:8px">項目2（下に8px）</div><div class="sh" style="margin-bottom:24px">項目3（下に24px＝グループ切れ目）</div><div class="sh" style="margin-bottom:8px">項目4（下に8px）</div><div class="sh">項目5</div><div class="ms" style="margin-top:12px">8 / 16 / 24 / 32 … の階段で刻む</div></div>`,
  bad:`<div class="mock"><div class="sh" style="margin-bottom:5px">項目1（下に5px）</div><div class="sh" style="margin-bottom:13px">項目2（下に13px）</div><div class="sh" style="margin-bottom:7px">項目3（下に7px）</div><div class="sh" style="margin-bottom:19px">項目4（下に19px）</div><div class="sh">項目5</div><div class="ms" style="margin-top:12px">5 / 13 / 7 / 19 … 場当たりの値</div></div>`,
  principle:"余白は「8の倍数」など一定のスケールから選ぶ",
  explain:"余白の値がバラバラだと、意図の有無に関わらず「雑」に見えます。8・16・24・32のように一定のスケールから選ぶと、離れた場所同士でもリズムが揃い、画面全体に見えない格子ができます。「なんとなく整って見える」の正体は、この一貫したスケールです。"
},
{
  g:"余白の原理", cat:"複数要素の間隔",
  title:"等間隔と、意味のある不等間隔",
  context:"5つの項目のうち、上3つと下2つが別グループです。構造が伝わるのはどちらでしょう？",
  la:"グループ間だけ広く", lb:"全部同じ間隔",
  good:`<div class="mock"><div class="sh" style="margin-bottom:6px">売上高</div><div class="sh" style="margin-bottom:6px">売上原価</div><div class="sh" style="margin-bottom:22px">売上総利益</div><div class="sh" style="margin-bottom:6px">販管費</div><div class="sh">営業利益</div></div>`,
  bad:`<div class="mock"><div class="sh" style="margin-bottom:11px">売上高</div><div class="sh" style="margin-bottom:11px">売上原価</div><div class="sh" style="margin-bottom:11px">売上総利益</div><div class="sh" style="margin-bottom:11px">販管費</div><div class="sh">営業利益</div></div>`,
  principle:"等間隔は「全部同格」のメッセージ——構造があるなら余白に差をつける",
  explain:"すべてを等間隔に並べるのは、「これらは全部同じ重さです」と宣言するのと同じです。グループの切れ目だけ余白を3倍にすれば、罫線も見出しもなしに構造が伝わります。余白の「差」が情報になる、というのが余白設計の核心です。"
},
{
  g:"余白の原理", cat:"ボタン内の文字の余白",
  title:"ボタンの内側余白の比率",
  context:"ボタンの文字周りの余白です。押しやすく品良く見えるのはどちらでしょう？",
  la:"左右は上下の約2倍", lb:"上下左右が同じ",
  good:`<div class="mock" style="text-align:center"><span class="mb mb-p" style="padding:10px 26px">試算する</span><div class="ms" style="margin-top:8px">上下10px ／ 左右26px（約1:2.5）</div></div>`,
  bad:`<div class="mock" style="text-align:center"><span class="mb mb-p" style="padding:10px 10px">試算する</span><div class="ms" style="margin-top:8px">上下10px ／ 左右10px（1:1）</div></div>`,
  principle:"ボタンの余白は「左右を上下の2〜3倍」にする",
  explain:"文字は横に伸びる形なので、上下と左右の余白を同じにすると左右が詰まって見え、ボタンが窮屈で頼りなくなります。左右を上下の2〜3倍にすると、視覚的に均等に見え、押せる面積も確保できます。数値上の均等と、目に映る均等は違います。"
},
{
  g:"余白の原理", cat:"レポートの読みやすさ",
  title:"段落間の余白と行間",
  context:"複数段落の文章です。段落の切れ目が分かり、かつ読みやすいのはどちらでしょう？",
  la:"段落間 ＞ 行間", lb:"段落間 ＝ 行間",
  good:`<div class="mock"><div class="sh" style="line-height:1.7;margin-bottom:12px">自己資本比率は42.5%で、中小企業の平均を上回っています。財務基盤は安定しているといえます。</div><div class="sh" style="line-height:1.7">一方、当座比率は68%と低く、短期の支払い余力には注意が必要です。</div></div>`,
  bad:`<div class="mock"><div class="sh" style="line-height:1.7;margin-bottom:0">自己資本比率は42.5%で、中小企業の平均を上回っています。財務基盤は安定しているといえます。</div><div class="sh" style="line-height:1.7">一方、当座比率は68%と低く、短期の支払い余力には注意が必要です。</div></div>`,
  principle:"段落間の余白は行間の1.5〜2倍——切れ目を余白で作る",
  explain:"段落間の余白が行間と同じだと、文章全体が1つの塊になって段落の切れ目が消えます。段落間を行間の1.5〜2倍にすると、字下げがなくても段落構造が見えます。行間は「読む速度」、段落間は「息継ぎ」を設計する余白です。"
},
{
  g:"余白の原理", cat:"画像とキャプション",
  title:"視覚要素と説明文の距離",
  context:"グラフとその説明文の配置です。どの説明がどのグラフのものか分かるのはどちらでしょう？",
  la:"説明はグラフに密着", lb:"説明が中間に浮く",
  good:`<div class="mock"><div style="height:44px;background:#e8eef5;border-radius:4px;margin-bottom:4px"></div><div class="ms" style="margin-bottom:20px">図1：売上高の推移（5期）</div><div style="height:44px;background:#e8eef5;border-radius:4px;margin-bottom:4px"></div><div class="ms">図2：営業利益の推移（5期）</div></div>`,
  bad:`<div class="mock"><div style="height:44px;background:#e8eef5;border-radius:4px;margin-bottom:12px"></div><div class="ms" style="margin-bottom:12px">図1：売上高の推移（5期）</div><div style="height:44px;background:#e8eef5;border-radius:4px;margin-bottom:12px"></div><div class="ms">図2：営業利益の推移（5期）</div></div>`,
  principle:"キャプションは対象に密着させ、次の要素からは離す",
  explain:"キャプションが上下の図から等距離に浮いていると、どちらの図の説明なのか判別できません。対象の図には密着（4〜6px）させ、次の要素からは大きく（16px以上）離す。「近い＝所属」という近接の原則を、余白の非対称で表現します。"
},
{
  g:"余白の原理", cat:"画面の端と要素",
  title:"画面端のマージン",
  context:"スマホ画面での左右の余白です。落ち着いて読めるのはどちらでしょう？",
  la:"左右に16〜20px", lb:"端ぎりぎりまで",
  good:`<div class="mock" style="padding:14px 18px"><b style="font-size:13px;color:#0f2a4a">財務分析レポート</b><div class="sh" style="margin-top:4px">画面の端から18pxの余白。文字が「呼吸」できる。</div></div>`,
  bad:`<div class="mock" style="padding:14px 3px"><b style="font-size:13px;color:#0f2a4a">財務分析レポート</b><div class="sh" style="margin-top:4px">画面の端から3px。文字が端に張り付き、切れて見える。</div></div>`,
  principle:"画面端の余白は最低16px——文字を端に張り付かせない",
  explain:"表示領域を最大化しようと端の余白を削ると、文字が画面の縁に張り付いて「切れている」ように見え、読む前に不快感を与えます。スマホでも左右16〜20px、PCではもっと広く。端の余白は削ってはいけない最後の砦です。"
},
// ---------- 余白とコンセプト（8問） ----------
{
  g:"余白とコンセプト", cat:"高級ブランドのLP",
  title:"余白がメッセージになる（1）",
  context:"高級コンサルティングサービスの紹介ページです。「格」が伝わるのはどちらでしょう？",
  la:"大胆な余白", lb:"情報を隙間なく",
  good:`<div class="mock" style="padding:44px 22px;text-align:center"><div style="font-size:9px;letter-spacing:.3em;color:#8d97a3;margin-bottom:12px">EXECUTIVE ADVISORY</div><div style="font-size:14px;font-weight:700;color:#0f2a4a;letter-spacing:.06em">経営者に、静かな余裕を。</div></div>`,
  bad:`<div class="mock" style="padding:8px"><div style="font-size:12px;font-weight:700;color:#0f2a4a">経営者向けエグゼクティブアドバイザリー</div><div class="sh" style="line-height:1.4">財務・税務・事業承継・M&A・資金調達・人事制度・IT導入まで、あらゆる経営課題にワンストップで対応。初回相談無料、全国対応、実績1,200社、満足度98%、専任担当制、24時間チャット対応…</div></div>`,
  principle:"余白は「余裕」の記号——高級感は空白の量で語る",
  explain:"高級ブランドのサイトほど余白が大きいのは偶然ではありません。空白は「この余裕を使えるだけの自信がある」というメッセージであり、詰め込みは「言いたいことがありすぎて焦っている」と読まれます。コンセプトが「格」なら、余白そのものがコピーです。"
},
{
  g:"余白とコンセプト", cat:"激安セールのチラシ",
  title:"余白がメッセージになる（2）",
  context:"週末限定の激安セールを告知するバナーです。「お得さ・勢い」が伝わるのはどちらでしょう？",
  la:"密度と大きさで押す", lb:"上品な余白",
  good:`<div class="mock" style="padding:10px;background:#a83d3d;color:#fff"><div style="font-size:11px;font-weight:700;letter-spacing:.05em">週末限定 2日間</div><div style="font-size:26px;font-weight:900;line-height:1;margin:2px 0">全品<span style="font-size:36px">30</span><span style="font-size:14px">%</span>OFF</div><div style="font-size:10px;font-weight:700">8/16(土)・17(日) 10:00〜19:00</div></div>`,
  bad:`<div class="mock" style="padding:40px 22px;text-align:center;background:#f8f9fb"><div style="font-size:9px;letter-spacing:.3em;color:#8d97a3;margin-bottom:12px">WEEKEND SALE</div><div style="font-size:13px;font-weight:700;color:#0f2a4a">全品30%オフ</div></div>`,
  principle:"密度は「勢い・お得」の記号——余白の少なさもまた設計",
  explain:"前問と逆に、セールや催事では「詰まっていること」自体が熱気や賑わいを伝えます。上品な余白で「全品30%オフ」と囁いても、お得感は生まれません。余白の多寡に絶対の正解はなく、「このコンセプトは何を伝えたいか」から逆算して量を決めます。"
},
{
  g:"余白とコンセプト", cat:"詩的なメッセージの見せ方",
  title:"余白で「間」をつくる",
  context:"企業理念のページで短い一文を見せます。言葉の重みが出るのはどちらでしょう？",
  la:"一文を余白の中に置く", lb:"補足で周りを埋める",
  good:`<div class="mock" style="padding:36px 20px;text-align:center"><div style="font-size:14px;font-weight:700;color:#0f2a4a;line-height:2.2;letter-spacing:.08em">数字の向こうに、<br>人がいる。</div></div>`,
  bad:`<div class="mock" style="padding:12px"><div style="font-size:14px;font-weight:700;color:#0f2a4a;margin-bottom:6px">数字の向こうに、人がいる。</div><div class="sh" style="line-height:1.6">私たちは財務データの分析を通じて、その背後にある経営者・従業員・取引先といったステークホルダーの想いを大切にし、持続可能な経営の実現に向けた伴走支援を提供しています。</div></div>`,
  principle:"言葉を立たせたいなら、周りを空ける——余白は「間（ま）」",
  explain:"音楽の休符や落語の間と同じで、言葉の前後の空白が言葉の重みを決めます。短い一文の周りを説明で埋めると、その一文は本文の見出しに格下げされます。理念やキャッチコピーのように「感じてほしい」言葉は、余白の中に一つだけ置きます。"
},
{
  g:"余白とコンセプト", cat:"信頼感のある業務ツール",
  title:"コンセプトに合う密度",
  context:"経営者が毎月使う財務ダッシュボードです。コンセプト（正確・信頼・効率）に合うのはどちらでしょう？",
  la:"整った中密度", lb:"美術館のような余白",
  good:`<div class="mock" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">2026年7月 月次サマリー</b><span class="ms">前月比</span></div><div style="display:flex;gap:8px;margin-bottom:8px"><div style="flex:1;background:#eef1f4;border-radius:6px;padding:8px"><div class="ms">売上高</div><b style="font-family:Arial;font-size:13px;color:#0f2a4a">3,120<span style="font-size:9px">万円</span></b></div><div style="flex:1;background:#eef1f4;border-radius:6px;padding:8px"><div class="ms">営業利益</div><b style="font-family:Arial;font-size:13px;color:#0f2a4a">410<span style="font-size:9px">万円</span></b></div></div><div class="ms">スクロールなしで主要指標が一覧できる</div></div>`,
  bad:`<div class="mock" style="padding:52px 20px;text-align:center"><div style="font-size:9px;letter-spacing:.3em;color:#8d97a3;margin-bottom:16px">JULY 2026</div><div class="ms">売上高</div><b style="font-family:Arial;font-size:26px;color:#0f2a4a">3,120<span style="font-size:12px">万円</span></b><div class="ms" style="margin-top:20px">（他の指標は下にスクロール）</div></div>`,
  principle:"業務ツールの余白は「効率」に奉仕する——美しさのために情報を隠さない",
  explain:"余白は多いほど良い、というわけでもありません。毎月数字を確認するツールで1指標ごとに画面をスクロールさせるのは、余白が効率を妨げています。業務ツールのコンセプトは「一覧性と正確さ」。余白は整列と区切りのために使い、密度は中程度に保ちます。"
},
{
  g:"余白とコンセプト", cat:"注目させたい1要素",
  title:"孤立による強調",
  context:"申込みボタンを目立たせたい場面です。装飾を足さずに視線を集められるのはどちらでしょう？",
  la:"周囲を空けて孤立させる", lb:"他の要素と密着",
  good:`<div class="mock"><div class="sh" style="margin-bottom:28px">ご不明点はお気軽にご相談ください。初回のご相談は無料です。</div><div style="text-align:center;margin-bottom:24px"><span class="mb mb-p" style="padding:11px 30px">無料相談を申し込む</span></div><div class="ms" style="text-align:center">受付 平日 9:00〜18:00</div></div>`,
  bad:`<div class="mock"><div class="sh" style="margin-bottom:6px">ご不明点はお気軽にご相談ください。初回のご相談は無料です。</div><div style="text-align:center;margin-bottom:6px"><span class="mb mb-p" style="padding:11px 30px">無料相談を申し込む</span></div><div class="ms" style="text-align:center">受付 平日 9:00〜18:00　※土日祝は休業　※電話でも受付</div></div>`,
  principle:"最強の強調は「周りを空けること」——孤立は色や大きさより強い",
  explain:"要素を目立たせる方法として、色を変える・大きくするより先に「周りを空ける」を試してください。空白に囲まれた要素は、それだけで視線を吸い寄せます（孤立の効果）。装飾を足す強調は他と競合しますが、余白による強調は他を静めるので競合しません。"
},
{
  g:"余白とコンセプト", cat:"余白の左右非対称",
  title:"動きを生む非対称の余白",
  context:"サービス紹介の見出しブロックです。「静的で整った印象」ではなく「動きと先進性」を出したい場合、適切なのはどちらでしょう？",
  la:"意図的な左寄せ・非対称", lb:"完全な左右対称",
  good:`<div class="mock" style="padding:24px 40px 24px 14px"><div style="font-size:9px;letter-spacing:.2em;color:#3b6ea5;font-weight:700">NEXT</div><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.4">次の10年の<br>財務戦略へ。</div><div class="ms" style="margin-top:6px">左に寄せ、右に空間を残す</div></div>`,
  bad:`<div class="mock" style="padding:24px 22px;text-align:center"><div style="font-size:9px;letter-spacing:.2em;color:#3b6ea5;font-weight:700">NEXT</div><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.4">次の10年の<br>財務戦略へ。</div><div class="ms" style="margin-top:6px">左右対称に中央配置</div></div>`,
  principle:"対称は「安定・伝統」、非対称は「動き・先進」——余白の偏りも語彙",
  explain:"左右対称の余白は安定・格式・伝統を、非対称の余白は緊張・動き・現代性を感じさせます。どちらが正しいかではなく、伝えたい印象で選びます。「動きを出したい」のに全部中央揃えにするのは、言葉と表情がちぐはぐな状態です。"
},
{
  g:"余白とコンセプト", cat:"上部の余白の量",
  title:"ページ最上部の「呼吸」",
  context:"ページを開いた瞬間のファーストビューです。読み手を落ち着いて迎え入れるのはどちらでしょう？",
  la:"見出しの上に十分な余白", lb:"見出しがヘッダーに密着",
  good:`<div class="mock" style="padding:0"><div style="border-bottom:1px solid #eef1f4;padding:8px 14px;font-size:10px;color:#8d97a3">ヘッダー</div><div style="padding:34px 14px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a">財務分析レポート</div><div class="sh" style="margin-top:4px">上部の余白が「これから始まる」の合図になる</div></div></div>`,
  bad:`<div class="mock" style="padding:0"><div style="border-bottom:1px solid #eef1f4;padding:8px 14px;font-size:10px;color:#8d97a3">ヘッダー</div><div style="padding:4px 14px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a">財務分析レポート</div><div class="sh" style="margin-top:4px">ヘッダーに見出しが張り付き、せわしない</div></div></div>`,
  principle:"最初の要素の上には、意識的に大きな余白を取る",
  explain:"ページ上部の余白は、本を開いたときの扉ページの余白と同じ役割です。見出しがヘッダーに張り付いていると、読み手は準備ができないまま内容に突入させられます。ファーストビューの上部余白は「ようこそ」の一拍。ここを削るのは最後にしてください。"
},
{
  g:"余白とコンセプト", cat:"余白の「量」の判断基準",
  title:"余白量の決め方",
  context:"新しいページを作るとき、余白の量をどう決めるべきでしょう？考え方として正しいのはどちらでしょう？",
  la:"伝えたい印象から逆算", lb:"常に最大限とる",
  good:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:6px">余白の設計プロセス</div><div class="sh" style="line-height:1.9">1. コンセプトを言葉にする（格／勢い／効率／静けさ…）<br>2. その印象に合う密度を決める<br>3. スケール（8の倍数等）で値に落とす</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#0f2a4a;margin-bottom:6px">余白の設計プロセス</div><div class="sh" style="line-height:1.9">1. とにかく余白を最大限とる<br>2. 「余白＝おしゃれ」なので多いほど良い<br>3. 情報が入らなければ文字を小さくする</div></div>`,
  principle:"余白は「多いほど良い」ではなく「コンセプトに合っているか」で決める",
  explain:"このコースの核心です。余白は装飾ではなく、伝えたい印象を運ぶ媒体です。高級感なら多く、勢いなら少なく、業務効率なら中程度。「余白＝おしゃれ」と思考停止して情報を隠したり文字を小さくしたりするのは、手段が目的化した状態。まず「何を感じてほしいか」を決めます。"
},
// ---------- 文字の大きさと比率（7問） ----------
{
  g:"文字の大きさと比率", cat:"見出しと本文のサイズ差",
  title:"ジャンプ率",
  context:"見出しと本文の大きさの比率です。「見出しだ」と一瞬で分かるのはどちらでしょう？",
  la:"本文の約1.6倍", lb:"本文の約1.1倍",
  good:`<div class="mock"><div style="font-size:19px;font-weight:900;color:#0f2a4a;line-height:1.3;margin-bottom:6px">損益分岐点を知る</div><div class="sh" style="font-size:12px;line-height:1.8">売上がいくらを下回ると赤字になるのか。固定費と変動費率から境界線を計算します。</div><div class="ms" style="margin-top:8px">19px ÷ 12px ＝ ジャンプ率 約1.6</div></div>`,
  bad:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#0f2a4a;line-height:1.5;margin-bottom:6px">損益分岐点を知る</div><div class="sh" style="font-size:12px;line-height:1.8">売上がいくらを下回ると赤字になるのか。固定費と変動費率から境界線を計算します。</div><div class="ms" style="margin-top:8px">13px ÷ 12px ＝ ジャンプ率 約1.1</div></div>`,
  principle:"見出しは本文の1.5倍以上（ジャンプ率）で差をつける",
  explain:"見出しと本文のサイズ比を「ジャンプ率」と呼びます。1.1倍程度の僅差では見出しが見出しとして機能せず、画面がのっぺりします。1.5〜2倍あれば一瞥で構造が分かります。ジャンプ率が高いほど躍動的、低いほど落ち着いた印象——これも印象を操作するパラメータです。"
},
{
  g:"文字の大きさと比率", cat:"ジャンプ率と印象",
  title:"ジャンプ率で印象を変える",
  context:"「落ち着いた高級感」を出したいレポート表紙です。適切なジャンプ率はどちらでしょう？",
  la:"低めのジャンプ率（1.3〜1.5）", lb:"極端なジャンプ率（4以上）",
  good:`<div class="mock" style="padding:28px 18px"><div style="font-size:16px;font-weight:700;color:#0f2a4a;letter-spacing:.06em">財務分析レポート</div><div style="font-size:11px;color:#56626f;margin-top:6px;letter-spacing:.04em">2026年3月期　株式会社サンプル製作所</div><div class="ms" style="margin-top:14px">見出し16px／本文11px ＝ 約1.5。静かで格調のある印象</div></div>`,
  bad:`<div class="mock" style="padding:14px"><div style="font-size:34px;font-weight:900;color:#0f2a4a;line-height:1;letter-spacing:-.03em">財務分析<br>レポート</div><div style="font-size:8px;color:#56626f;margin-top:6px">2026年3月期　株式会社サンプル製作所</div><div class="ms" style="margin-top:10px">見出し34px／本文8px ＝ 約4.3。躍動的だが騒がしい</div></div>`,
  principle:"ジャンプ率が高いほど「動・若・広告的」、低いほど「静・格・書籍的」",
  explain:"ジャンプ率は高ければ良いわけではありません。極端なサイズ差は勢いや若さを演出しますが、落ち着きは失われます。高級感・信頼感を出したいなら1.3〜1.6の控えめな比率で、代わりに余白と字間で品を作る。印象から逆算して比率を選びます。"
},
{
  g:"文字の大きさと比率", cat:"サイズ体系の設計",
  title:"文字サイズの階段（タイプスケール）",
  context:"1つのツールで使う文字サイズの決め方です。破綻しにくいのはどちらでしょう？",
  la:"比率で刻んだ5段階", lb:"その場その場で決める",
  good:`<div class="mock"><div style="font-size:26px;font-weight:900;color:#0f2a4a;line-height:1.2">26</div><div style="font-size:20px;font-weight:700;color:#0f2a4a;line-height:1.3">20 見出し</div><div style="font-size:16px;font-weight:700;color:#0f2a4a;line-height:1.4">16 小見出し</div><div style="font-size:13px;color:#4a5460;line-height:1.5">13 本文</div><div style="font-size:11px;color:#8d97a3;line-height:1.5">11 注釈</div><div class="ms" style="margin-top:8px">約1.25倍ずつの等比数列（タイプスケール）</div></div>`,
  bad:`<div class="mock"><div style="font-size:26px;font-weight:900;color:#0f2a4a;line-height:1.2">26</div><div style="font-size:24px;font-weight:700;color:#0f2a4a;line-height:1.3">24 見出し</div><div style="font-size:15px;font-weight:700;color:#0f2a4a;line-height:1.4">15 小見出し</div><div style="font-size:14px;color:#4a5460;line-height:1.5">14 本文</div><div style="font-size:13.5px;color:#8d97a3;line-height:1.5">13.5 注釈</div><div class="ms" style="margin-top:8px">26/24/15/14/13.5：似たサイズが隣接し、役割の区別がつかない</div></div>`,
  principle:"文字サイズは等比（1.2〜1.33倍）の階段から選ぶ",
  explain:"文字サイズを場当たりで決めると、14pxと13.5pxのような「違うけど区別できない」サイズが量産されます。基準（本文）を決め、1.25倍ずつの階段（13→16→20→26→32）を作ってそこからだけ選べば、どの2つを並べても役割の差が見えます。これをタイプスケールと呼びます。"
},
{
  g:"文字の大きさと比率", cat:"レイアウトの分割比",
  title:"黄金比・白銀比の分割",
  context:"2カラムのレイアウトの幅の比率です。安定して美しく見えるのはどちらでしょう？",
  la:"約1:1.6（黄金比）", lb:"約1:1.1（ほぼ等分だがズレ）",
  good:`<div class="mock" style="padding:10px"><div style="display:flex;gap:8px;height:70px"><div style="flex:1;background:#0f2a4a;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:700">1</div><div style="flex:1.618;background:#e8eef5;border-radius:6px;display:grid;place-items:center;color:#0f2a4a;font-size:11px;font-weight:700">1.618</div></div><div class="ms" style="margin-top:8px">1 : 1.618（黄金比）—— 明確な主従で安定</div></div>`,
  bad:`<div class="mock" style="padding:10px"><div style="display:flex;gap:8px;height:70px"><div style="flex:1;background:#0f2a4a;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:700">1</div><div style="flex:1.1;background:#e8eef5;border-radius:6px;display:grid;place-items:center;color:#0f2a4a;font-size:11px;font-weight:700">1.1</div></div><div class="ms" style="margin-top:8px">1 : 1.1 —— 等分でも主従でもない中途半端なズレ</div></div>`,
  principle:"分割は「1:1（等分）」か「1:1.6（黄金比）」——中途半端な比率を避ける",
  explain:"レイアウトの分割比は、等分（1:1）で「対等」を、黄金比（1:1.618）や白銀比（1:1.414）で「主従」を表現します。1:1.1のような中途半端な比率は「揃えようとして失敗した」ように見えます。比率は意図を宣言する数値。迷ったら黄金比に寄せると、理由は分からなくても「収まりが良い」と感じられます。"
},
{
  g:"文字の大きさと比率", cat:"数字と単位の比率",
  title:"主役の数字と従の単位",
  context:"結果として大きく見せる金額です。数字が主役に見えるのはどちらでしょう？",
  la:"単位は数字の約半分", lb:"単位も数字と同じ大きさ",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">想定される退職金原資</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:28px">8,400</span><span style="font-size:13px;color:#56626f"> 万円</span></div><div class="ms" style="margin-top:6px">28px : 13px ＝ 約2:1</div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">想定される退職金原資</div><div style="font-family:Arial,'Yu Gothic';font-weight:700;color:#0f2a4a;font-size:28px">8,400万円</div><div class="ms" style="margin-top:6px">28px : 28px ＝ 1:1</div></div>`,
  principle:"数値と単位は約2:1——比率で主従を作る",
  explain:"数字と単位が同じ大きさだと、視線が「8,400万円」全体に散って肝心の数値がぼやけます。単位を数字の40〜55%に落とすと、数字が主役として立ち上がります。これも比率設計の一種で、金額・比率・人数などすべての単位付き数値に適用できる原則です。"
},
{
  g:"文字の大きさと比率", cat:"最小サイズの下限",
  title:"読ませる文字の最小サイズ",
  context:"注釈や補足の文字サイズです。読ませる意思があると伝わるのはどちらでしょう？",
  la:"注釈でも11px以上", lb:"8pxまで下げる",
  good:`<div class="mock"><div class="sh" style="font-size:13px;margin-bottom:8px">試算結果は概算です。</div><div style="font-size:11px;color:#8d97a3;line-height:1.6">※2026年8月時点の税制に基づきます。実際の税額は税理士等にご確認ください。</div></div>`,
  bad:`<div class="mock"><div class="sh" style="font-size:13px;margin-bottom:8px">試算結果は概算です。</div><div style="font-size:7.5px;color:#8d97a3;line-height:1.4">※2026年8月時点の税制に基づきます。実際の税額は税理士等にご確認ください。※本ツールの利用により生じた損害について当社は責任を負いかねます。※詳細は利用規約をご確認ください。</div></div>`,
  principle:"画面で読ませる文字は11px以上——それ以下は「読ませない」の意思表示",
  explain:"文字サイズには「これ以下は読まれない」下限があり、画面では11px前後です。8pxの注釈は「一応書いてあります」というアリバイにしかならず、誠実さを疑われます。小さくしないと入らないなら、文章を削るか折りたたむのが正解です。"
},
{
  g:"文字の大きさと比率", cat:"太さの使い分け",
  title:"ウェイト（太さ）のコントラスト",
  context:"見出しと本文の太さの組み合わせです。メリハリが出るのはどちらでしょう？",
  la:"太い見出し×標準の本文", lb:"全部同じ太さ",
  good:`<div class="mock"><div style="font-size:14px;font-weight:900;color:#0f2a4a;margin-bottom:4px">安全性の分析</div><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.8">自己資本比率は42.5%で、中小企業の平均を上回っています。</div><div class="ms" style="margin-top:6px">Black（900）× Regular（400）</div></div>`,
  bad:`<div class="mock"><div style="font-size:14px;font-weight:700;color:#0f2a4a;margin-bottom:4px">安全性の分析</div><div style="font-size:12px;font-weight:700;color:#4a5460;line-height:1.8">自己資本比率は42.5%で、中小企業の平均を上回っています。</div><div class="ms" style="margin-top:6px">Bold（700）× Bold（700）：太さの差がない</div></div>`,
  principle:"見出しと本文はウェイトを2段階以上離す（サイズ差だけに頼らない）",
  explain:"サイズを変えなくても、太さ（ウェイト）の差だけで階層は作れます。逆に全部Boldだと、サイズを変えても画面全体が「叫んでいる」ように見えます。見出しは太く（700〜900）、本文は標準（400）。この差がメリハリの半分を担います。"
},
// ---------- 文字の配置と組み（7問） ----------
{
  g:"文字の配置と組み", cat:"本文の1行の長さ",
  title:"行長（1行の文字数）",
  context:"横幅の広い画面での本文です。目が迷子にならないのはどちらでしょう？",
  la:"1行 35〜45字に制限", lb:"画面幅いっぱい",
  good:`<div class="mock"><div class="sh" style="max-width:250px;line-height:1.8">自己資本比率は純資産を総資産で割った値で、財務の安定性を示す代表的な指標です。中小企業では40%程度が平均とされます。</div><div class="ms" style="margin-top:6px">1行 約22字（この幅では適正）</div></div>`,
  bad:`<div class="mock" style="max-width:320px"><div class="sh" style="font-size:9px;line-height:1.5;letter-spacing:.01em">自己資本比率は純資産を総資産で割った値で、財務の安定性を示す代表的な指標です。中小企業では40%程度が平均とされ、これを上回ると金融機関からの評価も得やすくなります。逆に20%を下回ると財務体質の改善が急務といえるでしょう。</div><div class="ms" style="margin-top:6px">1行 約45字以上（行末→次行頭で視線が迷う）</div></div>`,
  principle:"日本語の本文は1行35〜45字——max-widthで行長を制御する",
  explain:"1行が長すぎると、行末から次の行頭へ視線を戻すときに行を見失います。日本語なら1行35〜45字が快適圏。ワイド画面では本文にmax-width（600〜700px程度）を設定し、余った幅は余白にします。「幅があるから使う」は行長の敵です。"
},
{
  g:"文字の配置と組み", cat:"行間の設定",
  title:"行間（行送り）",
  context:"日本語の本文の行間です。読み疲れしにくいのはどちらでしょう？",
  la:"行間 1.7〜1.9", lb:"行間 1.2",
  good:`<div class="mock"><div class="sh" style="line-height:1.8">日本語は文字が正方形で密度が高く、行間が詰まると上下の行が干渉して読みにくくなります。本文には十分な行間が必要です。</div><div class="ms" style="margin-top:6px">line-height 1.8</div></div>`,
  bad:`<div class="mock"><div class="sh" style="line-height:1.2">日本語は文字が正方形で密度が高く、行間が詰まると上下の行が干渉して読みにくくなります。本文には十分な行間が必要です。</div><div class="ms" style="margin-top:6px">line-height 1.2</div></div>`,
  principle:"日本語本文の行間は1.7〜1.9（欧文より広く）",
  explain:"欧文は1.4〜1.5で読めますが、日本語は文字が正方形で上下の余白がないため、同じ行間では詰まって見えます。本文は1.7〜1.9が目安。逆に大きな見出しは1.2〜1.4に締めないと間延びします。文字が大きいほど行間は狭く、小さいほど広く、が原則です。"
},
{
  g:"文字の配置と組み", cat:"見出しの字間",
  title:"字間（トラッキング）",
  context:"大きな見出しと小さな英字キッカーの字間です。それぞれ美しく見えるのはどちらでしょう？",
  la:"大文字は詰め、小英字は開ける", lb:"どちらも標準のまま",
  good:`<div class="mock"><div style="font-size:9px;letter-spacing:.25em;color:#3b6ea5;font-weight:700;margin-bottom:2px">FINANCIAL REPORT</div><div style="font-size:22px;font-weight:900;color:#0f2a4a;letter-spacing:-.03em;line-height:1.2">決算分析</div><div class="ms" style="margin-top:8px">小さな英字は+0.25em、大見出しは−0.03em</div></div>`,
  bad:`<div class="mock"><div style="font-size:9px;letter-spacing:0;color:#3b6ea5;font-weight:700;margin-bottom:2px">FINANCIAL REPORT</div><div style="font-size:22px;font-weight:900;color:#0f2a4a;letter-spacing:.12em;line-height:1.2">決算分析</div><div class="ms" style="margin-top:8px">小さな英字は詰まり、大見出しは間延びしている</div></div>`,
  principle:"大きな文字は字間を詰め、小さな英字（大文字）は開ける",
  explain:"文字が大きくなるほど字間は広く見えるので、大見出しはわずかに詰め（−0.02〜−0.05em）ます。逆に小さな英大文字（キッカー・ラベル）は開ける（+0.15〜0.3em）と品が出ます。「サイズに反比例して字間を調整する」がタイポグラフィの基本動作です。"
},
{
  g:"文字の配置と組み", cat:"揃えの選択",
  title:"左揃え・中央揃え・両端揃え",
  context:"複数段落の本文の揃え方です。日本語の本文として読みやすいのはどちらでしょう？",
  la:"左揃え", lb:"中央揃え",
  good:`<div class="mock"><div class="sh" style="line-height:1.8;text-align:left">流動比率は短期の支払能力を示す指標です。<br>120%以上が望ましいとされます。<br>当社は142%で、基準を満たしています。</div><div class="ms" style="margin-top:6px">行頭が揃い、視線の戻り位置が一定</div></div>`,
  bad:`<div class="mock"><div class="sh" style="line-height:1.8;text-align:center">流動比率は短期の支払能力を示す指標です。<br>120%以上が望ましいとされます。<br>当社は142%で、基準を満たしています。</div><div class="ms" style="margin-top:6px">行頭が毎行ずれ、読み始めの位置を探す</div></div>`,
  principle:"本文は左揃え——中央揃えは3行以下の短い見出し・キャッチまで",
  explain:"中央揃えは行頭が毎行違う位置になり、次の行の読み始めを毎回探すことになります。3行を超える文章の中央揃えは読み手への負担です。左揃えは行頭が一直線に並び、視線の戻り先が固定されます。中央揃えは「短い言葉を象徴的に置く」場面に限定します。"
},
{
  g:"文字の配置と組み", cat:"見出しの折り返し",
  title:"改行位置の制御",
  context:"2行になるキャッチコピーです。意味がすっと入るのはどちらでしょう？",
  la:"意味の切れ目で改行", lb:"文字数で自動折り返し",
  good:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.6">決算書を入れるだけで、<br>会社の値段がわかる。</div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:20px 14px"><div style="font-size:15px;font-weight:900;color:#0f2a4a;line-height:1.6">決算書を入れるだけで、会社の<br>値段がわかる。</div></div>`,
  principle:"見出しは意味の単位で改行を制御する（幅任せにしない）",
  explain:"「会社の／値段がわかる」のように、意味のまとまりの途中で折り返された見出しは、読み手の頭の中で分解と再結合が起き、コピーの力が削がれます。重要な見出しは改行位置を明示的に指定するか、幅で調整して意味の切れ目で折り返します。日本語見出しは「どこで切るか」までがデザインです。"
},
{
  g:"文字の配置と組み", cat:"見出しと本文の幅",
  title:"揃えの基準線（アライメント）",
  context:"見出し・本文・ボタンの左端の位置です。整って見えるのはどちらでしょう？",
  la:"全部同じ左端に揃う", lb:"要素ごとに左端がずれる",
  good:`<div class="mock"><div style="font-size:14px;font-weight:900;color:#0f2a4a;margin-bottom:6px">退職金の準備状況</div><div class="sh" style="margin-bottom:10px">現在の積立額と将来の必要額を比較します。</div><span class="mb mb-p" style="padding:8px 18px;font-size:12px">試算する</span><div class="ms" style="margin-top:8px">見出し・本文・ボタンの左端が一直線</div></div>`,
  bad:`<div class="mock"><div style="font-size:14px;font-weight:900;color:#0f2a4a;margin-bottom:6px;padding-left:12px">退職金の準備状況</div><div class="sh" style="margin-bottom:10px;padding-left:4px">現在の積立額と将来の必要額を比較します。</div><span class="mb mb-p" style="padding:8px 18px;font-size:12px;margin-left:22px">試算する</span><div class="ms" style="margin-top:8px">左端がバラバラで、見えない線が引けない</div></div>`,
  principle:"要素の左端を1本の見えない線に揃える",
  explain:"整った画面には必ず「見えない縦線」があり、見出し・本文・ボタンの左端がその線に揃っています。数pxのズレでも、人の目は違和感として検知します。中央揃えを混ぜたり、要素ごとにインデントを変えたりすると、この線が引けなくなります。"
},
{
  g:"文字の配置と組み", cat:"和文と欧文の混植",
  title:"日本語と数字・英字のバランス",
  context:"日本語の中に数字と英字が混ざる文です。なじんで見えるのはどちらでしょう？",
  la:"半角＋欧文フォント＋わずかな余白", lb:"全角数字・英字",
  good:`<div class="mock"><div class="sh" style="line-height:1.8">従業員 <span style="font-family:Arial">30</span> 名、売上 <span style="font-family:Arial">3.2</span> 億円、<span style="font-family:Arial">ROE 8.4%</span> の製造業。</div><div class="ms" style="margin-top:6px">数字・英字は半角の欧文フォント、前後にわずかな間</div></div>`,
  bad:`<div class="mock"><div class="sh" style="line-height:1.8">従業員３０名、売上３．２億円、ＲＯＥ８．４％の製造業。</div><div class="ms" style="margin-top:6px">全角の数字・英字は間延びして日本語と喧嘩する</div></div>`,
  principle:"和文中の数字・英字は半角＋欧文フォントで、和文と欧文の間に薄い空きを",
  explain:"全角の数字や英字は文字幅が広く、日本語の中で浮いて見えます。半角＋欧文フォント（Arial等）にすると引き締まり、さらに和文と欧文の境目に四分アキ程度の空きが入ると呼吸が生まれます。「30名」と「３０名」の差は小さいようで、文書全体の格を左右します。"
},
]};
