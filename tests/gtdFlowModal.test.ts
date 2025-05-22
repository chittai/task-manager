import { test, expect } from '@playwright/test';

test.describe('GTDフローモーダルのテスト', () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('http://localhost:3000/inbox');
    
    // ページが読み込まれるのを待つ（タイムアウトを増やす）
    await page.waitForSelector('h1:has-text("インボックス")', { timeout: 60000 });
    console.log('インボックスページが読み込まれました');
    
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
    await page.screenshot({ path: 'gtdflow-step1.png' });
    console.log('GTDフローモーダルが開きました');
  });
  test('モーダルを開いて「次へ」ボタンが機能することを確認', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('http://localhost:3000/inbox');
    
    // ページが読み込まれるのを待つ（タイムアウトを増やす）
    await page.waitForSelector('h1:has-text("インボックス")', { timeout: 60000 });
    console.log('インボックスページが読み込まれました');
    
    // スクリーンショットを撮影してページの構造を確認
    await page.screenshot({ path: 'inbox-page.png', fullPage: true });
    console.log('スクリーンショットを撮影しました');
    
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
    
    // アイテム名を入力
    await page.fill('input[placeholder="アイテム名を入力"]', 'テストアイテム');
    
    // 「次へ」ボタンをクリック
    console.log('「次へ」ボタンをクリック');
    await page.click('button:has-text("次へ")');
    
    // ステップ2に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("行動を起こす必要があるか？")');
    console.log('ステップ2に進みました');
    
    // 「はい」を選択
    await page.click('text=はい');
    
    // 「次へ」ボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // ステップ3に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("次のアクションは1つか複数か？")');
    console.log('ステップ3に進みました');
    
    // 「1つ」を選択
    await page.click('text=1つ');
    
    // 「次へ」ボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // ステップ4に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("そのアクションは2分以内でできますか？")');
    console.log('ステップ4に進みました');
    
    // 「いいえ」を選択
    await page.click('text=いいえ');
    
    // 「次へ」ボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // ステップ5に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("自分でやるべきか、誰かに任せるか？")');
    console.log('ステップ5に進みました');
    
    // 「自分でやる」を選択
    await page.click('text=自分でやる');
    
    // 「次へ」ボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // ステップ6に進むことを確認
    await page.waitForSelector('div[role="dialog"]:has-text("特定の日時が決まっているか？")');
    console.log('ステップ6に進みました');
    
    // テスト成功
    console.log('テスト成功: GTDフローモーダルの「次へ」ボタンが正しく機能しています');
  });
});
