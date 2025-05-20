# Test info

- Name: GTDフローモーダルのテスト >> モーダルを開いて「次へ」ボタンが機能することを確認
- Location: C:\Users\chitt\WORK\TaskManager\task-manager\tests\gtdFlowModal.test.ts:4:7

# Error details

```
Error: page.waitForSelector: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('div[role="dialog"]:has-text("それは何か？")') to be visible

    at C:\Users\chitt\WORK\TaskManager\task-manager\tests\gtdFlowModal.test.ts:36:16
```

# Page snapshot

```yaml
- link "GTDフローモーダルを開く":
  - /url: "#"
- main:
  - navigation:
    - button
    - heading "タスクマネージャー" [level=2]:
      - link "タスクマネージャー":
        - /url: /
    - list:
      - listitem:
        - button "収集" [expanded]
        - group "収集":
          - list:
            - listitem:
              - link "インボックス":
                - /url: /inbox
      - listitem:
        - button "処理・整理" [expanded]
        - group "処理・整理":
          - list:
            - listitem:
              - link "すべてのタスク":
                - /url: /
            - listitem:
              - link "次のアクション":
                - /url: /next-actions
            - listitem:
              - link "予定済みタスク":
                - /url: /scheduled
            - listitem:
              - link "待機中タスク":
                - /url: /waiting-on
            - listitem:
              - link "プロジェクト一覧":
                - /url: /projects
      - listitem:
        - button "参照" [expanded]
        - group "参照":
          - list:
            - listitem:
              - link "資料リスト":
                - /url: /reference
            - listitem:
              - link "いつかやるリスト":
                - /url: /someday-maybe
      - listitem:
        - button "レビュー" [expanded]
        - group "レビュー":
          - list:
            - listitem:
              - link "完了済みタスク":
                - /url: /completed
  - heading "インボックス" [level=1]
  - button "新しいタスクを追加"
  - heading "タスク一覧" [level=2]
  - button "ソート基準"
  - button "順序" [disabled]
  - searchbox "タスクを検索"
  - toolbar:
    - 'button "ステータス: すべて"'
    - button "受信箱" [pressed]
    - button "未着手"
    - button "進行中"
    - button "待機中"
    - button "いつかやるリスト"
    - button "参照資料"
    - button "完了"
  - toolbar:
    - 'button "優先度: すべて" [pressed]'
    - 'button "優先度: 低"'
    - 'button "優先度: 中"'
    - 'button "優先度: 高"'
  - list:
    - listitem:
      - button [disabled]
    - listitem:
      - button "1"
    - listitem:
      - button [disabled]
  - text: タスクがありません
  - paragraph: フィルター条件に一致するタスクがないか、タスクが登録されていません。
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('GTDフローモーダルのテスト', () => {
   4 |   test('モーダルを開いて「次へ」ボタンが機能することを確認', async ({ page }) => {
   5 |     // アプリケーションにアクセス
   6 |     await page.goto('http://localhost:3000/inbox');
   7 |     
   8 |     // ページが読み込まれるのを待つ（タイムアウトを増やす）
   9 |     await page.waitForSelector('h1:has-text("インボックス")', { timeout: 60000 });
  10 |     console.log('インボックスページが読み込まれました');
  11 |     
  12 |     // スクリーンショットを撮影してページの構造を確認
  13 |     await page.screenshot({ path: 'inbox-page.png', fullPage: true });
  14 |     console.log('スクリーンショットを撮影しました');
  15 |     
  16 |     // テスト用に直接GTDフローモーダルを開くリンクを作成
  17 |     await page.evaluate(() => {
  18 |       // モーダルを開く関数を実行するリンクを作成
  19 |       const link = document.createElement('a');
  20 |       link.textContent = 'GTDフローモーダルを開く';
  21 |       link.id = 'open-gtd-modal';
  22 |       link.href = '#';
  23 |       link.onclick = () => {
  24 |         // グローバルなステート管理からGTDフローモーダルを開く
  25 |         const event = new CustomEvent('openGtdFlowModal');
  26 |         document.dispatchEvent(event);
  27 |         return false;
  28 |       };
  29 |       document.body.prepend(link);
  30 |     });
  31 |     
  32 |     // 作成したリンクをクリック
  33 |     await page.click('#open-gtd-modal');
  34 |     
  35 |     // モーダルが表示されるのを待つ
> 36 |     await page.waitForSelector('div[role="dialog"]:has-text("それは何か？")');
     |                ^ Error: page.waitForSelector: Test timeout of 60000ms exceeded.
  37 |     
  38 |     // アイテム名を入力
  39 |     await page.fill('input[placeholder="アイテム名を入力"]', 'テストアイテム');
  40 |     
  41 |     // 「次へ」ボタンをクリック
  42 |     console.log('「次へ」ボタンをクリック');
  43 |     await page.click('button:has-text("次へ")');
  44 |     
  45 |     // ステップ2に進むことを確認
  46 |     await page.waitForSelector('div[role="dialog"]:has-text("行動を起こす必要があるか？")');
  47 |     console.log('ステップ2に進みました');
  48 |     
  49 |     // 「はい」を選択
  50 |     await page.click('text=はい');
  51 |     
  52 |     // 「次へ」ボタンをクリック
  53 |     await page.click('button:has-text("次へ")');
  54 |     
  55 |     // ステップ3に進むことを確認
  56 |     await page.waitForSelector('div[role="dialog"]:has-text("次のアクションは1つか複数か？")');
  57 |     console.log('ステップ3に進みました');
  58 |     
  59 |     // 「1つ」を選択
  60 |     await page.click('text=1つ');
  61 |     
  62 |     // 「次へ」ボタンをクリック
  63 |     await page.click('button:has-text("次へ")');
  64 |     
  65 |     // ステップ4に進むことを確認
  66 |     await page.waitForSelector('div[role="dialog"]:has-text("そのアクションは2分以内でできますか？")');
  67 |     console.log('ステップ4に進みました');
  68 |     
  69 |     // 「いいえ」を選択
  70 |     await page.click('text=いいえ');
  71 |     
  72 |     // 「次へ」ボタンをクリック
  73 |     await page.click('button:has-text("次へ")');
  74 |     
  75 |     // ステップ5に進むことを確認
  76 |     await page.waitForSelector('div[role="dialog"]:has-text("自分でやるべきか、誰かに任せるか？")');
  77 |     console.log('ステップ5に進みました');
  78 |     
  79 |     // 「自分でやる」を選択
  80 |     await page.click('text=自分でやる');
  81 |     
  82 |     // 「次へ」ボタンをクリック
  83 |     await page.click('button:has-text("次へ")');
  84 |     
  85 |     // ステップ6に進むことを確認
  86 |     await page.waitForSelector('div[role="dialog"]:has-text("特定の日時が決まっているか？")');
  87 |     console.log('ステップ6に進みました');
  88 |     
  89 |     // テスト成功
  90 |     console.log('テスト成功: GTDフローモーダルの「次へ」ボタンが正しく機能しています');
  91 |   });
  92 | });
  93 |
```