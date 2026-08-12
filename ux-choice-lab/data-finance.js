// UX CHOICE LAB — コース2: 財務分析ツールのUI/UX（80問）
window.COURSE_FINANCE = {
  id: "finance",
  title: "財務分析ツールのUI/UX",
  en: "FINANCE TOOL UI/UX",
  desc: "財務分析ツールを「作る側」の視点で学ぶ80問。UXに加えて、整列・タイポグラフィ・配色・デザインガイドラインなど基本的なUI設計と、チュートリアル設計までを扱います。",
  minutes: "約40",
  groups: [
    {name:"レイアウトと整列", icon:"▦", note:"揃えて配置する"},
    {name:"タイポグラフィ", icon:"Aa", note:"文字を設計する"},
    {name:"色の設計", icon:"◐", note:"色に役割を持たせる"},
    {name:"一貫性とガイドライン", icon:"≡", note:"全ページで統一する"},
    {name:"フォームと入力", icon:"□", note:"入力を助ける"},
    {name:"数値とデータ表示", icon:"%", note:"数字を読ませる"},
    {name:"状態と反応", icon:"↻", note:"今を伝える"},
    {name:"チュートリアル", icon:"?", note:"使いながら学ぶ"}
  ],
  questions: [
// ---------- レイアウトと整列（10問） ----------
{
  g:"レイアウトと整列", cat:"分析結果カード",
  title:"テキストの揃えの混在",
  context:"指標カード内の見出し・説明・注記の揃え方です。読みやすいのはどちらでしょう？",
  la:"左揃えで統一", lb:"中央・左・右が混在",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:2px">自己資本比率</div><div class="ms" style="margin-bottom:6px">純資産 ÷ 総資産で算出</div><div style="font-size:22px;font-weight:700;color:#0f2a4a;font-family:Arial">42.5<span style="font-size:12px;color:#56626f"> %</span></div><div class="ms" style="margin-top:4px">前期：38.2%</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:2px;text-align:center">自己資本比率</div><div class="ms" style="margin-bottom:6px">純資産 ÷ 総資産で算出</div><div style="font-size:22px;font-weight:700;color:#0f2a4a;font-family:Arial;text-align:center">42.5<span style="font-size:12px;color:#56626f"> %</span></div><div class="ms" style="margin-top:4px;text-align:right">前期：38.2%</div></div>`,
  principle:"揃え方は1画面の中で統一する（左揃えが基本）",
  explain:"見出しは中央、本文は左、注記は右…と揃えが混在すると、視線の起点が行ごとにずれて読むリズムが崩れます。日本語のUIは左揃えを基本に統一し、中央揃えは短い見出しや数値の強調など限定的な場面にとどめます。"
},
{
  g:"レイアウトと整列", cat:"財務データ入力フォーム",
  title:"ラベルと入力欄の整列",
  context:"複数の入力欄が並ぶフォームです。視線移動が少ないのはどちらでしょう？",
  la:"ラベルを上に統一", lb:"横並びで開始位置バラバラ",
  good:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:8px"></div><label class="ml">販売費及び一般管理費</label><input class="mi" value="8,500" readonly style="text-align:right"></div>`,
  bad:`<div class="mock"><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span class="ml" style="margin:0;white-space:nowrap">売上高</span><input class="mi" value="30,000" readonly style="text-align:right"></div><div style="display:flex;align-items:center;gap:6px"><span class="ml" style="margin:0;white-space:nowrap">販売費及び一般管理費</span><input class="mi" style="width:40%" value="8,500" readonly readonly></div></div>`,
  principle:"入力欄の開始位置を縦一直線に揃える",
  explain:"ラベルの長さが項目ごとに違うと、横並びレイアウトでは入力欄の開始位置がガタガタになります。ラベルを欄の上に置けば、どんなに長い項目名でも入力欄の左端が揃い、目と手の移動が最短になります。財務項目は名称が長いものが多いため特に有効です。"
},
{
  g:"レイアウトと整列", cat:"ダッシュボードのKPIタイル",
  title:"カード寸法の統一",
  context:"主要指標を並べたタイルです。整って見えるのはどちらでしょう？",
  la:"同じ高さ・同じ余白", lb:"高さも余白もバラバラ",
  good:`<div class="mock" style="display:flex;gap:8px"><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:10px;text-align:left"><div class="ms">売上高</div><div style="font-size:16px;font-weight:700;font-family:Arial;color:#0f2a4a">3.2<span style="font-size:10px">億円</span></div></div><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">営業利益</div><div style="font-size:16px;font-weight:700;font-family:Arial;color:#0f2a4a">4,200<span style="font-size:10px">万円</span></div></div><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">利益率</div><div style="font-size:16px;font-weight:700;font-family:Arial;color:#0f2a4a">13.1<span style="font-size:10px">%</span></div></div></div>`,
  bad:`<div class="mock" style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1.4;border:1px solid #dde3e8;border-radius:8px;padding:16px"><div class="ms">売上高</div><div style="font-size:20px;font-weight:700;font-family:Arial;color:#0f2a4a">3.2<span style="font-size:11px">億円</span></div><div class="ms">前期比+12%</div></div><div style="flex:1;border:2px solid #dde3e8;border-radius:14px;padding:6px"><div class="ms">営業利益</div><div style="font-size:13px;font-weight:700;font-family:Arial;color:#0f2a4a">4,200<span style="font-size:9px">万円</span></div></div><div style="flex:.8;border:1px solid #dde3e8;padding:12px 6px"><div class="ms">利益率</div><div style="font-size:15px;font-weight:700;font-family:Arial;color:#0f2a4a">13.1%</div></div></div>`,
  principle:"同格の情報は、同じ寸法・同じ書式で並べる",
  explain:"高さ・余白・角丸がバラバラのタイルは、それだけで「重要度が違うのか？」という誤ったメッセージを発します。同格の指標は同じ寸法・同じ文字サイズで並べることで、比較のしやすさと画面の秩序が生まれます。"
},
{
  g:"レイアウトと整列", cat:"設定画面のセクション",
  title:"余白のスケール",
  context:"セクション間・要素間の余白の取り方です。構造が伝わるのはどちらでしょう？",
  la:"一定のリズムで余白", lb:"詰まったり空いたり",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">基本情報</div><label class="ml">会社名</label><input class="mi" readonly><div style="height:8px"></div><label class="ml">決算月</label><input class="mi" style="width:40%" readonly><div style="height:16px"></div><div class="mtitle" style="margin-bottom:8px">表示設定</div><label class="ml">金額単位</label><input class="mi" style="width:40%" value="万円" readonly></div>`,
  bad:`<div class="mock"><div class="mtitle">基本情報</div><label class="ml" style="margin-top:1px">会社名</label><input class="mi" readonly><div style="height:26px"></div><label class="ml">決算月</label><input class="mi" style="width:40%" readonly><div style="height:3px"></div><div class="mtitle" style="margin-bottom:14px">表示設定</div><label class="ml">金額単位</label><input class="mi" style="width:40%" value="万円" readonly></div>`,
  principle:"余白は近接の原則に従い、一定のスケールで刻む",
  explain:"余白はただの空きスペースではなく「どれとどれが仲間か」を伝える情報です。関連する要素は近く、セクションの切れ目は広く、という差を一定のルール（例：8pxの倍数）で刻むと、線を引かなくても構造が伝わります。"
},
{
  g:"レイアウトと整列", cat:"財務指標の入力画面",
  title:"関連項目のグルーピング",
  context:"入力項目の並べ方です。全体像を把握しやすいのはどちらでしょう？",
  la:"分類ごとにまとめる", lb:"全項目を等間隔に羅列",
  good:`<div class="mock"><div style="font-size:11px;font-weight:700;color:#2d5580;background:#e8eef5;border-radius:4px;padding:2px 8px;display:inline-block;margin-bottom:6px">収益項目</div><label class="ml">売上高</label><input class="mi" readonly><div style="height:12px"></div><div style="font-size:11px;font-weight:700;color:#456155;background:#e7efeb;border-radius:4px;padding:2px 8px;display:inline-block;margin-bottom:6px">費用項目</div><label class="ml">売上原価</label><input class="mi" readonly></div>`,
  bad:`<div class="mock"><label class="ml">売上高</label><input class="mi" readonly><div style="height:8px"></div><label class="ml">減価償却費</label><input class="mi" readonly><div style="height:8px"></div><label class="ml">売上原価</label><input class="mi" readonly><div style="height:8px"></div><label class="ml">受取利息</label><input class="mi" readonly></div>`,
  principle:"関連する項目は視覚的にグループ化する（近接の原則）",
  explain:"収益・費用・資産のように性質の違う項目を無秩序に並べると、ユーザーは1項目ずつ意味を解読しながら進むことになります。分類見出しでグループ化すれば、決算書との突き合わせも速く、入力漏れにも気づきやすくなります。"
},
{
  g:"レイアウトと整列", cat:"分析レポートの構成",
  title:"結論と詳細の順序",
  context:"分析結果ページの情報の並べ方です。忙しい経営者に伝わるのはどちらでしょう？",
  la:"結論が先、詳細は後", lb:"詳細の羅列の末に結論",
  good:`<div class="mock"><div style="background:#e8eef5;border-radius:8px;padding:10px;margin-bottom:8px;text-align:center"><div class="ms">総合評価</div><div style="font-size:24px;font-weight:700;color:#0f2a4a;font-family:Arial">B+</div><div style="font-size:11px;color:#2d5580">収益性は良好、安全性に改善余地</div></div><div class="ms">▼ 詳細な指標を見る</div></div>`,
  bad:`<div class="mock"><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8">流動比率 142.3%<br>当座比率 98.1%<br>固定比率 88.4%<br>自己資本比率 42.5%<br>…（20指標が続く）</div><div class="ms" style="margin-top:8px">最下部に総合評価があります</div></div>`,
  principle:"結論ファースト（逆ピラミッド）で構成する",
  explain:"分析ツールの利用者がまず知りたいのは「で、うちの会社はどうなの？」という結論です。総合評価を最上部に置き、根拠となる詳細指標は下に畳む逆ピラミッド構成なら、忙しい人には結論だけ、深掘りしたい人には詳細も届きます。"
},
{
  g:"レイアウトと整列", cat:"20指標の分析画面",
  title:"1画面の情報密度",
  context:"多数の指標を見せる画面です。理解しやすいのはどちらでしょう？",
  la:"タブで分野別に分割", lb:"1画面にぎっしり",
  good:`<div class="mock"><div class="mtabs"><span class="mtab on">収益性</span><span class="mtab">安全性</span><span class="mtab">成長性</span></div><div style="display:flex;gap:8px"><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:8px"><div class="ms">営業利益率</div><b style="font-family:Arial;color:#0f2a4a">13.1%</b></div><div style="flex:1;border:1px solid #dde3e8;border-radius:8px;padding:8px"><div class="ms">ROE</div><b style="font-family:Arial;color:#0f2a4a">8.4%</b></div></div></div>`,
  bad:`<div class="mock"><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:3px;font-size:8px;font-weight:400;color:#4a5460"><span>営業利益率 13.1%</span><span>ROE 8.4%</span><span>ROA 5.2%</span><span>流動比率 142%</span><span>当座比率 98%</span><span>固定比率 88%</span><span>自己資本比率 42%</span><span>DEレシオ 0.8</span><span>売上成長率 12%</span><span>利益成長率 8%</span><span>労働分配率 55%</span><span>損益分岐点 78%</span></div></div>`,
  principle:"情報は分類して段階的に見せる（Progressive Disclosure）",
  explain:"20個の指標を1画面に敷き詰めると、1つひとつは正しくても全体としては何も伝わりません。収益性・安全性・成長性のような分類でタブやセクションに分ければ、いま見ている数字の「文脈」が明確になります。"
},
{
  g:"レイアウトと整列", cat:"基本情報の入力欄",
  title:"入力欄の幅",
  context:"内容の長さが異なる入力欄です。分かりやすいのはどちらでしょう？",
  la:"内容に応じた幅", lb:"すべて同じ幅",
  good:`<div class="mock"><label class="ml">会社名</label><input class="mi" value="株式会社サンプル製作所" readonly><div style="height:8px"></div><label class="ml">決算期</label><div style="display:flex;gap:6px;align-items:center"><input class="mi" style="width:30%;text-align:right" value="2026" readonly><span class="ms">年</span><input class="mi" style="width:18%;text-align:right" value="3" readonly><span class="ms">月期</span></div></div>`,
  bad:`<div class="mock"><label class="ml">会社名</label><input class="mi" value="株式会社サンプル製作所" readonly><div style="height:8px"></div><label class="ml">決算期（年）</label><input class="mi" value="2026" readonly><div style="height:8px"></div><label class="ml">決算期（月）</label><input class="mi" value="3" readonly></div>`,
  principle:"欄の幅で、期待する入力の長さを予告する",
  explain:"入力欄の幅は「どのくらいの長さを入れるのか」を伝えるシグナルです。4桁の年に全幅の欄を与えると、ユーザーは何を入れるべきか一瞬戸惑います。内容に応じた幅にすることで、欄そのものが説明の役割を果たします。"
},
{
  g:"レイアウトと整列", cat:"レポートページの見出し",
  title:"見出しの階層",
  context:"ページタイトル・セクション見出し・本文の関係です。構造が伝わるのはどちらでしょう？",
  la:"サイズで階層を表現", lb:"全部同じ大きさ",
  good:`<div class="mock"><div style="font-size:17px;font-weight:700;color:#0f2a4a;margin-bottom:8px">財務分析レポート</div><div style="font-size:13px;font-weight:700;color:#2d5580;border-left:3px solid #3b6ea5;padding-left:8px;margin-bottom:4px">収益性の分析</div><div style="font-size:11px;font-weight:400;color:#4a5460">営業利益率は13.1%で、前期から2.3ポイント改善しました。</div></div>`,
  bad:`<div class="mock"><div style="font-size:13px;font-weight:700;color:#2b323d;margin-bottom:8px">財務分析レポート</div><div style="font-size:13px;font-weight:700;color:#2b323d;margin-bottom:4px">収益性の分析</div><div style="font-size:13px;font-weight:700;color:#2b323d">営業利益率は13.1%で、前期から2.3ポイント改善しました。</div></div>`,
  principle:"見出しの階層は、サイズと装飾の差で示す",
  explain:"ページタイトル・セクション見出し・本文がすべて同じサイズ・太さだと、どこからどこまでが1つの話題なのか分かりません。大→中→小のサイズ差と装飾（色・ボーダー）で階層を作ると、流し読みでも構造が伝わります。"
},
{
  g:"レイアウトと整列", cat:"画面内の複数カード",
  title:"角丸と枠線の統一",
  context:"同じ画面に並ぶカードの造形です。まとまって見えるのはどちらでしょう？",
  la:"同じ角丸・同じ枠線", lb:"角丸も影もバラバラ",
  good:`<div class="mock" style="display:flex;flex-direction:column;gap:8px;background:#f4f6f8"><div style="background:#fff;border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">売上推移</div></div><div style="background:#fff;border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">利益推移</div></div></div>`,
  bad:`<div class="mock" style="display:flex;flex-direction:column;gap:8px;background:#f4f6f8"><div style="background:#fff;border:1px solid #dde3e8;border-radius:14px;padding:10px;box-shadow:0 4px 12px rgba(0,0,0,.15)"><div class="ms">売上推移</div></div><div style="background:#fff;border:2px solid #8d97a3;border-radius:0;padding:10px"><div class="ms">利益推移</div></div></div>`,
  principle:"造形のパラメータ（角丸・枠線・影）は値を決めて使い回す",
  explain:"角丸の半径、枠線の太さ、影の強さがカードごとに違うと、同じ役割の要素なのに別物に見えてしまいます。「角丸8px・枠線1px・影は1段階」のように値を決めて全カードで使い回すのが、統一感の最短ルートです。"
},
// ---------- タイポグラフィ（8問） ----------
{
  g:"タイポグラフィ", cat:"ツール全体のフォント選定",
  title:"フォントの種類数",
  context:"1つのツールで使うフォントの数です。プロフェッショナルに見えるのはどちらでしょう？",
  la:"2書体に絞る", lb:"4書体以上を混在",
  good:`<div class="mock"><div style="font-size:14px;font-weight:700;color:#0f2a4a;margin-bottom:4px">損益分岐点分析</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-bottom:6px">固定費と変動費率から損益分岐点売上高を算出します。</div><div style="font-family:Arial;font-size:18px;font-weight:700;color:#0f2a4a">¥23,400<span style="font-size:11px">千円</span></div></div>`,
  bad:`<div class="mock"><div style="font-size:14px;font-weight:700;color:#0f2a4a;margin-bottom:4px;font-family:'Yu Mincho',serif">損益分岐点分析</div><div style="font-size:11px;font-weight:400;color:#4a5460;margin-bottom:6px;font-family:'Comic Sans MS',cursive">固定費と変動費率から損益分岐点売上高を算出します。</div><div style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#0f2a4a">¥23,400<span style="font-size:11px;font-family:'Yu Gothic'">千円</span></div></div>`,
  principle:"書体は本文用＋数字用の2つまでに絞る",
  explain:"書体が増えるほど画面は騒がしくなり、信頼感が失われます。業務ツールは「日本語用ゴシック1つ＋数字用の欧文1つ（Arial等）」で十分です。明朝・丸ゴシック・装飾書体の混在は、それぞれが違うトーンを主張してぶつかります。"
},
{
  g:"タイポグラフィ", cat:"財務数値の表",
  title:"数字の書体",
  context:"桁の多い数値が縦に並ぶ表です。桁を比較しやすいのはどちらでしょう？",
  la:"等幅の欧文数字", lb:"幅が不揃いな数字",
  good:`<div class="mock"><table class="mtbl"><tr><th>科目</th><th style="text-align:right">金額（千円）</th></tr><tr><td>売上高</td><td class="num" style="font-family:Arial">312,400</td></tr><tr><td>売上原価</td><td class="num" style="font-family:Arial">187,200</td></tr><tr><td>営業利益</td><td class="num" style="font-family:Arial">41,900</td></tr></table></div>`,
  bad:`<div class="mock"><table class="mtbl"><tr><th>科目</th><th style="text-align:right">金額（千円）</th></tr><tr><td>売上高</td><td class="num" style="font-family:Georgia,serif;font-style:italic">312,400</td></tr><tr><td>売上原価</td><td class="num" style="font-family:'Comic Sans MS',cursive">187,200</td></tr><tr><td>営業利益</td><td class="num" style="font-family:'Segoe Script',cursive">41,900</td></tr></table></div>`,
  principle:"数値には桁幅が揃う書体（欧文・等幅数字）を使う",
  explain:"数字の字幅が揃わない書体では、縦に並べたとき桁の位置がずれて比較できません。ArialやBIZ UDPGothicのような数字の幅が均一な書体（またはtabular-nums指定）を使うと、表の数値が定規で引いたように揃います。"
},
{
  g:"タイポグラフィ", cat:"指標の解説文",
  title:"本文の文字サイズ",
  context:"指標の意味を説明するテキストです。無理なく読めるのはどちらでしょう？",
  la:"14px前後を確保", lb:"9pxの極小文字",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">流動比率とは</div><div style="font-size:13px;font-weight:400;color:#4a5460;line-height:1.7">1年以内に現金化できる資産で、1年以内に支払う負債をどれだけカバーできるかを示す指標です。</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">流動比率とは</div><div style="font-size:8px;font-weight:400;color:#4a5460;line-height:1.4">1年以内に現金化できる資産で、1年以内に支払う負債をどれだけカバーできるかを示す指標です。一般に120%以上が望ましいとされ、100%を下回ると短期の支払能力に懸念があると判断されます。</div></div>`,
  principle:"本文は14px以上を基準にする（小さくして詰め込まない）",
  explain:"「スペースが足りないから文字を小さく」は最悪の解決策です。読めない説明は無いのと同じで、特に財務ツールの利用者には老眼世代の経営者も多くいます。入り切らないなら、文字を縮めるのではなく文章を削るか折りたたみます。"
},
{
  g:"タイポグラフィ", cat:"分析コメントの表示",
  title:"行間の設定",
  context:"複数行にわたる解説文です。目が疲れにくいのはどちらでしょう？",
  la:"行間1.7前後", lb:"行間1.1で密着",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.75">自己資本比率は42.5%で、中小企業の平均（約40%）を上回っています。財務基盤は比較的安定しており、金融機関からの評価も得やすい水準です。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.1">自己資本比率は42.5%で、中小企業の平均（約40%）を上回っています。財務基盤は比較的安定しており、金融機関からの評価も得やすい水準です。</div></div>`,
  principle:"日本語本文の行間は1.6〜1.8を確保する",
  explain:"日本語は文字が正方形で密度が高いため、行間が詰まると前後の行が干渉して読む速度が大きく落ちます。本文はline-height 1.6〜1.8が目安です。逆に大きな見出しは1.2〜1.4に締めると間延びしません。"
},
{
  g:"タイポグラフィ", cat:"分析サマリーの文章",
  title:"太字の使い方",
  context:"重要な数値を含む説明文です。要点が目に飛び込むのはどちらでしょう？",
  la:"要点だけを太字", lb:"全文を太字",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.7">営業利益率は<b style="color:#0f2a4a">13.1%</b>と前期から<b style="color:#0f2a4a">2.3ポイント改善</b>しました。主な要因は原価率の低下です。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:700;color:#2b323d;line-height:1.7">営業利益率は13.1%と前期から2.3ポイント改善しました。主な要因は原価率の低下です。</div></div>`,
  principle:"強調は全体の1割まで。全部強調は無強調と同じ",
  explain:"すべてが太字の文章では、どこも強調されていないのと同じです。読み手に届けたい数値や結論だけを太字にすることで、流し読みでも要点が拾える文章になります。強調は「使うほど効かなくなる資源」と考えます。"
},
{
  g:"タイポグラフィ", cat:"レポートの解説エリア",
  title:"1行の長さ",
  context:"横幅の広い画面での長文表示です。読みやすいのはどちらでしょう？",
  la:"適度な行長に制限", lb:"画面幅いっぱいまで",
  good:`<div class="mock"><div style="max-width:230px;font-size:11px;font-weight:400;color:#4a5460;line-height:1.7">損益分岐点比率は78%です。売上が22%減少しても赤字にならない体質であり、安全余裕度は十分といえます。</div></div>`,
  bad:`<div class="mock" style="max-width:320px"><div style="font-size:9px;font-weight:400;color:#4a5460;line-height:1.5;letter-spacing:.02em">損益分岐点比率は78%です。売上が22%減少しても赤字にならない体質であり、安全余裕度は十分といえます。一般に80%未満が優良とされ、90%を超えると収益構造の見直しが推奨されます。この水準を維持するには固定費の管理が重要です。</div></div>`,
  principle:"1行は全角35〜45字程度に抑える",
  explain:"1行が長すぎると、行末から次の行頭へ視線を戻すときに迷子になります。日本語の本文は1行35〜45字程度が快適です。ワイド画面では本文カラムにmax-widthを設定し、余った幅は余白として使います。"
},
{
  g:"タイポグラフィ", cat:"試算結果の金額表示",
  title:"数字と単位のサイズ",
  context:"大きく見せる結果数値の表示です。数字が主役になるのはどちらでしょう？",
  la:"単位を小さく添える", lb:"単位も同じ大きさ",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">想定される退職金原資</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:26px">8,400</span><span style="font-size:13px;color:#56626f"> 万円</span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">想定される退職金原資</div><div style="font-family:Arial,'Yu Gothic';font-weight:700;color:#0f2a4a;font-size:26px">8,400万円</div></div>`,
  principle:"数字を主役に、単位は一回り小さく添える",
  explain:"「万円」「%」などの単位を数字と同じ大きさにすると、肝心の数値の輪郭がぼやけます。単位を一回り小さくすると数字がくっきり主役になり、結果画面の説得力が上がります。金額・比率・人数など、すべての単位付き数値に適用できる原則です。"
},
{
  g:"タイポグラフィ", cat:"日本語文中の数字",
  title:"数字の表記",
  context:"文章に含まれる数値の書き方です。すっきり読めるのはどちらでしょう？",
  la:"半角の欧文数字", lb:"全角数字が混在",
  good:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.7">従業員数30名、設立15年の製造業。直近3期の平均売上成長率は12.4%です。</div></div>`,
  bad:`<div class="mock"><div style="font-size:12px;font-weight:400;color:#4a5460;line-height:1.7">従業員数３０名、設立１５年の製造業。直近3期の平均売上成長率は１２.４%です。</div></div>`,
  principle:"数字は半角に統一する（全角数字を混ぜない）",
  explain:"全角数字は文字幅が広く間延びして見えるうえ、半角と混在すると同じ数字でも違う見た目になり、雑な印象を与えます。UIで扱う数値はすべて半角＋欧文フォントに統一します。入力側で全角が来てもシステム側で半角に正規化します。"
},
// ---------- 色の設計（10問） ----------
{
  g:"色の設計", cat:"ツール全体の配色計画",
  title:"配色の基本構成",
  context:"ツール全体で使う色の構成です。落ち着いて信頼できる画面になるのはどちらでしょう？",
  la:"ベース＋アクセント1色", lb:"7色のカラフル構成",
  good:`<div class="mock"><div style="background:#0f2a4a;color:#fff;border-radius:6px 6px 0 0;margin:-14px -14px 10px;padding:8px 12px;font-size:12px;font-weight:700">財務分析ツール</div><div class="ms" style="margin-bottom:6px">グレー背景 ＋ ネイビー基調</div><span class="mb mb-p" style="padding:6px 14px;font-size:12px">試算する</span> <span class="mb mb-plain" style="padding:6px 14px;font-size:12px">クリア</span></div>`,
  bad:`<div class="mock"><div style="background:linear-gradient(90deg,#e91e63,#ff9800);color:#fff;border-radius:6px 6px 0 0;margin:-14px -14px 10px;padding:8px 12px;font-size:12px;font-weight:700">財務分析ツール</div><div class="ms" style="margin-bottom:6px">画面ごとに違うテーマカラー</div><span class="mb" style="background:#4caf50;color:#fff;padding:6px 14px;font-size:12px">試算する</span> <span class="mb" style="background:#9c27b0;color:#fff;padding:6px 14px;font-size:12px">クリア</span></div>`,
  principle:"ベースカラー1色＋アクセント1色＋無彩色で構成する",
  explain:"配色の基本は「ベースカラー（ブランドの軸となる色）＋アクセントカラー（行動を促す色）＋グレースケール」の3層構成です。使う色が増えるほど各色の意味が薄まり、業務ツールに必要な信頼感が失われます。迷ったら色を足すのではなく減らします。"
},
{
  g:"色の設計", cat:"画面内のアクセントカラー",
  title:"アクセントカラーの使いどころ",
  context:"アクセントカラー(青)をどこに使うかです。主役が明確なのはどちらでしょう？",
  la:"主ボタンと要点だけ", lb:"見出しも枠も全部青",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">自社株評価の試算</div><div class="ms" style="margin-bottom:8px">3つの方式で株価を算定します</div><span class="mb mb-p mb-block">試算する</span></div>`,
  bad:`<div class="mock" style="border:2px solid #3b6ea5"><div class="mtitle" style="margin-bottom:4px;color:#3b6ea5">自社株評価の試算</div><div style="font-size:11px;color:#3b6ea5;margin-bottom:8px">3つの方式で株価を算定します</div><span class="mb mb-p mb-block" style="box-shadow:0 0 0 3px #a8c4e0">試算する</span></div>`,
  principle:"アクセントカラーは『次に取るべき行動』へ誘導する色",
  explain:"アクセントカラーの仕事は「ここを押せばいい」を一瞬で伝えることです。見出し・枠線・本文にまで同じ色を使うと、肝心のボタンが背景に溶けてしまいます。画面あたりのアクセント使用は1〜2箇所に絞るのが原則です。"
},
{
  g:"色の設計", cat:"警告色の運用",
  title:"意味を持つ色の予約",
  context:"赤色の使い方です。本当の警告が伝わるのはどちらでしょう？",
  la:"赤は警告・マイナス専用", lb:"装飾にも赤を多用",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">安全性の指標</div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>流動比率</span><span style="font-family:Arial">142.3%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#a83d3d"><span>当座比率 ⚠</span><span style="font-family:Arial">68.1%</span></div><div class="ms" style="margin-top:4px">基準を下回る項目のみ赤で表示</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px;color:#a83d3d">安全性の指標</div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;color:#a83d3d"><span>流動比率</span><span style="font-family:Arial">142.3%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;color:#a83d3d"><span>当座比率</span><span style="font-family:Arial">68.1%</span></div><div class="ms" style="margin-top:4px;color:#a83d3d">※見出しも本文も装飾も赤</div></div>`,
  principle:"意味色（赤=警告等）は、その意味以外に使わない",
  explain:"赤を見出しや装飾に使ってしまうと、本当に危険な数値が出たときに埋もれて伝わりません。特に財務の世界では「赤字」の連想が強いため、赤=マイナス・警告に厳密に予約します。装飾に使える暖色が欲しければ、赤と区別できる別の色を定義します。"
},
{
  g:"色の設計", cat:"損益計算の結果表示",
  title:"マイナス値の表現",
  context:"赤字（マイナス）になった数値の表示です。ひと目で伝わるのはどちらでしょう？",
  la:"赤色＋△記号", lb:"黒のまま",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:400"><span>営業利益</span><span style="font-family:Arial;font-weight:700">4,200</span></div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:400"><span>経常利益</span><span style="font-family:Arial;font-weight:700;color:#a83d3d">△1,850</span></div><div class="ms" style="margin-top:4px">単位：万円</div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:400"><span>営業利益</span><span style="font-family:Arial;font-weight:700">4,200</span></div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:400"><span>経常利益</span><span style="font-family:Arial;font-weight:700">-1850</span></div><div class="ms" style="margin-top:4px">単位：万円</div></div>`,
  principle:"マイナスは色と記号の両方で示す（財務の慣習に合わせる）",
  explain:"財務資料ではマイナスを赤字＋△で表すのが慣習です。黒のままハイフンだけだと、桁区切りのない「-1850」は見落とされやすく、赤字の重大さも伝わりません。ツールのデータ表現は、利用者が普段見ている決算書の流儀に合わせます。"
},
{
  g:"色の設計", cat:"入力セクションの背景",
  title:"背景色と文字の関係",
  context:"セクションを区別するための背景色です。文字がストレスなく読めるのはどちらでしょう？",
  la:"淡い背景＋濃い文字", lb:"中間色の背景に灰色文字",
  good:`<div class="mock" style="background:#eef1f4"><div class="mtitle" style="margin-bottom:4px;color:#0f2a4a">前提条件の入力</div><div style="font-size:12px;font-weight:400;color:#2b323d">直近の決算書の数値をもとに入力してください。</div></div>`,
  bad:`<div class="mock" style="background:#7d94ac"><div class="mtitle" style="margin-bottom:4px;color:#5a6b7d">前提条件の入力</div><div style="font-size:12px;font-weight:400;color:#94a5b5">直近の決算書の数値をもとに入力してください。</div></div>`,
  principle:"背景に色を使うなら、ごく淡く（文字とのコントラストを確保）",
  explain:"セクション分けの背景色は「白より一段だけ濃い」程度に抑えるのが原則です。中間の明度の背景は、濃い文字とも白い文字とも十分なコントラストが取れない帯域で、載せる文字の選択肢がなくなります。"
},
{
  g:"色の設計", cat:"売上と利益の推移グラフ",
  title:"グラフの系列色",
  context:"2系列の折れ線グラフです。どちらの線が何か判別できるのはどちらでしょう？",
  la:"区別できる2色＋凡例", lb:"よく似た色で凡例なし",
  good:`<div class="mock"><div style="display:flex;gap:10px;font-size:10px;margin-bottom:6px"><span><span style="display:inline-block;width:14px;height:3px;background:#0f2a4a;vertical-align:middle;margin-right:3px"></span>売上高</span><span><span style="display:inline-block;width:14px;height:3px;background:#5c8272;vertical-align:middle;margin-right:3px"></span>営業利益</span></div><svg viewBox="0 0 200 60" style="width:100%"><polyline points="0,40 50,32 100,25 150,18 200,10" fill="none" stroke="#0f2a4a" stroke-width="3"/><polyline points="0,52 50,50 100,44 150,42 200,36" fill="none" stroke="#5c8272" stroke-width="3"/></svg></div>`,
  bad:`<div class="mock"><svg viewBox="0 0 200 60" style="width:100%"><polyline points="0,40 50,32 100,25 150,18 200,10" fill="none" stroke="#4a79ab" stroke-width="3"/><polyline points="0,52 50,50 100,44 150,42 200,36" fill="none" stroke="#5c86b5" stroke-width="3"/></svg><div class="ms" style="margin-top:4px">※2本の線がほぼ同じ青、凡例なし</div></div>`,
  principle:"グラフの系列は、明確に区別できる色＋凡例をセットで",
  explain:"よく似た色の線が2本並んだグラフは、どちらが売上でどちらが利益か推測するしかありません。系列の色は色相か明度を大きく変え、凡例（またはライン端の直接ラベル）を必ず添えます。系列が多い場合は3〜4本までに絞るのも重要です。"
},
{
  g:"色の設計", cat:"前期比の増減表示",
  title:"色だけに頼らない表現",
  context:"指標の増減を示す表現です。色の見え方に関わらず伝わるのはどちらでしょう？",
  la:"色＋矢印・記号", lb:"色のみで区別",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>売上高</span><span style="font-family:Arial;font-weight:700;color:#456155">▲ +12.3%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>経常利益</span><span style="font-family:Arial;font-weight:700;color:#a83d3d">▼ −5.2%</span></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>売上高</span><span style="font-family:Arial;font-weight:700;color:#456155">12.3%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>経常利益</span><span style="font-family:Arial;font-weight:700;color:#a83d3d">5.2%</span></div><div class="ms" style="margin-top:4px">※増減は色だけで表現</div></div>`,
  principle:"状態は色＋形（記号・アイコン）の二重符号化で伝える",
  explain:"日本人男性の約20人に1人は赤と緑の区別がつきにくいと言われます。増減を色だけで表すと、その人たちには+12.3%と−5.2%が同じに見えます。矢印や＋−記号を添える「二重符号化」で、誰にでも・モノクロ印刷でも伝わる表現になります。"
},
{
  g:"色の設計", cat:"ボタンのホバー状態",
  title:"状態変化の色",
  context:"ボタンにカーソルを載せたときの色変化です。自然に感じるのはどちらでしょう？",
  la:"同系色の濃淡で変化", lb:"別系統の色に変わる",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">通常 → ホバー時</div><span class="mb mb-p" style="padding:8px 18px">試算する</span> <span class="mb" style="padding:8px 18px;background:#1c3f68;color:#fff">試算する</span></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">通常 → ホバー時</div><span class="mb mb-p" style="padding:8px 18px">試算する</span> <span class="mb" style="padding:8px 18px;background:#9c27b0;color:#fff">試算する</span></div>`,
  principle:"ホバー・押下は同系色の明度変化で表現する",
  explain:"ホバーで別系統の色（青→紫）に変わると、ユーザーは「何か別の状態になったのか？」と戸惑います。同じ色相のまま少し暗く（または明るく）するのが、押せることを伝えつつ驚かせない王道です。ベースカラーの濃淡バリエーションを最初に定義しておくと迷いません。"
},
{
  g:"色の設計", cat:"ヒーロー帯の白文字",
  title:"白文字を載せる背景",
  context:"ページ上部の帯に白文字でタイトルを載せます。読めるのはどちらでしょう？",
  la:"濃いネイビー地に白", lb:"薄い水色地に白",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#091a30,#1c3f68);padding:14px;color:#fff"><div style="font-size:10px;letter-spacing:.15em;opacity:.7">FINANCIAL ANALYSIS</div><div style="font-size:15px;font-weight:700">財務分析ダッシュボード</div></div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="background:#b8d4ea;padding:14px;color:#fff"><div style="font-size:10px;letter-spacing:.15em;opacity:.9">FINANCIAL ANALYSIS</div><div style="font-size:15px;font-weight:700">財務分析ダッシュボード</div></div></div>`,
  principle:"白文字はコントラスト比4.5:1以上の濃い背景に載せる",
  explain:"薄い色の背景に白文字は、デザインカンプでは「爽やか」に見えても実際にはほぼ読めません。白文字を使うなら背景は十分に濃い色（コントラスト比4.5:1以上）が必須です。淡い背景を使いたい場合は文字を濃色にします。"
},
{
  g:"色の設計", cat:"指標の評価表示",
  title:"ステータス色の体系",
  context:"各指標の良し悪しを色で示します。直感的に把握できるのはどちらでしょう？",
  la:"3段階に整理＋凡例", lb:"5色以上で基準が不明",
  good:`<div class="mock"><div style="display:flex;gap:8px;font-size:10px;margin-bottom:8px"><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#5c8272;margin-right:3px"></span>良好</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#c9a227;margin-right:3px"></span>注意</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a83d3d;margin-right:3px"></span>要改善</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>● 自己資本比率</span><span style="color:#456155;font-weight:700">良好</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>● 当座比率</span><span style="color:#a83d3d;font-weight:700">要改善</span></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span style="color:#9c27b0">● 自己資本比率</span><span>42.5%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span style="color:#00bcd4">● 流動比率</span><span>142.3%</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span style="color:#ff9800">● 当座比率</span><span>68.1%</span></div><div class="ms" style="margin-top:4px">※色の意味の説明なし</div></div>`,
  principle:"状態を表す色は3段階程度に整理し、凡例を添える",
  explain:"信号機のように「良好・注意・要改善」の3段階なら、凡例を一度見れば全画面で通用します。5色も6色も使うと利用者は色の意味を覚えられず、せっかくの色分けがただの飾りになります。段階の基準値も凡例やツールチップで開示すると信頼性が増します。"
},
// ---------- 一貫性とガイドライン（10問） ----------
{
  g:"一貫性とガイドライン", cat:"複数ページのヘッダー",
  title:"ヘッダー操作ボタンの共通化",
  context:"ツール内の各ページ上部にある操作ボタン群です。迷わず使えるのはどちらでしょう？",
  la:"全ページ同じ配置", lb:"ページごとに配置が違う",
  good:`<div class="mock" style="padding:10px"><div class="ms" style="margin-bottom:4px">ページA（自社株評価）</div><div style="display:flex;justify-content:flex-end;gap:4px;background:#0f2a4a;border-radius:6px;padding:6px"><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">保存</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">PDF</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">クリア</span></div><div class="ms" style="margin:8px 0 4px">ページB（退職金試算）</div><div style="display:flex;justify-content:flex-end;gap:4px;background:#0f2a4a;border-radius:6px;padding:6px"><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">保存</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">PDF</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">クリア</span></div></div>`,
  bad:`<div class="mock" style="padding:10px"><div class="ms" style="margin-bottom:4px">ページA（自社株評価）</div><div style="display:flex;justify-content:flex-end;gap:4px;background:#0f2a4a;border-radius:6px;padding:6px"><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">保存</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">PDF</span></div><div class="ms" style="margin:8px 0 4px">ページB（退職金試算）</div><div style="display:flex;justify-content:space-between;gap:4px;background:#0f2a4a;border-radius:6px;padding:6px"><span style="background:#fff;color:#0f2a4a;border-radius:9999px;padding:2px 10px;font-size:10px">出力</span><span style="border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:2px 8px;font-size:10px">データ保存</span></div></div>`,
  principle:"共通機能は全ページで同じ位置・同じ見た目・同じ並び順に",
  explain:"保存・PDF・クリアのような共通機能は、全ページで位置も並び順も見た目も揃えます。ページごとに配置が変わると、ユーザーは毎回ボタンを探し直すことになり、「同じツール」という感覚も壊れます。一度学べばどのページでも通用する、が一貫性の価値です。"
},
{
  g:"一貫性とガイドライン", cat:"各ツールの実行ボタン",
  title:"ボタン文言の統一",
  context:"複数のツールにある計算実行ボタンです。学習が効くのはどちらでしょう？",
  la:"「試算する」で統一", lb:"ページごとに違う文言",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">自社株評価 ／ 退職金 ／ 将来負債</div><div style="display:flex;gap:6px"><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">試算する</span><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">試算する</span><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">試算する</span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">自社株評価 ／ 退職金 ／ 将来負債</div><div style="display:flex;gap:6px"><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">計算</span><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">実行する</span><span class="mb mb-p" style="flex:1;font-size:11px;padding:8px 4px">分析スタート！</span></div></div>`,
  principle:"同じ機能には同じ言葉を使う（用語の一貫性）",
  explain:"「計算」「実行」「分析スタート」が混在すると、ユーザーは機能が違うのかと勘ぐります。同じ機能には同じ動詞を割り当て、ツール全体の語彙表として管理します。文言が統一されているだけで、ツール群の完成度は一段上に見えます。"
},
{
  g:"一貫性とガイドライン", cat:"2つのページのPDF出力",
  title:"同じ機能は同じ見た目",
  context:"どちらのページにもあるPDF出力機能です。機能を見つけやすいのはどちらでしょう？",
  la:"同じスタイルのボタン", lb:"片方はボタン、片方はリンク",
  good:`<div class="mock"><div class="ms" style="margin-bottom:4px">結果ページA</div><span class="mb mb-g" style="padding:6px 14px;font-size:11px">📄 PDF出力</span><div class="ms" style="margin:10px 0 4px">結果ページB</div><span class="mb mb-g" style="padding:6px 14px;font-size:11px">📄 PDF出力</span></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:4px">結果ページA</div><span class="mb mb-g" style="padding:6px 14px;font-size:11px">📄 PDF出力</span><div class="ms" style="margin:10px 0 4px">結果ページB</div><span style="font-size:11px;color:#3b6ea5;text-decoration:underline">印刷用ファイルのダウンロードはこちらから</span></div>`,
  principle:"同一機能は同一コンポーネントで提供する",
  explain:"ページAではボタン、ページBではテキストリンク…と表現が変わると、ユーザーの「PDFはこのボタン」という学習が無駄になります。機能とコンポーネント（見た目）を1対1で対応させることが、ツール全体の操作学習コストを最小にします。"
},
{
  g:"一貫性とガイドライン", cat:"画面内の項目名",
  title:"用語の統一",
  context:"同じ数値を指す項目名の表記です。混乱しないのはどちらでしょう？",
  la:"「売上高」で統一", lb:"表記ゆれが混在",
  good:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="312,400" readonly style="text-align:right"><div style="height:8px"></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>売上高（前期）</span><span style="font-family:Arial">289,100</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>売上高成長率</span><span style="font-family:Arial">+8.1%</span></div></div>`,
  bad:`<div class="mock"><label class="ml">売上</label><input class="mi" value="312,400" readonly style="text-align:right"><div style="height:8px"></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>売上高（前期）</span><span style="font-family:Arial">289,100</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>セールス成長率</span><span style="font-family:Arial">+8.1%</span></div></div>`,
  principle:"1つの概念に1つの用語（表記ゆれを作らない）",
  explain:"「売上」「売上高」「セールス」が混在すると、ユーザーは別の数値なのか同じなのか確認を強いられます。特に財務用語は正式な勘定科目名に合わせて統一し、用語集を作って画面・帳票・ヘルプ全体で同じ言葉を使います。"
},
{
  g:"一貫性とガイドライン", cat:"操作ツールバーのアイコン",
  title:"アイコンスタイルの統一",
  context:"ツールバーに並ぶアイコンのテイストです。プロダクトとして整うのはどちらでしょう？",
  la:"線画で統一", lb:"絵文字と線画が混在",
  good:`<div class="mock" style="display:flex;gap:8px;justify-content:center"><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#56626f" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>保存</span><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#56626f" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>印刷</span><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#56626f" stroke-width="2"><path d="M3 6h18M8 6V4h8v2m1 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6"/></svg>クリア</span></div>`,
  bad:`<div class="mock" style="display:flex;gap:8px;justify-content:center"><span class="micon"><span class="ic">💾</span>保存</span><span class="micon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#56626f" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>印刷</span><span class="micon"><span class="ic" style="color:#e91e63">🗑️</span>クリア</span></div>`,
  principle:"アイコンは1つのスタイルセット（線画/塗り）から選ぶ",
  explain:"絵文字・線画・塗りつぶしのアイコンが混在すると、統一されたプロダクトではなく寄せ集めに見えます。1つのアイコンセット（例：線画・線幅2px）を決め、全画面でそこからだけ選びます。絵文字はOSにより見た目が変わる点でも業務ツールには不向きです。"
},
{
  g:"一貫性とガイドライン", cat:"日付と金額の表記",
  title:"フォーマットの統一",
  context:"画面内の日付・金額の書式です。信頼できるのはどちらでしょう？",
  la:"形式を統一", lb:"画面ごとに形式が違う",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>試算日</span><span style="font-family:Arial">2026/08/12</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>前回保存</span><span style="font-family:Arial">2026/08/10</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>評価額</span><span style="font-family:Arial">128,400千円</span></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>試算日</span><span style="font-family:Arial">2026-08-12</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400;margin-bottom:4px"><span>前回保存</span><span style="font-family:Arial">R8.8.10</span></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:400"><span>評価額</span><span style="font-family:Arial">1.284億円</span></div></div>`,
  principle:"日付・金額・単位の書式ルールを1つ決めて全画面に適用する",
  explain:"「2026/08/12」「R8.8.10」「2026-08-12」が同居していると、細部の詰めの甘さが伝わり、数値そのものへの信頼まで揺らぎます。日付形式・金額の単位（千円/万円）・小数桁数は最初にルールを決め、全画面・全帳票で機械的に適用します。"
},
{
  g:"一貫性とガイドライン", cat:"開発の進め方",
  title:"デザインガイドラインの整備",
  context:"複数ページのツールを作るときの進め方です。品質が安定するのはどちらでしょう？",
  la:"先にルールを定義", lb:"画面ごとに都度判断",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">デザインガイドライン</div><div style="display:flex;gap:4px;margin-bottom:6px"><span style="width:20px;height:20px;border-radius:4px;background:#0f2a4a"></span><span style="width:20px;height:20px;border-radius:4px;background:#3b6ea5"></span><span style="width:20px;height:20px;border-radius:4px;background:#a83d3d"></span><span style="width:20px;height:20px;border-radius:4px;background:#eef1f4;border:1px solid #dde3e8"></span></div><div style="font-size:10px;font-weight:400;color:#4a5460;line-height:1.7">・ボタン：ネイビー／角丸6px<br>・本文：13px／行間1.7<br>・金額：Arial右揃え・千円単位</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">ページごとにその場で決めた結果…</div><div style="display:flex;flex-direction:column;gap:5px"><span class="mb" style="background:#0f2a4a;color:#fff;border-radius:4px;padding:5px;font-size:11px">試算する</span><span class="mb" style="background:#2e7d32;color:#fff;border-radius:9999px;padding:5px;font-size:12px">計算スタート</span><span class="mb" style="background:linear-gradient(90deg,#e91e63,#ff9800);color:#fff;border-radius:0;padding:6px;font-size:10px">GO!</span></div></div>`,
  principle:"色・文字・部品のルールを文書化してから量産する",
  explain:"ページを作るたびにその場で色やボタンを決めると、悪意がなくても必ずバラバラになります。最初に「使う色・フォント・ボタン・余白」のガイドラインを定義し、以降は選ぶだけにするのが、複数ページ・複数人開発で品質を保つ唯一の方法です。"
},
{
  g:"一貫性とガイドライン", cat:"エラーメッセージの文体",
  title:"メッセージのトーン統一",
  context:"ツール内の各所に出るメッセージの文体です。安心して使えるのはどちらでしょう？",
  la:"敬体で統一", lb:"トーンがバラバラ",
  good:`<div class="mock"><div class="merr" style="margin-bottom:6px">売上高を入力してください</div><div class="merr" style="margin-bottom:6px">決算月は1〜12の範囲で入力してください</div><div class="mok">保存が完了しました</div></div>`,
  bad:`<div class="mock"><div class="merr" style="margin-bottom:6px">エラー！！</div><div class="merr" style="margin-bottom:6px">Invalid input value (code: E402)</div><div class="mok">セーブ完了っす🎉</div></div>`,
  principle:"文体・トーンのルールもデザインガイドラインの一部",
  explain:"「エラー！！」「Invalid input」「完了っす🎉」が同居するツールは、それだけで信頼を失います。メッセージは「です・ます調」「原因＋対処を書く」「感嘆符・専門コードは使わない」のようにトーンを規定します。UIの言葉はデザインの一部です。"
},
{
  g:"一貫性とガイドライン", cat:"新ページの追加",
  title:"コンポーネントの再利用",
  context:"新しい分析ページを追加するときの作り方です。ツール全体の質を保てるのはどちらでしょう？",
  la:"既存の部品を再利用", lb:"新ページだけ独自デザイン",
  good:`<div class="mock"><div class="ms" style="margin-bottom:4px">既存ページと同じカード様式で追加</div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;margin-bottom:6px"><div class="ms">既存：自社株評価</div><span class="mb mb-p" style="padding:4px 12px;font-size:10px">試算する</span></div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px"><div class="ms">新規：キャッシュフロー分析</div><span class="mb mb-p" style="padding:4px 12px;font-size:10px">試算する</span></div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:4px">新ページだけ雰囲気が違う</div><div style="border:1px solid #dde3e8;border-radius:8px;padding:8px;margin-bottom:6px"><div class="ms">既存：自社株評価</div><span class="mb mb-p" style="padding:4px 12px;font-size:10px">試算する</span></div><div style="background:#1a1a2e;border-radius:16px;padding:10px;color:#0ff"><div style="font-size:10px;opacity:.8">新規：キャッシュフロー分析</div><span style="display:inline-block;border:1px solid #0ff;border-radius:9999px;padding:4px 12px;font-size:10px">ANALYZE ▶</span></div></div>`,
  principle:"新機能は既存のデザイン言語の中で作る",
  explain:"新しいページを「今風に」独自デザインで作ると、そのページだけ別サービスのようになり、既存ページまで古く見え始めます。機能を追加するときは既存のカード・ボタン・配色をそのまま再利用します。デザインを刷新したいなら、全ページ一括で行います。"
},
{
  g:"一貫性とガイドライン", cat:"ステップ操作のボタン位置",
  title:"操作ボタンの定位置",
  context:"複数ステップの操作画面です。テンポよく進められるのはどちらでしょう？",
  la:"全ステップ同じ位置", lb:"ステップごとに位置が変わる",
  good:`<div class="mock"><div class="ms" style="margin-bottom:4px">STEP 1 → STEP 2</div><div style="border:1px solid #eef1f4;border-radius:6px;padding:8px;margin-bottom:6px"><div style="display:flex;justify-content:space-between"><span class="mb mb-plain" style="padding:4px 10px;font-size:10px">← 戻る</span><span class="mb mb-p" style="padding:4px 10px;font-size:10px">次へ →</span></div></div><div style="border:1px solid #eef1f4;border-radius:6px;padding:8px"><div style="display:flex;justify-content:space-between"><span class="mb mb-plain" style="padding:4px 10px;font-size:10px">← 戻る</span><span class="mb mb-p" style="padding:4px 10px;font-size:10px">次へ →</span></div></div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:4px">STEP 1 → STEP 2</div><div style="border:1px solid #eef1f4;border-radius:6px;padding:8px;margin-bottom:6px"><div style="display:flex;justify-content:space-between"><span class="mb mb-plain" style="padding:4px 10px;font-size:10px">← 戻る</span><span class="mb mb-p" style="padding:4px 10px;font-size:10px">次へ →</span></div></div><div style="border:1px solid #eef1f4;border-radius:6px;padding:8px"><div style="display:flex;justify-content:flex-start;gap:6px"><span class="mb mb-p" style="padding:4px 10px;font-size:10px">次へ →</span><span class="mb mb-plain" style="padding:4px 10px;font-size:10px">← 戻る</span></div></div></div>`,
  principle:"繰り返す操作のボタンは、画面が変わっても動かさない",
  explain:"ステップを進むたびに「次へ」の位置が変わると、ユーザーは毎回ボタンを探し、誤クリックも起きます。連続操作のボタンは全ステップで固定位置に置くことで、2回目以降は視線を落とさず手だけで進められるようになります。"
},
// ---------- フォームと入力（10問） ----------
{
  g:"フォームと入力", cat:"金額入力の単位設計",
  title:"大きな金額の入力単位",
  context:"売上3億円を入力してもらう場面です。桁の間違いが起きにくいのはどちらでしょう？",
  la:"万円単位＋換算表示", lb:"円単位でゼロを12個",
  good:`<div class="mock"><label class="ml">売上高</label><div class="msuffix"><input class="mi" value="30,000" readonly><span class="sfx">万円</span></div><div class="mok" style="color:#2d5580">= 3<span style="font-size:9px">億円</span></div></div>`,
  bad:`<div class="mock"><label class="ml">売上高（円）</label><input class="mi" value="300000000" readonly><div class="ms" style="margin-top:4px">※ゼロを数えて入力してください</div></div>`,
  principle:"入力単位は利用者が普段使う桁感覚に合わせる",
  explain:"中小企業の経営数値は「万円」で会話されるのが普通です。円単位でゼロを9個も打たせると、1桁間違いが頻発し、しかも見た目では気づけません。万円単位で受け付けて「= 3億円」と換算を添えれば、入力も確認も一瞬です。"
},
{
  g:"フォームと入力", cat:"決算書からの転記",
  title:"入力欄の並び順",
  context:"決算書を見ながら数値を転記してもらいます。作業が速いのはどちらでしょう？",
  la:"決算書と同じ並び", lb:"五十音順に並べる",
  good:`<div class="mock"><div class="ms" style="margin-bottom:6px">損益計算書の並び順で入力</div><label class="ml">売上高</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">売上原価</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">販売費及び一般管理費</label><input class="mi" readonly></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:6px">五十音順で入力</div><label class="ml">売上原価</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">売上高</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">販売費及び一般管理費</label><input class="mi" readonly></div>`,
  principle:"入力順は、参照する資料の並び順に合わせる",
  explain:"ユーザーは決算書を上から順に目で追いながら転記します。入力欄が決算書と同じ並びなら視線の往復が最小になり、転記ミスも減ります。システム側の都合（五十音順・DB順）をそのまま画面に出さないことが大切です。"
},
{
  g:"フォームと入力", cat:"2期目以降の利用",
  title:"前期データの引き継ぎ",
  context:"昨年も使ったユーザーが今年の分析を始めます。親切なのはどちらでしょう？",
  la:"前期データをコピー", lb:"毎回ゼロから入力",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">2026年3月期の分析を開始</div><span class="mb mb-g mb-block" style="margin-bottom:6px">前期（2025年3月期）の入力をコピーして開始</span><span class="mb mb-plain mb-block">白紙から入力する</span></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">2026年3月期の分析を開始</div><label class="ml">売上高</label><input class="mi" placeholder="入力例：30,000" readonly><div class="ms" style="margin-top:6px">※前期のデータは引き継がれません。すべて再入力してください</div></div>`,
  principle:"既にあるデータを、もう一度入力させない",
  explain:"会社名・決算月・前期数値など、システムが既に知っている情報を再入力させるのは時間の無駄であり、前年との入力ゆれの原因にもなります。「前期をコピーして修正」方式なら、2年目以降の利用コストが激減し、継続利用の動機になります。"
},
{
  g:"フォームと入力", cat:"未入力の金額欄",
  title:"入力例の提示",
  context:"まだ何も入力されていない金額欄です。入力への抵抗が少ないのはどちらでしょう？",
  la:"入力例を薄く表示", lb:"何の手がかりもない空欄",
  good:`<div class="mock"><label class="ml">年間保険料</label><div class="msuffix"><input class="mi" placeholder="入力例：3,000" readonly><span class="sfx">万円</span></div></div>`,
  bad:`<div class="mock"><label class="ml">年間保険料</label><input class="mi" readonly></div>`,
  principle:"プレースホルダーで規模感と書式の手本を見せる",
  explain:"「入力例：3,000」という薄い表示があるだけで、単位の桁感覚（3,000万円なのか3,000円なのか）とカンマ書式の手本が伝わります。ラベルの代わりにするのはNGですが、入力例の提示としてのプレースホルダーは強力な補助になります。"
},
{
  g:"フォームと入力", cat:"入力欄と計算欄の混在",
  title:"自動計算欄の区別",
  context:"入力する欄と自動計算される欄が並んでいます。操作に迷わないのはどちらでしょう？",
  la:"計算欄をグレーで区別", lb:"どちらも同じ見た目",
  good:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:6px"></div><label class="ml">売上原価</label><input class="mi" value="18,000" readonly style="text-align:right"><div style="height:6px"></div><label class="ml">売上総利益（自動計算）</label><input class="mi" value="12,000" readonly style="text-align:right;background:#eef1f4;color:#56626f;border-style:dashed"></div>`,
  bad:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:6px"></div><label class="ml">売上原価</label><input class="mi" value="18,000" readonly style="text-align:right"><div style="height:6px"></div><label class="ml">売上総利益</label><input class="mi" value="12,000" readonly style="text-align:right"></div>`,
  principle:"編集できる欄とできない欄を、見た目で区別する",
  explain:"自動計算の欄が入力欄と同じ見た目だと、ユーザーはそこに値を入れようとして「入力できない！」と混乱します。読み取り専用の欄はグレー背景＋「自動計算」の明記で、触る場所ではないことを伝えます。"
},
{
  g:"フォームと入力", cat:"試算実行時の未入力チェック",
  title:"未入力エラーの表現",
  context:"必須項目が2つ未入力のまま実行されました。次の行動が明確なのはどちらでしょう？",
  la:"「あと2項目」＋該当欄を示す", lb:"「エラーが発生しました」",
  good:`<div class="mock"><div style="background:#f6e9e9;border-radius:6px;padding:8px 10px;font-size:12px;color:#a83d3d;font-weight:700;margin-bottom:8px">あと2項目の入力が必要です</div><label class="ml">売上高</label><input class="mi mi-err" placeholder="入力例：30,000" readonly><div style="height:6px"></div><label class="ml">総資産</label><input class="mi mi-err" placeholder="入力例：25,000" readonly></div>`,
  bad:`<div class="mock"><div style="background:#f6e9e9;border-radius:6px;padding:8px 10px;font-size:12px;color:#a83d3d;font-weight:700;margin-bottom:8px">エラーが発生しました</div><label class="ml">売上高</label><input class="mi" placeholder="入力例：30,000" readonly><div style="height:6px"></div><label class="ml">総資産</label><input class="mi" placeholder="入力例：25,000" readonly></div>`,
  principle:"残り件数＋該当箇所のハイライトで完了までを導く",
  explain:"「あと2項目」という表現は、エラーの指摘ではなく完了までの距離の案内です。該当欄を薄い赤でハイライトすれば、どこを埋めればいいか一目瞭然。なお自動計算欄（readonly）は未入力件数に数えない・赤枠にしないことも重要です。"
},
{
  g:"フォームと入力", cat:"数値変更時の再計算",
  title:"再計算のタイミング",
  context:"入力値を変えると結果が更新されるツールです。落ち着いて入力できるのはどちらでしょう？",
  la:"入力確定時に再計算", lb:"1文字ごとに再計算",
  good:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div class="ms" style="margin:4px 0 8px">欄を離れたときに再計算されます</div><div style="background:#eef1f4;border-radius:6px;padding:8px;text-align:center"><span class="ms">営業利益率</span> <b style="font-family:Arial;color:#0f2a4a">13.1%</b></div></div>`,
  bad:`<div class="mock"><label class="ml">売上高</label><input class="mi" value="3" readonly style="text-align:right"><div class="ms" style="margin:4px 0 8px">※1文字打つたびに全体が再計算</div><div style="background:#f6e9e9;border-radius:6px;padding:8px;text-align:center"><span class="ms">営業利益率</span> <b style="font-family:Arial;color:#a83d3d">140,000%</b></div></div>`,
  principle:"再計算は入力の確定時（change）に行う",
  explain:"キー入力のたびに再計算すると、「3」と打った瞬間に利益率140,000%のような無意味な数字が点滅し、画面がガタガタ動いて入力の邪魔になります。再計算は欄からフォーカスが外れた確定時に走らせるのが、数値入力ツールの定石です。"
},
{
  g:"フォームと入力", cat:"60項目の詳細分析",
  title:"多項目入力の分割",
  context:"詳細分析には60項目の入力が必要です。完走してもらえるのはどちらでしょう？",
  la:"ステップ分割＋進捗", lb:"1ページに60項目",
  good:`<div class="mock"><div class="msteps"><div class="mstep on">✓</div><div class="msline"></div><div class="mstep on">2</div><div class="msline"></div><div class="mstep">3</div></div><div class="mtitle" style="margin-bottom:2px">貸借対照表の入力（2/3）</div><div class="ms" style="margin-bottom:8px">このステップは12項目です</div><label class="ml">現金及び預金</label><input class="mi" readonly></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">財務データ入力（全60項目）</div><div style="max-height:90px;overflow:hidden"><label class="ml">売上高</label><input class="mi" readonly style="margin-bottom:4px"><label class="ml">売上原価</label><input class="mi" readonly style="margin-bottom:4px"><label class="ml">販管費</label><input class="mi" readonly></div><div class="ms" style="text-align:center">…（延々と60項目続く）</div></div>`,
  principle:"長い入力は意味のある単位に分割し、進捗を見せる",
  explain:"60項目が1ページに並んでいるのを見た瞬間、多くのユーザーは戦意を失います。PL・BS・その他のような意味のある単位に分割し、ステップ表示で「いまどこ・あとどれだけ」を見せることで、心理的負担が大幅に下がります。途中保存とセットならさらに安心です。"
},
{
  g:"フォームと入力", cat:"比率の入力欄",
  title:"パーセントの入力形式",
  context:"変動費率65%を入力してもらう場面です。間違いが起きにくいのはどちらでしょう？",
  la:"65 ＋「%」固定表示", lb:"0.65と小数で入力",
  good:`<div class="mock"><label class="ml">変動費率</label><div class="msuffix"><input class="mi" value="65" readonly><span class="sfx">%</span></div></div>`,
  bad:`<div class="mock"><label class="ml">変動費率（小数で入力）</label><input class="mi" value="0.65" readonly><div class="ms" style="margin-top:4px">※65%の場合は0.65と入力してください</div></div>`,
  principle:"人間の言葉の形式で入力させ、変換は機械がやる",
  explain:"人は比率を「65%」と考えるのであって「0.65」とは考えません。小数入力を強いると、65と打って6500%になる事故や、その逆が必ず起きます。「%」を欄の横に固定表示して整数で受け付け、計算用の変換はシステムが裏で行います。"
},
{
  g:"フォームと入力", cat:"入力データの消去",
  title:"クリアボタンの設計",
  context:"入力をやり直したいときのクリア機能です。事故が起きにくいのはどちらでしょう？",
  la:"控えめ＋2段階確認", lb:"実行ボタンの隣に同格で",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="ml" style="margin:0">収益項目</span><span style="font-size:10px;color:#8d97a3;text-decoration:underline">入力データクリア</span></div><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:10px"></div><span class="mb mb-p mb-block">試算する</span><div class="ms" style="margin-top:4px;text-align:center">クリアは1回目のクリックで赤色の確認表示に変わります</div></div>`,
  bad:`<div class="mock"><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:10px"></div><div class="mrow"><span class="mb mb-danger" style="flex:1">全データ削除</span><span class="mb mb-p" style="flex:1">試算する</span></div></div>`,
  principle:"破壊的操作は主操作から離し、控えめに置く",
  explain:"「全データ削除」を「試算する」と同じ大きさで隣に置くと、いつか必ず誤クリックされます。クリアは各セクションに小さなテキストリンクで置き、1回目のクリックで警告色の確認表示に変える2段階方式なら、必要な人には届き、事故は防げます。"
},
// ---------- 数値とデータ表示（10問） ----------
{
  g:"数値とデータ表示", cat:"財務指標の一覧表",
  title:"ゼロと未入力の区別",
  context:"値がない箇所の表示です。データの状態が正しく伝わるのはどちらでしょう？",
  la:"0と「—」を区別", lb:"どちらも空欄",
  good:`<div class="mock"><table class="mtbl"><tr><th>科目</th><th style="text-align:right">当期</th><th style="text-align:right">前期</th></tr><tr><td>営業外収益</td><td class="num" style="font-family:Arial">0</td><td class="num" style="font-family:Arial">120</td></tr><tr><td>特別損失</td><td class="num" style="font-family:Arial;color:#8d97a3">—</td><td class="num" style="font-family:Arial">450</td></tr></table><div class="ms" style="margin-top:4px">0 = ゼロ円　— = 未入力</div></div>`,
  bad:`<div class="mock"><table class="mtbl"><tr><th>科目</th><th style="text-align:right">当期</th><th style="text-align:right">前期</th></tr><tr><td>営業外収益</td><td class="num"></td><td class="num" style="font-family:Arial">120</td></tr><tr><td>特別損失</td><td class="num"></td><td class="num" style="font-family:Arial">450</td></tr></table><div class="ms" style="margin-top:4px">※ゼロなのか未入力なのか分からない</div></div>`,
  principle:"『値がゼロ』と『値がない』を同じ見た目にしない",
  explain:"空欄は「ゼロ円だった」のか「まだ入力していない」のか判別できず、分析結果の信頼性に関わります。ゼロは「0」、未入力・対象外は「—」のように表示を分けることで、データの状態そのものが情報として伝わります。"
},
{
  g:"数値とデータ表示", cat:"評価額の表示",
  title:"桁区切りと単位の明記",
  context:"大きな金額の表示方法です。読み取りが速いのはどちらでしょう？",
  la:"カンマ＋単位を明記", lb:"生の数字をそのまま",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">自社株評価額（類似業種比準方式）</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:24px">128,400</span><span style="font-size:12px;color:#56626f"> 千円</span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">自社株評価額（類似業種比準方式）</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a;font-size:24px">128400000</div></div>`,
  principle:"数値は必ず桁区切り＋単位付きで表示する",
  explain:"「128400000」を読むには桁を数えるしかありません。3桁カンマ＋単位（千円/万円）を必ず添えます。プレースホルダーの例示数値も含め、画面に出るすべての金額・数量に例外なく適用するのがプロの仕事です。"
},
{
  g:"数値とデータ表示", cat:"主要指標の前期比較",
  title:"増減の見せ方",
  context:"前期からの変化を示す表示です。変化の方向が一瞬で分かるのはどちらでしょう？",
  la:"矢印＋色＋差分", lb:"今期と前期の数字だけ",
  good:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">営業利益率</div><div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:20px;font-weight:700;font-family:Arial;color:#0f2a4a">13.1<span style="font-size:11px">%</span></span><span style="font-size:11px;font-weight:700;color:#456155">▲ +2.3pt</span></div><div class="ms">前期 10.8%</div></div></div>`,
  bad:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:10px"><div class="ms">営業利益率</div><div style="font-size:13px;font-weight:400;font-family:Arial;color:#2b323d">当期 13.1%<br>前期 10.8%</div></div></div>`,
  principle:"比較は差分を計算して見せる（暗算させない）",
  explain:"「当期13.1%・前期10.8%」と並べるだけでは、ユーザーが頭の中で引き算をすることになります。差分（+2.3pt）と方向（▲）と評価（緑=改善）まで計算して見せるのが、分析ツールの存在価値です。"
},
{
  g:"数値とデータ表示", cat:"5期分の売上推移",
  title:"グラフの種類の選択",
  context:"時系列の推移を見せるグラフです。変化が読み取れるのはどちらでしょう？",
  la:"棒・折れ線グラフ", lb:"円グラフで時系列",
  good:`<div class="mock"><div class="ms" style="margin-bottom:6px">売上高の推移（百万円）</div><div style="display:flex;align-items:flex-end;gap:6px;height:56px"><div style="flex:1;height:55%;background:#9db8d2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:62%;background:#9db8d2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:58%;background:#9db8d2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:75%;background:#9db8d2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:90%;background:#0f2a4a;border-radius:2px 2px 0 0"></div></div><div style="display:flex;gap:6px;font-size:8px;color:#8d97a3;text-align:center"><span style="flex:1">22期</span><span style="flex:1">23期</span><span style="flex:1">24期</span><span style="flex:1">25期</span><span style="flex:1">26期</span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">売上高の推移（百万円）</div><div style="width:70px;height:70px;border-radius:50%;margin:0 auto;background:conic-gradient(#3b6ea5 0 65deg,#5c8272 65deg 135deg,#c9a227 135deg 205deg,#a83d3d 205deg 280deg,#8b9db2 280deg 360deg)"></div><div class="ms" style="margin-top:4px">※5期分を円グラフで表示</div></div>`,
  principle:"時系列は棒・折れ線、構成比は円・積み上げと使い分ける",
  explain:"円グラフは「全体に占める割合」を見せるための形式で、時系列の変化には全く向きません。推移は棒か折れ線、構成比は円か積み上げ棒、比較は横棒——データの性質とグラフの形式を正しく対応させることが、グラフ選びの第一歩です。"
},
{
  g:"数値とデータ表示", cat:"科目別の明細表",
  title:"表の罫線の量",
  context:"明細テーブルの罫線の引き方です。数字に集中できるのはどちらでしょう？",
  la:"横罫線のみ控えめに", lb:"全セルを太い罫線で囲む",
  good:`<div class="mock"><table class="mtbl"><tr><th>科目</th><th style="text-align:right">金額（千円）</th></tr><tr><td>現金及び預金</td><td class="num" style="font-family:Arial">45,200</td></tr><tr><td>売掛金</td><td class="num" style="font-family:Arial">32,800</td></tr><tr><td>棚卸資産</td><td class="num" style="font-family:Arial">18,400</td></tr></table></div>`,
  bad:`<div class="mock"><table style="width:100%;border-collapse:collapse;margin-top:4px"><tr><th style="border:2px solid #56626f;font-size:11px;padding:4px;background:#dde3e8">科目</th><th style="border:2px solid #56626f;font-size:11px;padding:4px;background:#dde3e8">金額（千円）</th></tr><tr><td style="border:2px solid #56626f;font-size:12px;font-weight:400;padding:4px">現金及び預金</td><td style="border:2px solid #56626f;font-size:12px;font-weight:400;padding:4px;text-align:right;font-family:Arial">45,200</td></tr><tr><td style="border:2px solid #56626f;font-size:12px;font-weight:400;padding:4px">売掛金</td><td style="border:2px solid #56626f;font-size:12px;font-weight:400;padding:4px;text-align:right;font-family:Arial">32,800</td></tr></table></div>`,
  principle:"罫線は最小限に。区切りは余白と揃えで作る",
  explain:"全セルを太い罫線で囲んだ表は、線がノイズになって肝心の数字が読みにくくなります。横罫線を細く引く（またはゼブラ縞にする）だけで行の区切りは十分伝わります。Excelの初期設定のような格子は、画面ではまず不要です。"
},
{
  g:"数値とデータ表示", cat:"結果サマリーの数値",
  title:"数値の視覚的階層",
  context:"総合結果と内訳数値の見せ方です。何が結論か伝わるのはどちらでしょう？",
  la:"主役を大きく内訳は小さく", lb:"全数値が同じサイズ",
  good:`<div class="mock" style="text-align:center"><div class="ms">実質的な会社の値段（株価）</div><div style="font-family:Arial;font-weight:700;color:#0f2a4a"><span style="font-size:26px">4</span><span style="font-size:14px;color:#56626f">億</span><span style="font-size:26px">2,800</span><span style="font-size:13px;color:#56626f">万円</span></div><hr class="mhr"><div style="display:flex;justify-content:space-around;font-size:10px;color:#56626f"><span>類似業種比準<br><b style="font-family:Arial;font-size:12px;color:#2b323d">3.8<span style="font-size:9px">億円</span></b></span><span>純資産価額<br><b style="font-family:Arial;font-size:12px;color:#2b323d">4.6<span style="font-size:9px">億円</span></b></span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div style="font-size:14px;font-weight:700;font-family:Arial;color:#2b323d;line-height:2">実質株価　4億2,800万円<br>類似業種比準　3億8,000万円<br>純資産価額　4億6,000万円</div></div>`,
  principle:"最重要の数値を1つ決めて、サイズで主役にする",
  explain:"すべての数値が同じ大きさだと、どれが結論でどれが根拠なのか分かりません。「この画面で持ち帰ってほしい数字」を1つ決めて大きく置き、内訳や参考値は小さく従わせます。数値の大小関係＝情報の重要度、と一致させるのが原則です。"
},
{
  g:"数値とデータ表示", cat:"自社の指標の評価",
  title:"比較の基準の提示",
  context:"自社の営業利益率を表示する場面です。良いのか悪いのか判断できるのはどちらでしょう？",
  la:"業界平均と並べる", lb:"自社の数値のみ",
  good:`<div class="mock"><div class="ms" style="margin-bottom:6px">営業利益率</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="width:52px;font-size:10px;color:#56626f">自社</span><div style="flex:1;height:14px;background:#eef1f4;border-radius:7px;overflow:hidden"><div style="width:65%;height:100%;background:#0f2a4a"></div></div><b style="font-family:Arial;font-size:12px">13.1%</b></div><div style="display:flex;align-items:center;gap:8px"><span style="width:52px;font-size:10px;color:#56626f">業界平均</span><div style="flex:1;height:14px;background:#eef1f4;border-radius:7px;overflow:hidden"><div style="width:42%;height:100%;background:#8b9db2"></div></div><b style="font-family:Arial;font-size:12px;color:#56626f">8.5%</b></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:2px">営業利益率</div><div style="font-size:24px;font-weight:700;font-family:Arial;color:#0f2a4a">13.1<span style="font-size:12px">%</span></div></div>`,
  principle:"数値には判断の物差し（基準・平均・目標）を添える",
  explain:"「営業利益率13.1%」と言われても、比較対象がなければ良いのか悪いのか判断できません。業界平均・前期・目標値のような物差しを並べて初めて、数値は「意味」になります。分析ツールの価値は、この物差しを用意してあげることにあります。"
},
{
  g:"数値とデータ表示", cat:"比率指標の一覧",
  title:"小数桁数の統一",
  context:"複数の比率を並べて表示します。整って見えるのはどちらでしょう？",
  la:"小数1桁に統一", lb:"桁数がバラバラ",
  good:`<div class="mock"><table class="mtbl"><tr><th>指標</th><th style="text-align:right">値</th></tr><tr><td>営業利益率</td><td class="num" style="font-family:Arial">13.1%</td></tr><tr><td>自己資本比率</td><td class="num" style="font-family:Arial">42.5%</td></tr><tr><td>流動比率</td><td class="num" style="font-family:Arial">142.3%</td></tr></table></div>`,
  bad:`<div class="mock"><table class="mtbl"><tr><th>指標</th><th style="text-align:right">値</th></tr><tr><td>営業利益率</td><td class="num" style="font-family:Arial">13.0983%</td></tr><tr><td>自己資本比率</td><td class="num" style="font-family:Arial">42%</td></tr><tr><td>流動比率</td><td class="num" style="font-family:Arial">142.28571%</td></tr></table></div>`,
  principle:"同じ種類の数値は、小数桁数を揃えて表示する",
  explain:"13.0983%と42%が並ぶ表は、精度の高低が入り混じって比較しづらく、雑然として見えます。比率は小数1桁、金額は千円単位、のように種類ごとの表示精度を決めて統一します。内部計算は高精度のまま、表示だけ丸めるのがポイントです。"
},
{
  g:"数値とデータ表示", cat:"前期比較の棒グラフ",
  title:"グラフ軸の起点",
  context:"売上291と312（百万円）を比較する棒グラフです。誠実な見せ方はどちらでしょう？",
  la:"0起点で描く", lb:"280起点で差を誇張",
  good:`<div class="mock"><div class="ms" style="margin-bottom:6px">売上高（百万円）　※0起点</div><div style="display:flex;align-items:flex-end;gap:16px;height:60px;padding:0 20px"><div style="flex:1;height:93%;background:#9db8d2;border-radius:2px 2px 0 0;position:relative"><span style="position:absolute;top:-12px;left:0;right:0;text-align:center;font-size:9px;font-family:Arial">291</span></div><div style="flex:1;height:100%;background:#0f2a4a;border-radius:2px 2px 0 0;position:relative"><span style="position:absolute;top:-12px;left:0;right:0;text-align:center;font-size:9px;font-family:Arial">312</span></div></div><div style="display:flex;gap:16px;padding:0 20px;font-size:9px;color:#8d97a3;text-align:center"><span style="flex:1">前期</span><span style="flex:1">当期</span></div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:6px">売上高（百万円）　※280起点</div><div style="display:flex;align-items:flex-end;gap:16px;height:60px;padding:0 20px"><div style="flex:1;height:34%;background:#9db8d2;border-radius:2px 2px 0 0;position:relative"><span style="position:absolute;top:-12px;left:0;right:0;text-align:center;font-size:9px;font-family:Arial">291</span></div><div style="flex:1;height:100%;background:#0f2a4a;border-radius:2px 2px 0 0;position:relative"><span style="position:absolute;top:-12px;left:0;right:0;text-align:center;font-size:9px;font-family:Arial">312</span></div></div><div style="display:flex;gap:16px;padding:0 20px;font-size:9px;color:#8d97a3;text-align:center"><span style="flex:1">前期</span><span style="flex:1">当期</span></div></div>`,
  principle:"棒グラフの軸は0から始める（差を誇張しない）",
  explain:"280起点にすると7%の増収が3倍に見えます。棒グラフは長さ＝量として読まれるため、軸を切ると事実を歪めることになり、気づいた利用者からの信頼を一気に失います。細かい差を見せたいときは、差分そのものを数値で示します。"
},
{
  g:"数値とデータ表示", cat:"長い明細表のスクロール",
  title:"表ヘッダーの固定",
  context:"50行の明細表をスクロールして見ています。列の意味を見失わないのはどちらでしょう？",
  la:"見出し行を固定", lb:"見出しが流れて消える",
  good:`<div class="mock" style="padding:0;overflow:hidden"><div style="display:flex;background:#0f2a4a;color:#fff;font-size:10px;font-weight:700;padding:6px 10px"><span style="flex:2">科目</span><span style="flex:1;text-align:right">当期</span><span style="flex:1;text-align:right">前期</span></div><div style="padding:4px 10px;font-size:11px;font-weight:400;display:flex;border-bottom:1px solid #eef1f4"><span style="flex:2">貸倒引当金</span><span style="flex:1;text-align:right;font-family:Arial">△1,200</span><span style="flex:1;text-align:right;font-family:Arial">△900</span></div><div style="padding:4px 10px;font-size:11px;font-weight:400;display:flex"><span style="flex:2">投資有価証券</span><span style="flex:1;text-align:right;font-family:Arial">8,500</span><span style="flex:1;text-align:right;font-family:Arial">8,500</span></div><div class="ms" style="padding:4px 10px">※スクロールしても見出しは上部に固定</div></div>`,
  bad:`<div class="mock" style="padding:0;overflow:hidden"><div style="padding:4px 10px;font-size:11px;font-weight:400;display:flex;border-bottom:1px solid #eef1f4"><span style="flex:2">貸倒引当金</span><span style="flex:1;text-align:right;font-family:Arial">△1,200</span><span style="flex:1;text-align:right;font-family:Arial">△900</span></div><div style="padding:4px 10px;font-size:11px;font-weight:400;display:flex;border-bottom:1px solid #eef1f4"><span style="flex:2">投資有価証券</span><span style="flex:1;text-align:right;font-family:Arial">8,500</span><span style="flex:1;text-align:right;font-family:Arial">8,500</span></div><div class="ms" style="padding:4px 10px">※見出し行はスクロールで画面外へ。どちらの列が当期？</div></div>`,
  principle:"スクロールしても列見出しは見えたままにする",
  explain:"50行の表を下まで読み進めたとき、見出しが消えていると「右の列は当期だっけ？前期だっけ？」と上まで戻る羽目になります。position: stickyで見出し行を固定するだけで、この往復が完全になくなります。長い表には必須の配慮です。"
},
// ---------- 状態と反応（12問） ----------
{
  g:"状態と反応", cat:"試算ボタンを押した直後",
  title:"計算中の表示",
  context:"複雑な計算に2〜3秒かかります。安心して待てるのはどちらでしょう？",
  la:"計算中の状態を表示", lb:"無反応のまま",
  good:`<div class="mock"><span class="mb mb-gray mb-block">⏳ 計算しています…</span><div style="height:4px;background:#eef1f4;border-radius:2px;margin-top:8px;overflow:hidden"><div style="width:60%;height:100%;background:#3b6ea5;border-radius:2px"></div></div></div>`,
  bad:`<div class="mock"><span class="mb mb-p mb-block">試算する</span><div class="ms" style="text-align:center;margin-top:6px">※押しても2〜3秒なにも変化しない</div></div>`,
  principle:"1秒を超える処理は、必ず処理中であることを見せる",
  explain:"押しても無反応だと、ユーザーは連打するか「壊れた」と判断します。ボタンを「計算しています…」に変えて無効化し、プログレスバーを添えれば、待ち時間はそのままでも体感は大きく変わります。二重実行の防止にもなります。"
},
{
  g:"状態と反応", cat:"入力内容の保存",
  title:"保存状態の可視化",
  context:"入力データが自動保存されるツールです。安心して作業できるのはどちらでしょう？",
  la:"保存済みを明示", lb:"保存されたか分からない",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">財務データ入力</b><span style="font-size:10px;color:#456155">✓ 自動保存済み 15:42</span></div><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"></div>`,
  bad:`<div class="mock"><div style="margin-bottom:8px"><b style="font-size:12px;color:#0f2a4a">財務データ入力</b></div><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div class="ms" style="margin-top:6px">※保存されているのか、消えるのか、表示がない</div></div>`,
  principle:"見えないシステム動作（自動保存）は言葉で見せる",
  explain:"自動保存は便利ですが、動作が見えないと「閉じたら消えるのでは」という不安が残り、ユーザーは自衛のためにメモを取ったりスクリーンショットを撮ったりし始めます。「✓ 自動保存済み 15:42」の一行が、その不安を消します。"
},
{
  g:"状態と反応", cat:"入力途中でタブを閉じる",
  title:"未保存データの保護",
  context:"30分かけた入力の途中でページを閉じようとしています。データを守れるのはどちらでしょう？",
  la:"確認ダイアログで警告", lb:"黙って破棄される",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">保存されていない変更があります</div><div class="ms" style="margin-bottom:10px">このまま閉じると、入力した内容は失われます。</div><div class="mrow"><span class="mb mb-plain">閉じる</span><span class="mb mb-p">入力に戻る</span></div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:26px 14px"><div style="font-size:22px;margin-bottom:6px">🗑</div><div class="ms">タブを閉じた瞬間、30分ぶんの入力が<br>警告なしで消えた</div></div>`,
  principle:"ユーザーの作業成果を、黙って捨てない",
  explain:"何十分もかけた入力が警告なしで消える——これはツールへの信頼を最も深く傷つける体験です。未保存の変更がある状態での離脱にはbeforeunloadで確認を挟み、できれば自動保存で「そもそも消えない」設計にします。"
},
{
  g:"状態と反応", cat:"試算完了の直後",
  title:"結果への誘導",
  context:"画面下部に結果が表示されました。結果に気づけるのはどちらでしょう？",
  la:"結果へスクロール＋強調", lb:"画面はそのまま",
  good:`<div class="mock"><div class="mok" style="margin-bottom:6px">✓ 試算が完了しました</div><div style="border:2px solid #3b6ea5;border-radius:8px;padding:10px;text-align:center;background:#e8eef5"><div class="ms">実質株価</div><b style="font-size:18px;font-family:Arial;color:#0f2a4a">4.28<span style="font-size:11px">億円</span></b></div><div class="ms" style="margin-top:4px;text-align:center">結果セクションへ自動スクロールし、枠を一瞬ハイライト</div></div>`,
  bad:`<div class="mock"><span class="mb mb-p mb-block">試算する</span><div class="ms" style="margin-top:8px;text-align:center">※結果はこの画面のずっと下に表示されている<br>（スクロールしないと見えない）</div></div>`,
  principle:"操作の結果が画面外に出るなら、そこへ連れて行く",
  explain:"「試算する」を押したのに見た目が何も変わらない——実は結果が画面外の下に出ていた、というのは数値ツールの定番の落とし穴です。結果セクションへの自動スクロールと短いハイライトで、「あなたの操作はこれを生みました」を明確に伝えます。"
},
{
  g:"状態と反応", cat:"ブラウザの誤リロード",
  title:"入力データの復元",
  context:"うっかりF5でリロードしてしまいました。信頼を保てるのはどちらでしょう？",
  la:"データが復元される", lb:"すべて消える",
  good:`<div class="mock"><div class="mtoast" style="margin-top:0"><span>前回の入力データを復元しました</span><a>クリア</a></div><div style="height:8px"></div><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"></div>`,
  bad:`<div class="mock"><label class="ml">売上高</label><input class="mi" placeholder="入力例：30,000" readonly><div style="height:6px"></div><label class="ml">総資産</label><input class="mi" placeholder="入力例：25,000" readonly><div class="ms" style="margin-top:6px">※リロードで全項目が空に戻った</div></div>`,
  principle:"入力データはブラウザ内に保持し、不意の消失から守る",
  explain:"localStorageに入力値を保持しておけば、リロードやブラウザクラッシュでもデータが戻ります。「復元しました」の通知とクリア手段をセットで出せば、別の会社を入力したい場合にも対応できます。入力が多いツールほど必須の仕組みです。"
},
{
  g:"状態と反応", cat:"保存処理の失敗",
  title:"エラー時の入力保全",
  context:"通信エラーで保存に失敗しました。被害が小さいのはどちらでしょう？",
  la:"入力値はそのまま残る", lb:"全欄がクリアされる",
  good:`<div class="mock"><div class="merr" style="margin-bottom:6px">通信エラーで保存できませんでした。入力内容は保持されています。</div><label class="ml">売上高</label><input class="mi" value="30,000" readonly style="text-align:right"><div style="height:8px"></div><span class="mb mb-g mb-block">もう一度保存する</span></div>`,
  bad:`<div class="mock"><div class="merr" style="margin-bottom:6px">エラーが発生しました</div><label class="ml">売上高</label><input class="mi" readonly><div class="ms" style="margin-top:6px">※エラーと同時に入力欄がすべて空に</div></div>`,
  principle:"エラーが起きても、ユーザーの入力を道連れにしない",
  explain:"エラーで入力値まで消すのは、転んだ人の荷物を燃やすようなものです。失敗したのはシステム側の処理であって、ユーザーの入力は無傷のまま保持し、ワンクリックで再試行できるようにします。「入力内容は保持されています」の一言が安心を生みます。"
},
{
  g:"状態と反応", cat:"結果の印刷・共有",
  title:"印刷用レイアウト",
  context:"試算結果を顧客に紙で渡したい場面です。そのまま使えるのはどちらでしょう？",
  la:"A4整形されたPDF", lb:"画面をそのまま印刷",
  good:`<div class="mock" style="padding:10px"><div style="border:1px solid #dde3e8;border-radius:4px;padding:10px;background:#fff;box-shadow:0 2px 6px rgba(15,42,74,.1)"><div style="text-align:center;font-size:11px;font-weight:700;color:#0f2a4a;border-bottom:2px solid #0f2a4a;padding-bottom:4px;margin-bottom:6px">自社株評価 試算結果</div><div style="font-size:9px;font-weight:400;color:#4a5460;line-height:1.6">株式会社サンプル製作所 御中<br>試算日：2026/08/12</div><div style="text-align:right;font-size:8px;color:#8d97a3;margin-top:6px">A4縦・1枚に整形</div></div></div>`,
  bad:`<div class="mock" style="padding:10px"><div style="border:1px solid #dde3e8;border-radius:4px;padding:10px;background:#fff;overflow:hidden"><div style="font-size:10px;font-weight:700;color:#0f2a4a;white-space:nowrap">財務分析ダッシュボード　[保存] [PDF] [クリ…</div><div style="font-size:9px;font-weight:400;color:#4a5460;white-space:nowrap;margin-top:4px">ナビゲーションメニュー｜広告バナー｜右端が切れて印刷さ…</div><div style="text-align:right;font-size:8px;color:#a83d3d;margin-top:6px">※画面キャプチャそのまま</div></div></div>`,
  principle:"紙で渡される前提の出力は、紙のために整形する",
  explain:"財務ツールの結果は、経営者や金融機関に紙で見せられることが多いものです。画面をそのまま印刷するとボタンやメニューまで写り、右端も切れます。@media printやPDF生成でA4に整形した出力を用意することが、ツールの「最後の品質」を決めます。"
},
{
  g:"状態と反応", cat:"計算ロジックの説明",
  title:"補足説明の置き場所",
  context:"指標の計算方法を知りたい人向けの説明です。画面が散らからないのはどちらでしょう？",
  la:"？アイコンに格納", lb:"画面に長文をベタ書き",
  good:`<div class="mock"><div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><span class="ml" style="margin:0">類似業種比準価額</span><span style="width:16px;height:16px;border-radius:50%;background:#e8eef5;color:#2d5580;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">?</span></div><div class="mcoach" style="margin-top:2px">配当・利益・純資産の3要素を類似業種の株価と比較して算定します。</div><div class="ms" style="margin-top:6px">※ホバー／タップで開く</div></div>`,
  bad:`<div class="mock"><span class="ml">類似業種比準価額</span><div style="font-size:9px;font-weight:400;color:#4a5460;line-height:1.6;background:#f8f9fb;border:1px solid #eef1f4;border-radius:4px;padding:6px;margin-top:4px">類似業種比準価額とは、評価会社と事業内容が類似する業種目の株価を基に、1株当たりの配当金額、利益金額及び純資産価額の3要素を比準して評価する方式であり、国税庁が毎月公表する類似業種の株価等に基づき…（さらに5行続く）</div></div>`,
  principle:"詳細説明はオンデマンドで（知りたい人にだけ開く）",
  explain:"計算ロジックの説明は、9割のユーザーには読み飛ばすノイズ、1割のユーザーには必須情報です。「？」アイコンのツールチップに格納すれば、画面はすっきり保ちつつ、知りたい人には確実に届きます。基本解説をインラインでベタ書きしないのが原則です。"
},
{
  g:"状態と反応", cat:"入力ミスらしき値の検出",
  title:"異常値の警告",
  context:"利益率が250%になる入力がされました。親切なのはどちらでしょう？",
  la:"確認を促す警告", lb:"そのまま結果を表示",
  good:`<div class="mock"><div style="background:#fdf6e3;border:1px solid #e8d9a0;border-radius:6px;padding:8px 10px;font-size:11px;color:#8a6d1a;margin-bottom:8px"><b>⚠ 営業利益率が250%になっています</b><br><span style="font-weight:400">売上高の単位（万円）をご確認ください。</span></div><label class="ml">売上高</label><div class="msuffix"><input class="mi mi-err" value="30" readonly><span class="sfx">万円</span></div></div>`,
  bad:`<div class="mock"><div style="border:1px solid #dde3e8;border-radius:8px;padding:10px;text-align:center"><div class="ms">営業利益率</div><b style="font-size:20px;font-family:Arial;color:#0f2a4a">250.0<span style="font-size:11px">%</span></b></div><div class="ms" style="margin-top:6px">※明らかに異常な値でもそのまま表示</div></div>`,
  principle:"ありえない値は、計算する前に問い返す",
  explain:"利益率250%のような現実にありえない結果は、ほぼ確実に入力ミス（単位の取り違え等）です。そのまま表示すればツールの信頼性を疑われます。妥当性の範囲を定義しておき、外れたら「入力をご確認ください」と原因の見当まで添えて問い返します。"
},
{
  g:"状態と反応", cat:"データ投入前のグラフ",
  title:"空のグラフの見せ方",
  context:"まだデータが入力されていない推移グラフです。次の行動につながるのはどちらでしょう？",
  la:"説明＋入力への導線", lb:"空の軸だけ表示",
  good:`<div class="mock" style="text-align:center"><div class="ms" style="margin-bottom:6px">売上高の推移</div><div style="border:1px dashed #c9ced4;border-radius:8px;padding:16px 10px"><div style="font-size:20px;margin-bottom:4px">📊</div><div class="ms" style="margin-bottom:8px">決算データを入力すると<br>5期分の推移が表示されます</div><span class="mb mb-p" style="padding:5px 14px;font-size:11px">決算データを入力する</span></div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:6px">売上高の推移</div><div style="border-left:1px solid #8d97a3;border-bottom:1px solid #8d97a3;height:60px;position:relative"><span style="position:absolute;bottom:-14px;left:0;font-size:8px;color:#8d97a3">0</span></div><div style="height:14px"></div></div>`,
  principle:"空の状態には、埋め方への案内を置く",
  explain:"空の軸だけのグラフは「壊れている」ようにも見えます。何を入力すれば何が表示されるのかの説明と、入力画面への直接の導線を置けば、空の状態そのものがチュートリアルとして機能します。"
},
{
  g:"状態と反応", cat:"外部データの取得失敗",
  title:"処理失敗時の案内",
  context:"業界平均データの取得に失敗しました。立て直せるのはどちらでしょう？",
  la:"原因＋再試行の手段", lb:"「失敗しました」のみ",
  good:`<div class="mock"><div class="merr" style="margin-bottom:8px"><b>業界平均データを取得できませんでした</b><br>通信環境をご確認ください。自社データの分析は続行できます。</div><div class="mrow" style="margin:0"><span class="mb mb-plain" style="font-size:11px">業界比較なしで続行</span><span class="mb mb-g" style="font-size:11px">再試行</span></div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:22px 14px"><div class="merr" style="font-size:13px">処理に失敗しました</div></div>`,
  principle:"失敗の告知には、原因・影響範囲・次の一手を含める",
  explain:"「失敗しました」だけでは、ユーザーは何が失われ、何ができるのか分かりません。原因（通信）・影響（業界比較のみ不可）・選択肢（再試行 or 続行）の3点を示せば、失敗しても作業は止まりません。部分的な失敗を全体の失敗に見せないことも重要です。"
},
{
  g:"状態と反応", cat:"長い分析レポート",
  title:"ページ内の道しるべ",
  context:"収益性・安全性・成長性…と続く長い結果ページです。目的の場所へ着けるのはどちらでしょう？",
  la:"目次とジャンプリンク", lb:"ひたすらスクロール",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">分析レポート</div><div style="display:flex;gap:4px;flex-wrap:wrap"><span style="font-size:10px;background:#e8eef5;color:#2d5580;border-radius:9999px;padding:3px 10px;font-weight:700">① 総合評価</span><span style="font-size:10px;background:#e8eef5;color:#2d5580;border-radius:9999px;padding:3px 10px;font-weight:700">② 収益性</span><span style="font-size:10px;background:#e8eef5;color:#2d5580;border-radius:9999px;padding:3px 10px;font-weight:700">③ 安全性</span><span style="font-size:10px;background:#e8eef5;color:#2d5580;border-radius:9999px;padding:3px 10px;font-weight:700">④ 成長性</span></div><div class="ms" style="margin-top:6px">タップで各セクションへジャンプ</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">分析レポート</div><div class="mskel" style="width:100%"></div><div class="mskel" style="width:92%"></div><div class="mskel" style="width:96%"></div><div class="mskel" style="width:88%"></div><div class="ms" style="text-align:center;margin-top:4px">※目次なし。目的のセクションまで延々スクロール</div></div>`,
  principle:"長いページには目次と現在地を用意する",
  explain:"スクロールが数画面に及ぶレポートでは、目次（アンカーリンク）が地図の役割を果たします。「④成長性だけ見たい」という再訪ユーザーが一瞬で目的地に着けるかどうかは、ツールの実用性を大きく左右します。"
},
// ---------- チュートリアル（10問） ----------
// ---------- チュートリアル編（Q41〜50） ----------
{
  g:"チュートリアル", cat:"家計簿アプリの初回起動",
  title:"ウォークスルーの長さ",
  context:"初回起動時の紹介スライドです。使い始めるまでの負担が少ないのはどちらでしょう？",
  la:"3枚＋スキップ可", lb:"8枚スキップ不可",
  good:`<div class="mock" style="text-align:center"><div style="font-size:26px;margin-bottom:4px">💰</div><div class="mtitle" style="margin-bottom:2px">レシートを撮るだけで記録</div><div class="ms">面倒な入力は不要です</div><div class="mdots"><span class="mdot on"></span><span class="mdot"></span><span class="mdot"></span></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="ms" style="text-decoration:underline">スキップ</span><span class="mb mb-p" style="padding:6px 16px">次へ</span></div></div>`,
  bad:`<div class="mock" style="text-align:center"><div style="font-size:26px;margin-bottom:4px">💰</div><div class="mtitle" style="margin-bottom:2px">機能紹介（1/8）</div><div class="ms">このアプリには8つの便利な機能があります</div><div class="mdots"><span class="mdot on"></span><span class="mdot"></span><span class="mdot"></span><span class="mdot"></span><span class="mdot"></span><span class="mdot"></span><span class="mdot"></span><span class="mdot"></span></div><div style="display:flex;justify-content:flex-end"><span class="mb mb-p" style="padding:6px 16px">次へ</span></div></div>`,
  principle:"オンボーディングは短く、いつでも離脱できるようにする",
  explain:"初回スライドは「一番の価値」を3枚程度で伝えるのが上限です。8枚のスライドは読まれず、スキップできないと不満だけが残ります。ユーザーは説明を見に来たのではなく、アプリを使いに来ています。"
},
{
  g:"チュートリアル", cat:"請求書アプリの新機能告知",
  title:"機能説明を出すタイミング",
  context:"新機能「定期請求」を知らせたい場面です。記憶に残りやすいのはどちらでしょう？",
  la:"使う場面で1つずつ", lb:"起動時に全機能列挙",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b style="font-size:13px;color:#0f2a4a">請求書一覧</b><span class="mb mb-p mhl" style="padding:5px 12px;font-size:11px">＋ 新規作成</span></div><div class="mcoach" style="margin-top:12px"><span class="cstep">NEW</span><br>請求書を毎月自動で発行できる「定期請求」が使えるようになりました。</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">新機能のご案内（全6件）</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8">・定期請求機能を追加しました<br>・CSVエクスポートに対応しました<br>・入金消込機能を改善しました<br>・テンプレートを5種類追加しました<br>・検索機能を強化しました<br>・その他細かな改善</div><div style="height:8px"></div><span class="mb mb-p mb-block">閉じる</span></div>`,
  principle:"説明を先に詰め込まず、必要になった瞬間に教える",
  explain:"機能説明は「その機能を使う場面」で、1つずつ出すのが最も記憶に残ります。起動直後に全機能をまとめて列挙しても、使う場面が想像できないため右から左へ抜けていきます。説明のタイミングは内容と同じくらい重要です。"
},
{
  g:"チュートリアル", cat:"タスク管理アプリの初回学習",
  title:"操作を覚えてもらう方法",
  context:"最初の操作を身につけてもらう場面です。手が覚えるのはどちらでしょう？",
  la:"実際に操作させる", lb:"説明文を読ませる",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">最初のタスクを作ってみましょう</div><input class="mi mhl" placeholder="例：企画書を作成する" readonly><div class="mcoach"><span class="cstep">STEP 1/2</span><br>ここにタスク名を入力して、Enterキーを押してください。</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:6px">タスクの作り方</div><div style="font-size:11px;font-weight:400;color:#4a5460;line-height:1.8">1. 画面上部の入力欄をクリックします<br>2. タスク名を入力します<br>3. Enterキーを押すと登録されます<br>4. タスクをクリックすると詳細を編集できます</div><div style="height:8px"></div><span class="mb mb-p mb-block">理解しました</span></div>`,
  principle:"読ませるより、やらせる（Learning by Doing）",
  explain:"操作手順を文章で読ませても身につきません。実際の画面で1ステップずつ操作させる「インタラクティブチュートリアル」なら、手が覚えるうえに、最初のデータ（タスク）も同時に作られて一石二鳥です。"
},
{
  g:"チュートリアル", cat:"操作ツアーの1画面目",
  title:"スキップの設計",
  context:"急いでいるユーザーもいます。自由を保ちながら案内できるのはどちらでしょう？",
  la:"スキップ＋見返し可", lb:"最後まで強制",
  good:`<div class="mock"><div class="mcoach" style="margin-top:0"><span class="cstep">STEP 1/3</span><br>ダッシュボードでは売上をひと目で確認できます。<div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center"><a>スキップ（後からヘルプで見られます）</a><span class="mb mb-p" style="padding:4px 12px;font-size:11px">次へ</span></div></div></div>`,
  bad:`<div class="mock"><div class="mcoach" style="margin-top:0"><span class="cstep">STEP 1/8</span><br>ダッシュボードでは売上をひと目で確認できます。<div style="margin-top:6px;text-align:right"><span class="mb mb-p" style="padding:4px 12px;font-size:11px">次へ</span></div></div><div class="ms" style="margin-top:6px">※最後まで進まないと閉じられない</div></div>`,
  principle:"チュートリアルは、明確に離脱・再開できるようにする",
  explain:"チュートリアルの強制視聴は、既に使い方を知っている人・とにかく今すぐ使いたい人への拷問です。いつでもスキップでき、かつ「後からヘルプで見返せる」と添えることで、安心して飛ばせます。飛ばした人が困らない受け皿とセットで設計します。"
},
{
  g:"チュートリアル", cat:"管理画面の初回表示",
  title:"コーチマークの出し方",
  context:"操作ポイントを吹き出しで案内します。読んでもらえるのはどちらでしょう？",
  la:"1画面に1つずつ", lb:"5個同時に表示",
  good:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:4px"><span class="mb mb-p mhl" style="padding:5px 12px;font-size:11px">＋ 顧客を登録</span><span class="mb mb-plain" style="padding:5px 12px;font-size:11px">インポート</span></div><div class="mcoach"><span class="cstep">1/3</span><br>まずはここから顧客を登録します。</div></div>`,
  bad:`<div class="mock"><div style="display:flex;gap:6px;margin-bottom:4px"><span class="mb mb-p mhl" style="padding:5px 12px;font-size:11px">＋ 顧客を登録</span><span class="mb mb-plain mhl" style="padding:5px 12px;font-size:11px">インポート</span></div><div class="mcoach">ここから顧客を登録します。</div><div class="mcoach">CSVの取り込みはこちら。</div><div class="mcoach">検索はこの欄を使います。</div><div class="ms" style="margin-top:4px">※吹き出しが同時に多数表示</div></div>`,
  principle:"各ステップに、伝えたいことは1つだけ置く",
  explain:"吹き出しを同時に何個も出すと、どれから読めばいいか分からず、結局すべて閉じられます。コーチマークは「1度に1つ、順番に」が鉄則です。人の注意は一度に一箇所にしか向きません。"
},
{
  g:"チュートリアル", cat:"会計ソフトの初期設定",
  title:"セットアップの進捗表示",
  context:"設定ウィザードの途中です。最後までやり切ってもらえるのはどちらでしょう？",
  la:"残りステップを表示", lb:"全体数が不明",
  good:`<div class="mock"><div class="msteps"><div class="mstep on">✓</div><div class="msline"></div><div class="mstep on">2</div><div class="msline"></div><div class="mstep">3</div></div><div class="mtitle" style="margin-bottom:4px">銀行口座を連携（2/3）</div><div class="ms" style="margin-bottom:8px">あと1ステップで完了です</div><span class="mb mb-p mb-block">口座を選ぶ</span></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">銀行口座を連携</div><div class="ms" style="margin-bottom:8px">続いて口座の連携を行います</div><span class="mb mb-p mb-block">口座を選ぶ</span><div class="ms" style="margin-top:6px">※全体で何ステップあるかは表示されない</div></div>`,
  principle:"ゴールが近いと分かると、人は最後までやり切る",
  explain:"「あとどれだけで終わるか」が見えないセットアップは、長く感じられ途中離脱を招きます。ステップ表示＋「あと1ステップ」の一言で、完走率は大きく変わります。ゴールが近いと分かると人は最後までやり切ろうとします（目標勾配効果）。"
},
{
  g:"チュートリアル", cat:"分析ツールの初回ログイン",
  title:"初回のデータ表示",
  context:"売上ダッシュボードに初めてログインしました。ツールの価値が伝わるのはどちらでしょう？",
  la:"サンプルデータ入り", lb:"ゼロと空欄だらけ",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="font-size:12px;color:#0f2a4a">売上ダッシュボード</b><span style="font-size:10px;background:#e8eef5;color:#2d5580;border-radius:3px;padding:1px 6px;font-weight:700">サンプルデータ表示中</span></div><div style="display:flex;align-items:flex-end;gap:4px;height:44px;margin-bottom:8px"><div style="flex:1;height:40%;background:#c3d2e2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:65%;background:#9db8d2;border-radius:2px 2px 0 0"></div><div style="flex:1;height:85%;background:#3b6ea5;border-radius:2px 2px 0 0"></div></div><span class="mb mb-p mb-block" style="font-size:12px">自社データを取り込んで始める</span></div>`,
  bad:`<div class="mock"><b style="font-size:12px;color:#0f2a4a">売上ダッシュボード</b><div style="text-align:center;padding:24px 0;color:#99a3ad;font-size:12px">データがありません<br>売上高：¥0　利益：¥0　顧客数：0</div></div>`,
  principle:"サンプルデータで『完成形の体験』を先に見せる",
  explain:"初回のダッシュボードがゼロと空欄だらけでは、このツールで何が見えるようになるのか伝わりません。サンプルデータで「完成形の体験」を先に見せてから自分のデータ投入へ誘導すると、セットアップの動機が生まれます。"
},
{
  g:"チュートリアル", cat:"経営ツールの初回訪問",
  title:"会員登録を求めるタイミング",
  context:"初めて訪れたユーザーです。離脱が少ないのはどちらでしょう？",
  la:"まず試せる", lb:"登録が先",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">まずは試算してみる</div><div class="ms" style="margin-bottom:8px">登録不要でそのまま使えます</div><span class="mb mb-p mb-block">無料で試算を始める</span><div class="ms" style="text-align:center;margin-top:8px">結果を保存するときにアカウント登録できます</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">ご利用には会員登録が必要です</div><label class="ml">メールアドレス<span class="mtag-req">必須</span></label><input class="mi" readonly><div style="height:6px"></div><label class="ml">パスワード<span class="mtag-req">必須</span></label><input class="mi" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">登録して利用を開始</span></div>`,
  principle:"価値を先に、登録は後に（Gradual Engagement）",
  explain:"まだ価値を体験していない段階での登録要求は、最大の離脱ポイントです。先に触らせて「これは便利だ」と感じた後、保存などの自然な必要性が生じた瞬間に登録を求めれば、登録率も定着率も上がります。"
},
{
  g:"チュートリアル", cat:"初期設定ウィザードの完了直後",
  title:"セットアップ完了画面",
  context:"全ステップが終わりました。実際の利用につながるのはどちらでしょう？",
  la:"祝福＋次の一歩", lb:"「閉じる」だけ",
  good:`<div class="mock" style="text-align:center"><div style="font-size:26px;margin-bottom:4px">🎉</div><div class="mtitle" style="margin-bottom:4px">セットアップ完了！</div><div class="ms" style="margin-bottom:10px">さっそく最初の請求書を作ってみましょう</div><span class="mb mb-p mb-block">最初の請求書を作成する</span></div>`,
  bad:`<div class="mock" style="text-align:center"><div class="mtitle" style="margin-bottom:4px">設定が完了しました</div><div class="ms" style="margin-bottom:10px">ウィザードを終了します</div><span class="mb mb-plain mb-block">閉じる</span></div>`,
  principle:"チュートリアルの終点を、本来の作業の始点につなげる",
  explain:"セットアップ完了はゴールではなくスタートです。達成感を演出しつつ、「次にやるべき1つの行動」へ直結するボタンを置きます。「閉じる」で放り出されたユーザーは、何をすればいいか分からずそのまま戻ってこないことも多いのです。"
},
{
  g:"チュートリアル", cat:"ツアーを終えた後のヘルプ",
  title:"チュートリアルの見返し導線",
  context:"一度終えた（またはスキップした）後です。困ったとき立て直せるのはどちらでしょう？",
  la:"もう一度見られる", lb:"一度きり",
  good:`<div class="mock"><div style="display:flex;justify-content:flex-end;margin-bottom:6px"><span style="width:22px;height:22px;border-radius:50%;background:#e8eef5;color:#2d5580;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">?</span></div><div class="mmenu"><div>📖 使い方ガイド</div><div>🔄 チュートリアルをもう一度見る</div><div>💬 お問い合わせ</div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:flex-end;margin-bottom:6px"><span style="width:22px;height:22px;border-radius:50%;background:#e8eef5;color:#2d5580;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">?</span></div><div class="mmenu"><div>💬 お問い合わせ</div><div>📄 利用規約</div></div><div class="ms" style="margin-top:6px">※チュートリアルは初回の一度しか見られない</div></div>`,
  principle:"一度きりの説明は、説明していないのと同じ",
  explain:"チュートリアルは一度で覚えられるものではなく、スキップした人が後から必要になることもあります。「もう一度見る」導線をヘルプメニューに常設しておけば、初回に強制する必要もなくなります。"
},

]};
