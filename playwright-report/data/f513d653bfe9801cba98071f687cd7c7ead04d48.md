# Test info

- Name: GTDフローモーダル Issue #94 テスト >> ステップ1で「次へ」ボタンを押すとステップ2に進むことを確認
- Location: C:\Users\chitt\WORK\TaskManager\task-manager\tests\gtdflow-issue-94.test.ts:4:7

# Error details

```
Error: page.waitForSelector: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('div[role="dialog"]:has-text("それは何か？")') to be visible

    at C:\Users\chitt\WORK\TaskManager\task-manager\tests\gtdflow-issue-94.test.ts:33:16
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
   3 | test.describe('GTDフローモーダル Issue #94 テスト', () => {
   4 |   test('ステップ1で「次へ」ボタンを押すとステップ2に進むことを確認', async ({ page }) => {
   5 |     // アプリケーションにアクセス
   6 |     await page.goto('http://localhost:3000/inbox');
   7 |     
   8 |     // ページが読み込まれるのを待つ（タイムアウトを増やす）
   9 |     await page.waitForSelector('h1:has-text("インボックス")', { timeout: 60000 });
  10 |     console.log('インボックスページが読み込まれました');
  11 |     await page.screenshot({ path: 'gtdflow-issue94-inbox-page.png' });
  12 |     
  13 |     // テスト用に直接GTDフローモーダルを開くリンクを作成
  14 |     await page.evaluate(() => {
  15 |       // モーダルを開く関数を実行するリンクを作成
  16 |       const link = document.createElement('a');
  17 |       link.textContent = 'GTDフローモーダルを開く';
  18 |       link.id = 'open-gtd-modal';
  19 |       link.href = '#';
  20 |       link.onclick = () => {
  21 |         // グローバルなステート管理からGTDフローモーダルを開く
  22 |         const event = new CustomEvent('openGtdFlowModal');
  23 |         document.dispatchEvent(event);
  24 |         return false;
  25 |       };
  26 |       document.body.prepend(link);
  27 |     });
  28 |     
  29 |     // 作成したリンクをクリック
  30 |     await page.click('#open-gtd-modal');
  31 |     
  32 |     // モーダルが表示されるのを待つ
> 33 |     await page.waitForSelector('div[role="dialog"]:has-text("それは何か？")');
     |                ^ Error: page.waitForSelector: Test timeout of 60000ms exceeded.
  34 |     await page.screenshot({ path: 'gtdflow-issue94-step1.png' });
  35 |     console.log('GTDフローモーダルが開きました');
  36 |     
  37 |     // コンソールログを確認するためのリスナーを設定
  38 |     page.on('console', msg => {
  39 |       console.log(`ブラウザコンソール: ${msg.text()}`);
  40 |     });
  41 |     
  42 |     // アイテム名を入力
  43 |     await page.fill('input[placeholder="アイテム名を入力"]', 'Issue #94 テスト');
  44 |     await page.screenshot({ path: 'gtdflow-issue94-step1-filled.png' });
  45 |     
  46 |     // 「次へ」ボタンをクリック
  47 |     console.log('「次へ」ボタンをクリック');
  48 |     await page.click('button:has-text("次へ")');
  49 |     
  50 |     // 少し待機してコンソールログを確認
  51 |     await page.waitForTimeout(1000);
  52 |     await page.screenshot({ path: 'gtdflow-issue94-after-next-click.png' });
  53 |     
  54 |     // ステップ2に進むことを確認
  55 |     await page.waitForSelector('div[role="dialog"]:has-text("行動を起こす必要があるか？")', { timeout: 5000 });
  56 |     await page.screenshot({ path: 'gtdflow-issue94-step2.png' });
  57 |     console.log('ステップ2に進みました');
  58 |     
  59 |     // テスト成功
  60 |     console.log('テスト成功: ステップ1から2への遷移が正常に行われました');
  61 |   });
  62 | });
  63 |
```