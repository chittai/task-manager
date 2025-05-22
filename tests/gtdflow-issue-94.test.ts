import { test, expect } from '@playwright/test';

test.describe('GTDフローモーダル Issue #94 テスト', () => {
  test('ステップ1で「次へ」ボタンを押すとステップ2に進むことを確認', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('http://localhost:3000/inbox');
    
    // ページが読み込まれるのを待つ（タイムアウトを増やす）
    await page.waitForSelector('h1:has-text("インボックス")', { timeout: 60000 });
    console.log('インボックスページが読み込まれました');
    await page.screenshot({ path: 'gtdflow-issue94-inbox-page.png' });
    
    // テスト用に直接GTDフローモーダルを開くリンクを作成
    await page.evaluate(() => {
      // モーダルを開く関数を実行するリンクを作成
      const link = document.createElement('a');
      link.textContent = 'GTDフローモーダルを開く';
      link.id = 'open-gtd-modal';
      link.href = '#';
      link.onclick = () => {
        // グローバルなステート管理からGTDフローモーダルを開く
        const event = new CustomEvent('openGtdFlowModal');
        document.dispatchEvent(event);
        return false;
      };
      document.body.prepend(link);
    });
    
    // 作成したリンクをクリック
    await page.click('#open-gtd-modal');
    
    // モーダルが表示されるのを待つ
    await page.waitForSelector('div[role="dialog"]:has-text("それは何か？")');
    await page.screenshot({ path: 'gtdflow-issue94-step1.png' });
    console.log('GTDフローモーダルが開きました');
    
    // コンソールログを確認するためのリスナーを設定
    page.on('console', msg => {
      console.log(`ブラウザコンソール: ${msg.text()}`);
    });
    
    // アイテム名を入力
    await page.fill('input[placeholder="アイテム名を入力"]', 'Issue #94 テスト');
    await page.screenshot({ path: 'gtdflow-issue94-step1-filled.png' });
    
    // 「次へ」ボタンをクリック
    console.log('「次へ」ボタンをクリック');
    await page.click('button:has-text("次へ")');
    
    // 少し待機してコンソールログを確認
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'gtdflow-issue94-after-next-click.png' });
    
    // ステップ2に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("行動を起こす必要があるか？")', { timeout: 5000 });
    await page.screenshot({ path: 'gtdflow-issue94-step2.png' });
    console.log('ステップ2に進みました');
    
    // テスト成功
    console.log('テスト成功: ステップ1から2への遷移が正常に行われました');
  });
});
