// UX CHOICE LAB — コース1: ネットショップのUX（40問）
window.COURSE_SHOP = {
  id: "shop",
  title: "ネットショップのUX",
  en: "NET SHOP UX",
  desc: "ECサイトの実際のWebパーツを見比べながら、UXの基本判断軸を身につける40問。ボタン文言・フォーム・エラー設計・ナビゲーションなど、あらゆるWebサイトに通じる原則を扱います。",
  minutes: "約20",
  groups: [
    {name:"言葉とCTA", icon:"Aa", note:"迷わせない言葉"},
    {name:"フォーム", icon:"□", note:"入力を助ける"},
    {name:"状態と反応", icon:"↻", note:"今を伝える"},
    {name:"ナビゲーション", icon:"↗", note:"現在地と移動"},
    {name:"アクセシビリティ", icon:"◎", note:"誰でも使える"},
    {name:"信頼と倫理", icon:"◇", note:"誠実な設計"}
  ],
  questions: [
{
  g:"言葉とCTA", cat:"ECサイトの商品詳細",
  title:"商品購入ボタンの文言",
  context:"押すと商品がカートに入ります。どちらが結果を予測しやすいでしょう？",
  la:"「カートに入れる」", lb:"「追加する」",
  good:`<div class="mock"><div class="mprod"><div class="mthumb"></div><div><div class="mtitle">ワイヤレスイヤホン</div><div class="mprice">¥12,800</div></div></div><span class="mb mb-p mb-block">カートに入れる</span></div>`,
  bad:`<div class="mock"><div class="mprod"><div class="mthumb"></div><div><div class="mtitle">ワイヤレスイヤホン</div><div class="mprice">¥12,800</div></div></div><span class="mb mb-p mb-block">追加する</span></div>`,
  principle:"ボタンは『押した後に何が起きるか』まで具体的に書く",
  explain:"「追加する」は何がどこに追加されるのか曖昧です。「カートに入れる」なら押した結果を正確に予測でき、ユーザーは安心してクリックできます。ボタン文言は短さより「行動の結果が分かること」を優先します。"
},
{
  g:"言葉とCTA", cat:"注文確認画面",
  title:"主操作と副操作の見分け方",
  context:"最もしてほしい操作は購入の確定です。ボタンの優先順位が明確なのはどちらでしょう？",
  la:"購入だけを強調", lb:"2つとも同じ強さ",
  good:`<div class="mock"><div class="ms" style="margin-bottom:8px">合計金額：<b style="color:#2b323d;font-size:14px">¥15,400</b>（税込）</div><div class="mrow"><span class="mb mb-g">キャンセル</span><span class="mb mb-p">購入を確定する</span></div></div>`,
  bad:`<div class="mock"><div class="ms" style="margin-bottom:8px">合計金額：<b style="color:#2b323d;font-size:14px">¥15,400</b>（税込）</div><div class="mrow"><span class="mb mb-p">キャンセル</span><span class="mb mb-p">購入を確定する</span></div></div>`,
  principle:"1画面につき、視覚的な主役は原則1つにする",
  explain:"主要アクション（購入）は塗りつぶし、副次アクション（キャンセル）はアウトラインにして強弱をつけるのが原則です。2つとも同じ見た目だと、どちらを押すべきか一瞬迷い、誤操作の原因にもなります。"
},
{
  g:"言葉とCTA", cat:"アカウントの完全削除",
  title:"取り消せない操作の確認",
  context:"復元できない削除操作の最終確認です。誤操作を防ぎやすいのはどちらでしょう？",
  la:"赤い「削除する」", lb:"青い「はい」",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">アカウントを削除しますか？</div><div class="ms" style="margin-bottom:10px">すべてのデータが完全に削除され、元に戻せません。</div><div class="mrow"><span class="mb mb-plain">キャンセル</span><span class="mb mb-danger">削除する</span></div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">アカウントを削除しますか？</div><div class="ms" style="margin-bottom:10px">よろしいですか？</div><div class="mrow"><span class="mb mb-plain">いいえ</span><span class="mb mb-p">はい</span></div></div>`,
  principle:"重要な操作では、汎用語より具体的な動詞を使う",
  explain:"危険な操作のボタンは赤系で警告し、文言は「はい／いいえ」ではなく「削除する」のように操作そのものを書きます。「はい」は質問文を読み直さないと意味が分からず、青い通常ボタンだと危険性も伝わりません。影響範囲（元に戻せない）の明記も重要です。"
},
{
  g:"フォーム", cat:"会員登録フォーム",
  title:"入力中も残るラベル",
  context:"入力した後でも、何の欄かを確認しやすいのはどちらでしょう？",
  la:"欄外にラベルを固定", lb:"プレースホルダーだけ",
  good:`<div class="mock"><label class="ml">氏名</label><input class="mi" value="山田 太郎" readonly><div style="height:8px"></div><label class="ml">メールアドレス</label><input class="mi" placeholder="例：taro@example.com" readonly></div>`,
  bad:`<div class="mock"><input class="mi" placeholder="氏名" readonly><div style="height:8px"></div><input class="mi" placeholder="メールアドレス" readonly></div>`,
  principle:"プレースホルダーをラベルの代わりにしない",
  explain:"プレースホルダーだけをラベル代わりにすると、入力した瞬間に「ここは何の欄だったか」が消えてしまい、確認や修正時に困ります。ラベルは常に見える位置（欄の上）に固定し、プレースホルダーは入力例の提示に使います。"
},
{
  g:"フォーム", cat:"新規登録のパスワード欄",
  title:"入力ミスの伝え方",
  context:"パスワードが条件を満たしていません。修正方法が分かるのはどちらでしょう？",
  la:"原因と直し方を明示", lb:"「エラーが発生しました」",
  good:`<div class="mock"><label class="ml">パスワード</label><input class="mi mi-err" value="abc12" readonly><div class="merr">パスワードは8文字以上で、英字と数字を含めてください</div></div>`,
  bad:`<div class="mock"><label class="ml">パスワード</label><input class="mi mi-err" value="abc12" readonly><div class="merr">エラーが発生しました</div></div>`,
  principle:"エラーは『原因』と『直し方』をセットで伝える",
  explain:"良いエラーメッセージは「何が悪いのか」と「どう直せばよいのか」を具体的に伝えます。「エラーが発生しました」では原因も対処も分からず、ユーザーは試行錯誤を強いられ離脱につながります。"
},
{
  g:"アクセシビリティ", cat:"記事本文のリンク",
  title:"本文中のリンクの見せ方",
  context:"本文の中に関連ページへのリンクがあります。存在に気づけるのはどちらでしょう？",
  la:"色＋下線のリンク", lb:"本文と同じ見た目",
  good:`<div class="mock" style="font-size:13px;color:#2b323d">配送料は地域により異なります。詳しくは<span style="color:#3b6ea5;text-decoration:underline">配送料金一覧</span>をご確認ください。</div>`,
  bad:`<div class="mock" style="font-size:13px;color:#2b323d">配送料は地域により異なります。詳しくは<span style="color:#2b323d">配送料金一覧</span>をご確認ください。</div>`,
  principle:"クリックできる要素は、見ただけで分かるようにする",
  explain:"リンクは「色＋下線」で一目でクリックできると分かるようにします。本文と同じ見た目のリンクは存在に気づかれず、その導線は無いのと同じになります。逆に、リンクでない文字に下線を使うのも避けます。"
},
{
  g:"フォーム", cat:"お問い合わせフォーム",
  title:"必須項目の示し方",
  context:"入力前に必須かどうかが分かるのはどちらでしょう？",
  la:"必須・任意を明示", lb:"送信するまで分からない",
  good:`<div class="mock"><label class="ml">お名前<span class="mtag-req">必須</span></label><input class="mi" readonly><div style="height:8px"></div><label class="ml">電話番号<span class="mtag-opt">任意</span></label><input class="mi" readonly></div>`,
  bad:`<div class="mock"><label class="ml">お名前</label><input class="mi" readonly><div style="height:8px"></div><label class="ml">電話番号</label><input class="mi" readonly><div class="ms" style="margin-top:8px">※必須項目が未入力の場合、送信時にエラーになります</div></div>`,
  principle:"エラーを説明するだけでなく、エラーを未然に防ぐ",
  explain:"どれが必須かを入力前に各項目へ明示すれば、送信してからエラーで差し戻される無駄がなくなります。「送信すれば分かる」方式は、ユーザーに失敗を経験させてから教える最悪のパターンです。"
},
{
  g:"フォーム", cat:"配送先情報の入力",
  title:"電話番号欄の分け方",
  context:"国内の携帯・固定電話を受け付けます。入力しやすいのはどちらでしょう？",
  la:"1つの欄で受け付ける", lb:"3つの欄に分割",
  good:`<div class="mock"><label class="ml">電話番号</label><input class="mi" placeholder="例：09012345678" readonly><div class="ms" style="margin-top:4px">ハイフンなしで入力してください</div></div>`,
  bad:`<div class="mock"><label class="ml">電話番号</label><div style="display:flex;gap:6px;align-items:center"><input class="mi" style="width:30%" placeholder="090" readonly>−<input class="mi" style="width:30%" placeholder="1234" readonly>−<input class="mi" style="width:30%" placeholder="5678" readonly></div></div>`,
  principle:"システム都合の形式より、利用者の自然な入力を優先する",
  explain:"3分割の入力欄は、欄の移動が必要になりコピー＆ペーストもできず、スマホでは特に苦痛です。1つの欄で受け付け、ハイフンの有無などの表記ゆれはシステム側で吸収するのが現代の標準です。"
},
{
  g:"フォーム", cat:"ログイン画面",
  title:"パスワード入力欄の設計",
  context:"入力ミスに自分で気づけるのはどちらでしょう？",
  la:"表示切り替えあり", lb:"マスクのみ",
  good:`<div class="mock"><label class="ml">パスワード</label><div style="position:relative"><input class="mi" type="password" value="password123" readonly style="padding-right:34px"><span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:14px;color:#8d97a3">👁</span></div></div>`,
  bad:`<div class="mock"><label class="ml">パスワード</label><input class="mi" type="password" value="password123" readonly></div>`,
  principle:"ユーザーが自分の入力を確認する手段を奪わない",
  explain:"表示／非表示の切り替え（目のアイコン）があれば、入力ミスに自分で気づけます。マスクしたままだとタイプミスが見えず、ログイン失敗を繰り返す原因になります。特にスマホでは誤入力が多く効果大です。"
},
{
  g:"ナビゲーション", cat:"大規模ECサイトのヘッダー",
  title:"検索ボックスの見せ方",
  context:"数万点の商品を扱うサイトです。検索を使ってもらいやすいのはどちらでしょう？",
  la:"検索窓を常時表示", lb:"アイコンだけに畳む",
  good:`<div class="mock"><div style="display:flex;gap:8px;align-items:center"><b style="font-size:14px;color:#0f2a4a;white-space:nowrap">SHOP</b><div style="flex:1;position:relative"><input class="mi" placeholder="商品名・キーワードで検索" readonly style="padding-left:28px"><span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#8d97a3">🔍</span></div></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px;color:#0f2a4a">SHOP</b><span style="color:#56626f;font-size:16px">🔍</span></div></div>`,
  principle:"よく使う機能は、利用できる空間で常に見えるようにする",
  explain:"商品数が多いサイトでは検索が最重要の導線です。アイコンだけに畳むと利用率が大きく下がることが知られています。入力欄を常時表示し、プレースホルダーで何を検索できるかも示します。省スペース化はモバイルなど制約がある場合の妥協策です。"
},
{
  g:"状態と反応", cat:"3ステップの購入フロー",
  title:"長い手続きの現在地",
  context:"カート→情報入力→確認と進みます。あとどれくらいかを予測しやすいのはどちらでしょう？",
  la:"ステップ表示あり", lb:"現在地が分からない",
  good:`<div class="mock"><div class="msteps"><div class="mstep on">1</div><div class="msline"></div><div class="mstep on">2</div><div class="msline"></div><div class="mstep">3</div></div><div class="ms" style="text-align:center;margin-bottom:8px">お客様情報の入力（2/3）</div><label class="ml">お名前</label><input class="mi" readonly></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:10px">お客様情報の入力</div><label class="ml">お名前</label><input class="mi" readonly></div>`,
  principle:"複数段階の処理では、現在地と残りを見せる",
  explain:"ステップインジケーターがあれば「いま全体のどこにいて、あとどれくらいで終わるか」が分かり、途中離脱が減ります。先が見えない手続きはユーザーに不安と負担を感じさせます。"
},
{
  g:"状態と反応", cat:"未入力があるフォーム",
  title:"送信ボタンの制御",
  context:"必須項目が未入力です。ユーザーが次の行動を取りやすいのはどちらでしょう？",
  la:"押せるボタン＋誘導", lb:"理由のないグレーアウト",
  good:`<div class="mock"><label class="ml">メールアドレス<span class="mtag-req">必須</span></label><input class="mi mi-err" readonly><div class="merr">メールアドレスを入力してください</div><div style="height:10px"></div><span class="mb mb-p mb-block">送信する</span></div>`,
  bad:`<div class="mock"><label class="ml">メールアドレス<span class="mtag-req">必須</span></label><input class="mi" readonly><div style="height:10px"></div><span class="mb mb-gray mb-block">送信する</span></div>`,
  principle:"操作できない理由を、ユーザーに探させない",
  explain:"理由の説明なしにボタンをグレーアウトすると、ユーザーは「なぜ押せないのか」を自分で探すはめになります。ボタンは押せる状態にしておき、押されたら不足箇所を具体的に指摘して誘導する方が親切です。"
},
{
  g:"ナビゲーション", cat:"中小企業サイトのヘッダー",
  title:"グローバルナビの項目数",
  context:"主要ページへ迷わず移動できるのはどちらでしょう？",
  la:"5項目に絞る", lb:"11項目を並べる",
  good:`<div class="mock"><div class="mnav"><span><b>ホーム</b></span><span>サービス</span><span>実績</span><span>会社概要</span><span>お問い合わせ</span></div></div>`,
  bad:`<div class="mock"><div class="mnav" style="font-size:10px;gap:8px"><span><b>ホーム</b></span><span>サービス</span><span>選ばれる理由</span><span>実績</span><span>お客様の声</span><span>料金</span><span>よくある質問</span><span>ブログ</span><span>採用情報</span><span>会社概要</span><span>お問い合わせ</span></div></div>`,
  principle:"選択肢が増えるほど、選ぶ時間は長くなる（ヒックの法則）",
  explain:"選択肢が増えるほど、選ぶのに時間がかかります（ヒックの法則）。グローバルナビは5〜7項目程度に絞り、細かいページは各セクション配下やフッターに整理します。全部を並べるのは「どれも読まれない」結果を招きます。"
},
{
  g:"アクセシビリティ", cat:"文書管理アプリのツールバー",
  title:"アイコンボタンの意味",
  context:"初めて見る人にも操作内容が伝わるのはどちらでしょう？",
  la:"アイコン＋ラベル", lb:"アイコンのみ",
  good:`<div class="mock" style="display:flex;gap:8px;justify-content:center"><span class="micon"><span class="ic">📤</span>共有</span><span class="micon"><span class="ic">📋</span>複製</span><span class="micon"><span class="ic">🗑</span>削除</span></div>`,
  bad:`<div class="mock" style="display:flex;gap:8px;justify-content:center"><span class="micon"><span class="ic">📤</span></span><span class="micon"><span class="ic">📋</span></span><span class="micon"><span class="ic">🗑</span></span></div>`,
  principle:"意味が一意でないアイコンには、言葉を添える",
  explain:"万人が同じ意味に解釈できるアイコンはごくわずか（虫めがね、ゴミ箱など）です。テキストラベルを添えれば迷いや誤操作が減ります。スペースの都合でアイコンのみにする場合も、ツールチップなどの補助は必須です。"
},
{
  g:"信頼と倫理", cat:"決済直前のカート画面",
  title:"支払総額を見せるタイミング",
  context:"納得して購入判断ができるのはどちらでしょう？",
  la:"総額を事前に表示", lb:"送料は最後に判明",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;font-size:13px"><span>商品小計</span><span>¥8,800</span></div><div style="display:flex;justify-content:space-between;font-size:13px"><span>送料</span><span>¥550</span></div><hr class="mhr"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:14px"><span>合計（税込）</span><span style="color:#a83d3d">¥9,350</span></div><div style="height:10px"></div><span class="mb mb-p mb-block">レジに進む</span></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:14px"><span>商品小計</span><span style="color:#a83d3d">¥8,800</span></div><div class="ms" style="margin-top:4px">送料・手数料は最終確認画面で表示されます</div><div style="height:10px"></div><span class="mb mb-p mb-block">レジに進む</span></div>`,
  principle:"意思決定に必要な費用や条件を、後出ししない",
  explain:"カート放棄の最大の理由は「最後に想定外の追加費用が出てくること」です。送料や税を含めた総額をできるだけ早い段階で見せることが、信頼と購入完了率につながります。"
},
{
  g:"状態と反応", cat:"記事一覧の読み込み中",
  title:"待ち時間の見せ方",
  context:"読み込みに2〜3秒かかります。不安を与えにくいのはどちらでしょう？",
  la:"スケルトン表示", lb:"真っ白な画面",
  good:`<div class="mock"><div style="display:flex;gap:10px;margin-bottom:12px"><div class="mthumb" style="background:#eceff3"></div><div style="flex:1"><div class="mskel" style="width:90%"></div><div class="mskel" style="width:60%"></div></div></div><div style="display:flex;gap:10px"><div class="mthumb" style="background:#eceff3"></div><div style="flex:1"><div class="mskel" style="width:85%"></div><div class="mskel" style="width:50%"></div></div></div></div>`,
  bad:`<div class="mock" style="min-height:120px"></div>`,
  principle:"処理中であることと、この後の見通しを画面で伝える",
  explain:"真っ白な画面は「壊れたのでは」という不安を与え、離脱を招きます。スケルトンスクリーン（コンテンツの骨組み表示）なら、読み込み中であることと、この後どんな形の情報が出るかが伝わり、体感待ち時間も短くなります。"
},
{
  g:"状態と反応", cat:"タスク管理アプリの初回起動",
  title:"空の画面の見せ方",
  context:"まだデータが1件もありません。次に何をすればよいか分かるのはどちらでしょう？",
  la:"説明と次の行動", lb:"「データがありません」",
  good:`<div class="mock" style="text-align:center"><div style="font-size:28px;margin-bottom:6px">📝</div><div class="mtitle" style="margin-bottom:4px">まだタスクがありません</div><div class="ms" style="margin-bottom:12px">最初のタスクを追加して始めましょう</div><span class="mb mb-p">＋ タスクを追加</span></div>`,
  bad:`<div class="mock" style="text-align:center;color:#99a3ad;padding:30px 14px">データがありません</div>`,
  principle:"データがない状態にも、説明と次の行動を用意する",
  explain:"「データがありません」は行き止まりの案内です。空の状態こそ、次に何をすべきかを示すチャンスです。状況の説明＋次の行動への導線（CTA）をセットで置くと、初回ユーザーの定着率が大きく変わります。"
},
{
  g:"フォーム", cat:"送信時に2箇所エラー",
  title:"エラーの表示位置",
  context:"長いフォームで2箇所に入力ミスがあります。修正箇所を早く見つけられるのはどちらでしょう？",
  la:"該当欄の直下に表示", lb:"上部にまとめて表示",
  good:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi mi-err" value="taro@" readonly><div class="merr">メールアドレスの形式が正しくありません</div><div style="height:8px"></div><label class="ml">郵便番号</label><input class="mi mi-err" value="123" readonly><div class="merr">郵便番号は7桁で入力してください</div></div>`,
  bad:`<div class="mock"><div style="background:#f6e9e9;border:1px solid #e8cfcf;border-radius:5px;padding:8px 10px;font-size:11px;color:#a83d3d;margin-bottom:10px">入力内容に2件のエラーがあります。ご確認ください。</div><label class="ml">メールアドレス</label><input class="mi" value="taro@" readonly><div style="height:8px"></div><label class="ml">郵便番号</label><input class="mi" value="123" readonly></div>`,
  principle:"エラーは『発生した場所』の近くに示す",
  explain:"エラーはページ上部にまとめるだけでなく、必ず該当欄の直近に赤枠＋メッセージで示します。「2件のエラーがあります」だけでは、どこを直せばいいのかユーザーが自力で探す羽目になります。"
},
{
  g:"アクセシビリティ", cat:"スマホのキャンペーンモーダル",
  title:"閉じるボタンの大きさ",
  context:"片手操作でも押し間違えにくいのはどちらでしょう？",
  la:"押しやすい大きさ", lb:"極小の✕",
  good:`<div class="mock mdlgwrap" style="padding-top:14px"><span class="mclose" style="width:32px;height:32px;font-size:16px">✕</span><div class="mtitle" style="margin-bottom:4px;padding-right:30px">夏のセール開催中</div><div class="ms">対象商品が最大50%OFF</div></div>`,
  bad:`<div class="mock mdlgwrap" style="padding-top:14px"><span class="mclose" style="width:14px;height:14px;font-size:8px">✕</span><div class="mtitle" style="margin-bottom:4px;padding-right:20px">夏のセール開催中</div><div class="ms">対象商品が最大50%OFF</div></div>`,
  principle:"タッチ対象は十分な大きさと間隔を確保する",
  explain:"タッチ操作の対象は最低44×44px程度が推奨です（Apple/Googleのガイドライン）。極小の✕ボタンは押しづらいだけでなく、「わざと閉じにくくしている」ダークパターンと受け取られ、ブランドの信頼を損ないます。"
},
{
  g:"アクセシビリティ", cat:"白背景の記事本文",
  title:"本文テキストの色",
  context:"明るい場所や視力が弱い人にも読みやすいのはどちらでしょう？",
  la:"十分なコントラスト", lb:"薄いグレー文字",
  good:`<div class="mock" style="color:#2b323d;font-size:13px">当社は2015年の創業以来、中小企業向けの経営支援サービスを提供してまいりました。現在は全国1,200社のお客様にご利用いただいています。</div>`,
  bad:`<div class="mock" style="color:#c2c6cc;font-size:13px">当社は2015年の創業以来、中小企業向けの経営支援サービスを提供してまいりました。現在は全国1,200社のお客様にご利用いただいています。</div>`,
  principle:"美しさのために、読めることを犠牲にしない",
  explain:"本文テキストは背景とのコントラスト比4.5:1以上が基準（WCAG AA）です。薄いグレーは「おしゃれ」に見えても、明るい屋外のスマホや高齢のユーザーには読めません。読めないデザインは存在しないのと同じです。"
},
{
  g:"フォーム", cat:"ブログのメルマガ登録",
  title:"フォームの項目数",
  context:"メルマガ登録が目的です。完了率が高いのはどちらでしょう？",
  la:"メールアドレスだけ", lb:"5項目を要求",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">最新記事をメールでお届け</div><label class="ml">メールアドレス</label><input class="mi" placeholder="例：taro@example.com" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">登録する</span></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">最新記事をメールでお届け</div><label class="ml">氏名</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">会社名</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">役職</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">電話番号</label><input class="mi" readonly><div style="height:6px"></div><label class="ml">メールアドレス</label><input class="mi" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">登録する</span></div>`,
  principle:"目的に不要な入力項目を足さない",
  explain:"フォームの項目が1つ増えるごとに完了率は下がります。メルマガ登録の目的に必要なのはメールアドレスだけです。「ついでに聞きたい」情報のためにコンバージョンを犠牲にしてはいけません。"
},
{
  g:"状態と反応", cat:"カート追加ボタンを押した直後",
  title:"操作へのフィードバック",
  context:"商品一覧でカートに追加しました。操作が成功したと分かるのはどちらでしょう？",
  la:"トースト＋バッジ更新", lb:"何も変化しない",
  good:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:13px;color:#0f2a4a">SHOP</b><span class="mbadge" style="font-size:16px">🛒<span class="bnum">1</span></span></div><div class="mtoast"><span>✓ カートに追加しました</span><a>カートを見る</a></div></div>`,
  bad:`<div class="mock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:13px;color:#0f2a4a">SHOP</b><span style="font-size:16px">🛒</span></div><div class="mprod" style="margin:0"><div class="mthumb"></div><div><div class="mtitle">ワイヤレスイヤホン</div><div class="mprice">¥12,800</div></div></div></div>`,
  principle:"操作に対して、即時で目に見える反応を返す",
  explain:"ボタンを押しても画面に何の変化もないと、ユーザーは「押せていないのでは」と何度も押したり、ページを離れたりします。トースト通知＋カートバッジの更新で、操作が成功したことを即座に伝えます。"
},
{
  g:"信頼と倫理", cat:"会員登録のメルマガ購読",
  title:"同意の取り方",
  context:"メルマガ購読のチェックボックスです。本人の意思を正しく反映するのはどちらでしょう？",
  la:"未チェックから選ぶ", lb:"最初からチェック済み",
  good:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" readonly><div class="mchk"><input type="checkbox" disabled><span>お得な情報やキャンペーンのお知らせを受け取る（任意）</span></div><div style="height:10px"></div><span class="mb mb-p mb-block">登録する</span></div>`,
  bad:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" readonly><div class="mchk"><input type="checkbox" checked disabled><span>お得な情報やキャンペーンのお知らせを受け取る</span></div><div style="height:10px"></div><span class="mb mb-p mb-block">登録する</span></div>`,
  principle:"同意は、理解した上での明確な選択として得る",
  explain:"最初からチェックを入れておき「気づかず同意させる」のはダークパターンの代表例です。短期的には登録数が増えても、迷惑メール報告や解約、ブランド不信につながります。ユーザーの積極的な同意（オプトイン）を基本にします。"
},
{
  g:"フォーム", cat:"配送先住所の入力",
  title:"住所入力の支援",
  context:"入力の手間とミスを減らせるのはどちらでしょう？",
  la:"住所を自動入力", lb:"すべて手入力",
  good:`<div class="mock"><label class="ml">郵便番号</label><div style="display:flex;gap:8px"><input class="mi" style="width:50%" value="1500001" readonly><span class="mb mb-g" style="white-space:nowrap;padding:8px 12px">住所を自動入力</span></div><div style="height:8px"></div><label class="ml">住所</label><input class="mi" value="東京都渋谷区神宮前" readonly></div>`,
  bad:`<div class="mock"><label class="ml">郵便番号</label><input class="mi" style="width:50%" value="1500001" readonly><div style="height:8px"></div><label class="ml">住所</label><input class="mi" placeholder="都道府県から全て入力してください" readonly></div>`,
  principle:"機械にできることを、人間に手入力させない",
  explain:"郵便番号からの住所自動入力は、入力の手間とミス（誤字・表記ゆれ）を同時に減らせる定番の支援機能です。機械にできることを人間に手入力させないのが原則です。"
},
{
  g:"言葉とCTA", cat:"資料ダウンロードフォーム",
  title:"送信ボタンの言葉",
  context:"サービス紹介資料を無料でダウンロードできます。押す価値が伝わるのはどちらでしょう？",
  la:"価値が伝わる文言", lb:"「送信」",
  good:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">無料で資料をダウンロード</span><div class="ms" style="text-align:center;margin-top:6px">営業の電話は行いません</div></div>`,
  bad:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">送信</span></div>`,
  principle:"CTAには作業名ではなく、得られる価値を書く",
  explain:"「送信」はユーザーの作業を表す言葉で、得られる価値を何も伝えません。「無料で資料をダウンロード」なら押した先のメリットが明確です。不安を打ち消す一言（営業電話なし等）を添えるとさらに効果的です。"
},
{
  g:"ナビゲーション", cat:"階層の深い商品ページ",
  title:"現在地と上位階層の表示",
  context:"「家電 > オーディオ > イヤホン」と辿ったページです。関連カテゴリへ戻りやすいのはどちらでしょう？",
  la:"パンくずリストあり", lb:"現在地の表示なし",
  good:`<div class="mock"><div class="mcrumb">ホーム ＞ 家電 ＞ オーディオ ＞ <b>ワイヤレスイヤホン XZ-30</b></div><div class="mprod" style="margin:0"><div class="mthumb"></div><div><div class="mtitle">ワイヤレスイヤホン XZ-30</div><div class="mprice">¥12,800</div></div></div></div>`,
  bad:`<div class="mock"><div class="mprod" style="margin:0"><div class="mthumb"></div><div><div class="mtitle">ワイヤレスイヤホン XZ-30</div><div class="mprice">¥12,800</div></div></div></div>`,
  principle:"深い情報構造では、階層と上位への経路を見せる",
  explain:"階層が深いサイトでは、パンくずリストが「いまどこにいるか」を示し、1階層上（イヤホン一覧など）へ戻って比較する動きを支えます。検索エンジンから直接着地したユーザーの回遊にも効きます。"
},
{
  g:"状態と反応", cat:"メールを1通削除（復元可能）",
  title:"軽い操作の取り消し",
  context:"ゴミ箱から復元できる操作です。作業の流れを妨げにくいのはどちらでしょう？",
  la:"すぐ実行＋元に戻す", lb:"毎回確認ダイアログ",
  good:`<div class="mock"><div style="font-size:12px;color:#56626f;padding:6px 4px;border-bottom:1px solid #eef1f4">📧 会議の議事録につ…</div><div style="font-size:12px;color:#56626f;padding:6px 4px">📧 請求書のご送付</div><div class="mtoast"><span>1件をゴミ箱に移動しました</span><a>元に戻す</a></div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:4px;font-size:13px">メールを削除しますか？</div><div class="ms" style="margin-bottom:10px">このメールをゴミ箱に移動します。よろしいですか？</div><div class="mrow"><span class="mb mb-plain">キャンセル</span><span class="mb mb-p">OK</span></div></div>`,
  principle:"可逆で低リスクな操作は、確認より『元に戻す』で守る",
  explain:"復元できる軽い操作に毎回確認ダイアログを出すと、ユーザーは読まずにOKを押す癖がつき、本当に重要な確認まで素通りされます。すぐ実行して「元に戻す」を提示する方が、速くて安全です。確認ダイアログは復元不能な操作にとっておきます。"
},
{
  g:"ナビゲーション", cat:"マイページのタブ",
  title:"選択中タブの表示",
  context:"「注文履歴」タブを開いています。いまどこを見ているか分かるのはどちらでしょう？",
  la:"選択中タブを強調", lb:"全タブ同じ見た目",
  good:`<div class="mock"><div class="mtabs"><span class="mtab on">注文履歴</span><span class="mtab">お気に入り</span><span class="mtab">設定</span></div><div class="ms">2026年8月10日　ワイヤレスイヤホン XZ-30</div></div>`,
  bad:`<div class="mock"><div class="mtabs"><span class="mtab">注文履歴</span><span class="mtab">お気に入り</span><span class="mtab">設定</span></div><div class="ms">2026年8月10日　ワイヤレスイヤホン XZ-30</div></div>`,
  principle:"いま選択されている状態を、常に見えるようにする",
  explain:"どのタブが選択中か分からないと、ユーザーは表示中の内容が何なのか判断できません。選択中のタブは色・太字・下線などで明確に区別します。「現在地」を常に示すのはナビゲーション設計の基本です。"
},
{
  g:"アクセシビリティ", cat:"不動産サイトの価格表示",
  title:"大きな数字の見せ方",
  context:"物件価格の表示です。金額の規模を一目で把握できるのはどちらでしょう？",
  la:"カンマ区切り", lb:"桁区切りなし",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:2px">中古マンション 渋谷区 2LDK</div><div class="mprice" style="font-size:18px">¥52,800,000</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:2px">中古マンション 渋谷区 2LDK</div><div class="mprice" style="font-size:18px">¥52800000</div></div>`,
  principle:"大きな数字は、桁が読み取れる形で示す",
  explain:"桁区切りのない数字は、桁を数えないと金額が把握できません。3桁ごとのカンマ区切り（または「5,280万円」のような単位表記）で、一目で規模が分かるようにします。金額・数量など大きな数字は常に桁区切りが原則です。"
},
{
  g:"ナビゲーション", cat:"複数ステップの申込みフォーム",
  title:"「戻る／次へ」の配置",
  context:"ウィザード形式の画面下部です。直感に合うのはどちらでしょう？",
  la:"進む＝右・戻る＝左", lb:"左右が逆",
  good:`<div class="mock"><label class="ml">生年月日</label><input class="mi" readonly><div style="height:12px"></div><div style="display:flex;justify-content:space-between"><span class="mb mb-plain">← 戻る</span><span class="mb mb-p">次へ進む →</span></div></div>`,
  bad:`<div class="mock"><label class="ml">生年月日</label><input class="mi" readonly><div style="height:12px"></div><div style="display:flex;justify-content:space-between"><span class="mb mb-p">次へ進む →</span><span class="mb mb-plain">← 戻る</span></div></div>`,
  principle:"ユーザーの頭の中の地図（メンタルモデル）と一致させる",
  explain:"「進む＝右、戻る＝左」が多くのユーザーの頭の中の地図（メンタルモデル）です。位置を逆にすると、慣れで右側を押すユーザーが誤って戻ってしまい、入力内容の喪失など深刻なストレスにつながります。"
},
{
  g:"ナビゲーション", cat:"スマホの長い商品ページ",
  title:"購入ボタンの置き方",
  context:"縦に長い商品詳細ページです。買いたくなった瞬間を逃さないのはどちらでしょう？",
  la:"下部固定の購入バー", lb:"最下部に1つだけ",
  good:`<div class="mock" style="padding-bottom:0"><div class="mtitle">ワイヤレスイヤホン XZ-30</div><div class="ms" style="margin:4px 0 10px">高音質・ノイズキャンセリング搭載。連続再生28時間…（以下レビュー・仕様が続く）</div><div style="margin:0 -14px;border-top:1px solid #dde3e8;background:#fff;padding:8px 14px;display:flex;gap:8px;align-items:center;box-shadow:0 -4px 10px rgba(15,42,74,.08);border-radius:0 0 8px 8px"><span class="mprice" style="white-space:nowrap">¥12,800</span><span class="mb mb-p" style="flex:1">カートに入れる</span></div></div>`,
  bad:`<div class="mock"><div class="mtitle">ワイヤレスイヤホン XZ-30</div><div class="ms" style="margin:4px 0 10px">高音質・ノイズキャンセリング搭載。連続再生28時間…（レビュー・仕様・関連商品がずっと続き、ボタンはページの一番下に1つだけ）</div><div class="mskel" style="width:100%"></div><div class="mskel" style="width:90%"></div><div class="mskel" style="width:95%"></div></div>`,
  principle:"主要アクションには、どの位置からでも届くようにする",
  explain:"長いページでは、読み終わった位置がどこであっても買えるように、購入ボタンを画面下部に固定表示（スティッキーCTA)するのが定石です。ページ最下部にしかないボタンは「買いたくなった瞬間」を逃します。"
},
{
  g:"フォーム", cat:"ホテル予約の宿泊日",
  title:"日付の入力方式",
  context:"1〜2か月先の宿泊日を選びます。適した入力方式はどちらでしょう？",
  la:"カレンダーで選ぶ", lb:"手入力のみ",
  good:`<div class="mock"><label class="ml">チェックイン日</label><table class="mcal"><tr><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr><tr><td>17</td><td>18</td><td>19</td><td class="sel">20</td><td class="rng">21</td><td class="sel">22</td><td>23</td></tr><tr><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td></tr></table></div>`,
  bad:`<div class="mock"><label class="ml">チェックイン日</label><input class="mi" placeholder="yyyy/mm/dd 形式で入力" readonly><div style="height:8px"></div><label class="ml">チェックアウト日</label><input class="mi" placeholder="yyyy/mm/dd 形式で入力" readonly></div>`,
  principle:"データの性質に合わせて入力方式を選ぶ",
  explain:"近い将来の日付は「曜日と組み合わせて」選ぶため、カレンダー表示が最適です。空室状況や料金もその場に載せられます。逆に生年月日のような遠い過去の日付は、カレンダーを何十年も遡るのは苦痛なので直接入力が適切です。"
},
{
  g:"状態と反応", cat:"存在しないURLへのアクセス",
  title:"404エラー画面の設計",
  context:"リンク切れで404エラーになりました。ユーザーが立て直しやすいのはどちらでしょう？",
  la:"検索と導線を用意", lb:"「404」だけ",
  good:`<div class="mock" style="text-align:center"><div style="font-size:24px;font-weight:700;color:#0f2a4a;margin-bottom:4px">404</div><div class="mtitle" style="margin-bottom:4px">ページが見つかりません</div><div class="ms" style="margin-bottom:10px">移動または削除された可能性があります</div><input class="mi" placeholder="🔍 サイト内を検索" readonly><div style="height:8px"></div><span class="mb mb-g">トップページへ戻る</span></div>`,
  bad:`<div class="mock" style="text-align:center;padding:36px 14px"><div style="font-size:14px;color:#56626f;font-family:monospace">404 Not Found</div></div>`,
  principle:"失敗状態には、回復できる具体的な選択肢を添える",
  explain:"素の「404 Not Found」はユーザーをサイトの外へ追い返す行き止まりです。何が起きたかの説明＋検索窓＋トップへの導線を用意すれば、目的のページへ再挑戦してもらえます。エラー画面は離脱防止の最後のチャンスです。"
},
{
  g:"信頼と倫理", cat:"ECサイトの通知機能",
  title:"通知許可を求めるタイミング",
  context:"配送状況の通知を使ってもらいたい場面です。納得して判断できるのはどちらでしょう？",
  la:"価値を説明してから", lb:"開いた瞬間に許可要求",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:4px">📦 配送状況をお知らせします</div><div class="ms" style="margin-bottom:10px">発送・配達完了のタイミングで通知が届きます。</div><div class="mrow"><span class="mb mb-plain">今はしない</span><span class="mb mb-p">通知を受け取る</span></div></div>`,
  bad:`<div class="mock"><div style="border:1px solid #c9ced4;border-radius:6px;padding:10px;background:#f8f9fb"><div style="font-size:11px;color:#56626f;margin-bottom:6px"><b>shop.example.com</b> が次の許可を求めています</div><div style="font-size:12px;margin-bottom:8px">🔔 通知の表示</div><div class="mrow" style="margin:0"><span class="mb mb-plain" style="padding:5px 12px;font-size:11px">ブロック</span><span class="mb mb-p" style="padding:5px 12px;font-size:11px">許可</span></div></div><div class="ms" style="margin-top:6px">※サイトを開いた瞬間に表示</div></div>`,
  principle:"権限は、必要性が理解できる文脈とタイミングで求める",
  explain:"開いた瞬間にブラウザの許可ダイアログを出すと、大半のユーザーは反射的にブロックし、一度ブロックされると再依頼は困難です。先に自前のUIで「何のための通知か」を説明し、同意を得てからOS/ブラウザのダイアログを出す2段階方式が定石です。"
},
{
  g:"フォーム", cat:"電話番号に全角で入力",
  title:"表記ゆれの扱い",
  context:"「０９０…」と全角で入力されました。親切なのはどちらでしょう？",
  la:"自動で半角に変換", lb:"エラーで差し戻す",
  good:`<div class="mock"><label class="ml">電話番号</label><input class="mi" value="09012345678" readonly><div class="mok">✓ 全角数字は自動で半角に変換されます</div></div>`,
  bad:`<div class="mock"><label class="ml">電話番号</label><input class="mi mi-err" value="０９０１２３４５６７８" readonly><div class="merr">半角数字で入力してください</div></div>`,
  principle:"機械が直せる表記ゆれを、エラーにしない",
  explain:"全角/半角、ハイフンや空白の有無は、機械が一瞬で変換できる表記ゆれです。それをエラーにして人間に直させるのは、コンピューターの仕事の押し付けです。受け付けてから正規化するのが親切な設計です。"
},
{
  g:"状態と反応", cat:"申込みフォームの送信中",
  title:"送信中のフィードバック",
  context:"通信に2〜3秒かかります。二重送信を防げるのはどちらでしょう？",
  la:"「送信中…」＋無効化", lb:"見た目が変わらない",
  good:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" value="taro@example.com" readonly><div style="height:10px"></div><span class="mb mb-gray mb-block">⏳ 送信中です…</span><div class="ms" style="text-align:center;margin-top:4px">そのままお待ちください</div></div>`,
  bad:`<div class="mock"><label class="ml">メールアドレス</label><input class="mi" value="taro@example.com" readonly><div style="height:10px"></div><span class="mb mb-p mb-block">送信する</span><div class="ms" style="text-align:center;margin-top:4px">※押しても見た目が変わらない</div></div>`,
  principle:"処理中は状態を見せて、二重送信を防ぐ",
  explain:"押した後に何も変化がないと、ユーザーは「押せていない」と思ってもう一度押し、二重注文・二重送信の事故になります。送信中はボタンを無効化し、「送信中…」と状態を表示するのが必須の作法です。"
},
{
  g:"アクセシビリティ", cat:"管理画面の売上一覧",
  title:"金額が並ぶ表の揃え方",
  context:"数値の大小を比較しやすいのはどちらでしょう？",
  la:"右揃え", lb:"中央揃え",
  good:`<div class="mock"><table class="mtbl"><tr><th>支店</th><th style="text-align:right">売上高</th></tr><tr><td>東京本店</td><td class="num">128,400,000</td></tr><tr><td>大阪支店</td><td class="num">86,200,000</td></tr><tr><td>名古屋支店</td><td class="num">9,850,000</td></tr></table></div>`,
  bad:`<div class="mock"><table class="mtbl"><tr><th>支店</th><th style="text-align:center">売上高</th></tr><tr><td>東京本店</td><td class="cen">128,400,000</td></tr><tr><td>大阪支店</td><td class="cen">86,200,000</td></tr><tr><td>名古屋支店</td><td class="cen">9,850,000</td></tr></table></div>`,
  principle:"表の数値は右揃えで、桁の位置を揃える",
  explain:"数値を右揃えにすると桁の位置が揃い、どの行が大きいか一目で比較できます。中央揃えや左揃えでは桁がずれて、1億と985万の差すら読み取りにくくなります。表の数値は右揃え、文字列は左揃えが基本です。"
},
{
  g:"状態と反応", cat:"商品検索で0件",
  title:"見つからなかった時の案内",
  context:"「ワイアレスイアホン」と検索され、結果は0件でした。立て直しやすいのはどちらでしょう？",
  la:"候補と導線を提示", lb:"「0件」だけ",
  good:`<div class="mock"><div class="ms" style="margin-bottom:8px">「ワイアレスイアホン」の検索結果：0件</div><div style="font-size:12px;margin-bottom:8px">もしかして：<span style="color:#3b6ea5;text-decoration:underline">ワイヤレスイヤホン</span></div><div class="ms" style="margin-bottom:6px">人気のカテゴリから探す</div><div style="display:flex;gap:6px;flex-wrap:wrap"><span class="mb mb-plain" style="padding:4px 10px;font-size:11px">イヤホン</span><span class="mb mb-plain" style="padding:4px 10px;font-size:11px">スピーカー</span></div></div>`,
  bad:`<div class="mock" style="text-align:center;padding:30px 14px"><div class="ms">検索結果：0件</div></div>`,
  principle:"ゼロ件を行き止まりにしない",
  explain:"0件表示だけではユーザーの目的は消えていないのに導線が断たれます。表記ゆれの候補提示（もしかして）、カテゴリや人気商品への誘導など、探し直しの手がかりをその場で渡すことで、離脱を防げます。"
},
{
  g:"フォーム", cat:"経営ツールの金額入力",
  title:"単位の見せ方",
  context:"年間保険料を万円単位で入力します。桁の間違いを防げるのはどちらでしょう？",
  la:"単位を欄外に固定", lb:"プレースホルダーのみ",
  good:`<div class="mock"><label class="ml">年間保険料</label><div class="msuffix"><input class="mi" value="3,000" readonly><span class="sfx">万円</span></div></div>`,
  bad:`<div class="mock"><label class="ml">年間保険料</label><input class="mi" placeholder="金額を万円単位で入力" value="3,000" readonly><div class="ms" style="margin-top:4px">※単位はプレースホルダーにのみ記載</div></div>`,
  principle:"単位は入力中も確認時も、常に見えるようにする",
  explain:"単位をプレースホルダーだけに書くと、入力した瞬間に見えなくなり、「3,000円？3,000万円？」の事故が起きます。単位は入力欄の外側（右横）に固定表示して、入力中も確認時も常に見えるようにします。桁を間違えると致命的な金額入力では特に重要です。"
},
{
  g:"言葉とCTA", cat:"リフォーム会社のスマホサイト",
  title:"電話問い合わせの導線",
  context:"電話相談を促したい場面です。電話への心理的ハードルが低いのはどちらでしょう？",
  la:"タップで発信ボタン", lb:"番号のテキストのみ",
  good:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">お見積り・ご相談無料</div><span class="mb mb-p mb-block">📞 電話で相談する</span><div class="ms" style="text-align:center;margin-top:6px">タップで発信 ／ 受付 9:00〜18:00</div></div>`,
  bad:`<div class="mock"><div class="mtitle" style="margin-bottom:8px">お見積り・ご相談無料</div><div class="ms">お電話でのお問い合わせはこちら</div><div style="font-size:12px;color:#56626f;margin-top:2px">TEL：03-1234-5678（受付 9:00〜18:00）</div></div>`,
  principle:"デバイスの能力（タップ発信）を活かした導線にする",
  explain:"スマホでは電話番号をタップ発信ボタン（telリンク）にするのが基本です。番号がただのテキストだと、ユーザーは番号を暗記またはコピーして電話アプリに貼り付ける手間を強いられます。ボタン化＋受付時間の明記で、電話への心理的ハードルも下がります。"
},

]};
