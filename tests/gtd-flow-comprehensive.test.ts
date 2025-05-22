import { test, expect } from '@playwright/test';

/**
 * GTDフロー包括的テストスイート
 * 全ての可能なフローパターンをテストします
 */

test.describe('GTDフロー - 包括的テスト', () => {
  
  // テスト用のタスクデータ
  const testTask = {
    id: 'test-task-gtd-flow',
    title: 'GTDフローテスト用タスク',
    description: 'テスト用のタスクです'
  };

  test.beforeEach(async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('http://localhost:3000');
    
    // ページが読み込まれるのを待つ
    await page.waitForLoadState('networkidle');
    
    // テスト用タスクを作成
    await page.evaluate((task) => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const newTask = {
        ...task,
        status: 'inbox',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, testTask);
    
    // ページをリフレッシュしてタスクを読み込み
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('テスト用タスクが作成されました');
  });

  test.afterEach(async ({ page }) => {
    // テスト用データをクリーンアップ
    await page.evaluate(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const filteredTasks = tasks.filter((task: any) => !task.id.includes('test-task-gtd-flow'));
      localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    });
  });

  /**
   * GTDフロー共通ヘルパー関数
   */
  async function openGtdFlow(page: any) {
    // GTDフローモーダルを開く
    await page.evaluate((taskId) => {
      // グローバルイベントでGTDフローを開く
      const event = new CustomEvent('openGtdFlow', { detail: { memoId: taskId } });
      document.dispatchEvent(event);
    }, testTask.id);
    
    // モーダルが表示されるのを待つ
    await page.waitForSelector('[data-testid="gtd-flow-modal"]', { timeout: 10000 });
  }

  async function fillStepOne(page: any, itemName: string, description?: string) {
    // ステップ1: アイテム名と説明を入力
    await page.fill('[data-testid="item-name-input"]', itemName);
    if (description) {
      await page.fill('[data-testid="item-description-input"]', description);
    }
    await page.click('[data-testid="next-button"]');
  }

  async function selectActionable(page: any, isActionable: boolean) {
    // ステップ2: 行動を起こす必要があるか？
    await page.waitForSelector('[data-testid="is-actionable-question"]');
    if (isActionable) {
      await page.click('[data-testid="actionable-yes"]');
    } else {
      await page.click('[data-testid="actionable-no"]');
    }
    await page.click('[data-testid="next-button"]');
  }

  /**
   * パターン1: 非実行項目 → ゴミ箱
   */
  test('パターン1: 非実行項目をゴミ箱に移動', async ({ page }) => {
    await openGtdFlow(page);
    
    // ステップ1: アイテム情報入力
    await fillStepOne(page, '不要な資料');
    
    // ステップ2: 行動不要を選択
    await selectActionable(page, false);
    
    // ステップ3: 非実行項目の処理を選択
    await page.waitForSelector('[data-testid="non-actionable-outcome"]');
    await page.click('[data-testid="outcome-trash"]');
    await page.click('[data-testid="next-button"]');
    
    // 完了メッセージを確認
    await page.waitForSelector('[data-testid="completion-message"]:has-text("ゴミ箱に移動")');
    console.log('✅ パターン1: ゴミ箱移動が完了');
  });

  /**
   * パターン2: 非実行項目 → いつかやるリスト
   */
  test('パターン2: 非実行項目をいつかやるリストに移動', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '将来読みたい本');
    await selectActionable(page, false);
    
    // いつかやるリストを選択
    await page.click('[data-testid="outcome-someday"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("いつかやるリスト")');
    console.log('✅ パターン2: いつかやるリスト移動が完了');
  });

  /**
   * パターン3: 非実行項目 → 参照資料
   */
  test('パターン3: 非実行項目を参照資料に分類', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '重要な契約書');
    await selectActionable(page, false);
    
    // 参照資料を選択
    await page.click('[data-testid="outcome-reference"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("参照資料")');
    console.log('✅ パターン3: 参照資料分類が完了');
  });

  /**
   * パターン4: 実行項目 → 複数アクション → プロジェクト化
   */
  test('パターン4: 複数アクションでプロジェクト化', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '新しいWebサイトを作る');
    await selectActionable(page, true);
    
    // 複数アクションを選択
    await page.waitForSelector('[data-testid="num-actions-question"]');
    await page.click('[data-testid="actions-multiple"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("プロジェクト")');
    console.log('✅ パターン4: プロジェクト化が完了');
  });

  /**
   * パターン5: 実行項目 → 単一アクション → 2分以内 → 即実行
   */
  test('パターン5: 2分以内のタスクを即実行', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, 'メールを返信する');
    await selectActionable(page, true);
    
    // 単一アクションを選択
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分以内を選択
    await page.waitForSelector('[data-testid="two-minute-question"]');
    await page.click('[data-testid="two-minute-yes"]');
    await page.click('[data-testid="next-button"]');
    
    // 実行完了確認
    await page.waitForSelector('[data-testid="task-completion-question"]');
    await page.click('[data-testid="task-completed-yes"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("完了")');
    console.log('✅ パターン5: 即実行完了');
  });

  /**
   * パターン6: 実行項目 → 単一アクション → 2分超過 → 自分でやる → 特定日時あり
   */
  test('パターン6: 特定日時ありのタスクをカレンダーに登録', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '歯科検診の予約');
    await selectActionable(page, true);
    
    // 単一アクション
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分超過
    await page.click('[data-testid="two-minute-no"]');
    await page.click('[data-testid="next-button"]');
    
    // 自分でやる
    await page.waitForSelector('[data-testid="delegation-question"]');
    await page.click('[data-testid="delegation-do-it"]');
    await page.click('[data-testid="next-button"]');
    
    // 特定日時あり
    await page.waitForSelector('[data-testid="specific-date-question"]');
    await page.click('[data-testid="specific-date-yes"]');
    
    // 日時を入力
    await page.fill('[data-testid="due-date-input"]', '2025-06-01');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("カレンダー")');
    console.log('✅ パターン6: カレンダー登録が完了');
  });

  /**
   * パターン7: 実行項目 → 単一アクション → 2分超過 → 自分でやる → 特定日時なし
   */
  test('パターン7: 特定日時なしのタスクを次のアクションリストに追加', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '部屋の掃除');
    await selectActionable(page, true);
    
    // 単一アクション
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分超過
    await page.click('[data-testid="two-minute-no"]');
    await page.click('[data-testid="next-button"]');
    
    // 自分でやる
    await page.click('[data-testid="delegation-do-it"]');
    await page.click('[data-testid="next-button"]');
    
    // 特定日時なし
    await page.click('[data-testid="specific-date-no"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("次のアクション")');
    console.log('✅ パターン7: 次のアクションリスト追加が完了');
  });

  /**
   * パターン8: 実行項目 → 単一アクション → 2分超過 → 委任する
   */
  test('パターン8: タスクを他者に委任', async ({ page }) => {
    await openGtdFlow(page);
    
    await fillStepOne(page, '資料の準備');
    await selectActionable(page, true);
    
    // 単一アクション
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分超過
    await page.click('[data-testid="two-minute-no"]');
    await page.click('[data-testid="next-button"]');
    
    // 委任する
    await page.click('[data-testid="delegation-delegate-it"]');
    
    // 委任先を入力
    await page.fill('[data-testid="delegate-to-input"]', '田中さん');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("連絡待ち")');
    console.log('✅ パターン8: 委任が完了');
  });

  /**
   * エラーハンドリングテスト
   */
  test('エラーハンドリング: 存在しないタスクID', async ({ page }) => {
    // 存在しないタスクIDでGTDフローを開こうとする
    await page.evaluate(() => {
      const event = new CustomEvent('openGtdFlow', { 
        detail: { memoId: 'non-existent-task-id' } 
      });
      document.dispatchEvent(event);
    });
    
    // エラーメッセージが表示されることを確認
    await page.waitForSelector('[data-testid="error-message"]:has-text("見つかりません")');
    console.log('✅ エラーハンドリング: 適切なエラーメッセージが表示');
  });

  /**
   * ローディング状態テスト
   */
  test('ローディング状態の表示', async ({ page }) => {
    // ローディング状態をシミュレート
    await page.evaluate(() => {
      // useTasksのloadingをtrueに設定
      window.localStorage.setItem('tasks-loading', 'true');
    });
    
    await openGtdFlow(page);
    
    // ローディング画面が表示されることを確認
    await page.waitForSelector('[data-testid="loading-screen"]:has-text("読み込み中")');
    console.log('✅ ローディング状態: 適切なローディング画面が表示');
  });

  /**
   * フロー完了後の自動閉じる機能テスト
   */
  test('フロー完了後の自動閉じる機能', async ({ page }) => {
    await openGtdFlow(page);
    
    // 簡単なフローを完了させる
    await fillStepOne(page, '不要なファイル');
    await selectActionable(page, false);
    await page.click('[data-testid="outcome-trash"]');
    await page.click('[data-testid="next-button"]');
    
    // 完了メッセージとカウントダウンを確認
    await page.waitForSelector('[data-testid="completion-message"]');
    await page.waitForSelector('[data-testid="auto-close-countdown"]');
    
    // 3秒後にモーダルが閉じることを確認
    await page.waitForSelector('[data-testid="gtd-flow-modal"]', { 
      state: 'detached', 
      timeout: 5000 
    });
    
    console.log('✅ 自動閉じる機能: 正常に動作');
  });

  /**
   * フローの中断と再開テスト
   */
  test('フローの中断と復元', async ({ page }) => {
    await openGtdFlow(page);
    
    // ステップ1を完了
    await fillStepOne(page, '重要な会議');
    
    // ステップ2の途中でモーダルを閉じる
    await page.click('[data-testid="close-modal-button"]');
    
    // 再度開く
    await openGtdFlow(page);
    
    // 状態が保持されていることを確認
    const itemNameValue = await page.inputValue('[data-testid="item-name-input"]');
    expect(itemNameValue).toBe('重要な会議');
    
    console.log('✅ フロー中断・復元: 状態が正しく保持されている');
  });

  /**
   * 全パターンの統合テスト
   */
  test('全パターン連続実行テスト', async ({ page }) => {
    const patterns = [
      { name: 'ゴミ箱', actionable: false, outcome: 'trash' },
      { name: 'いつかやる', actionable: false, outcome: 'someday' },
      { name: '参照資料', actionable: false, outcome: 'reference' },
      { name: 'プロジェクト化', actionable: true, actions: 'multiple' },
    ];

    for (const pattern of patterns) {
      console.log(`🔄 パターンテスト開始: ${pattern.name}`);
      
      await openGtdFlow(page);
      await fillStepOne(page, `${pattern.name}テスト`);
      await selectActionable(page, pattern.actionable);
      
      if (!pattern.actionable) {
        await page.click(`[data-testid="outcome-${pattern.outcome}"]`);
        await page.click('[data-testid="next-button"]');
      } else if (pattern.actions === 'multiple') {
        await page.click('[data-testid="actions-multiple"]');
        await page.click('[data-testid="next-button"]');
      }
      
      // 完了を確認
      await page.waitForSelector('[data-testid="completion-message"]');
      
      // モーダルが閉じるのを待つ
      await page.waitForSelector('[data-testid="gtd-flow-modal"]', { 
        state: 'detached', 
        timeout: 5000 
      });
      
      console.log(`✅ パターン完了: ${pattern.name}`);
      
      // 少し待機してから次のパターンへ
      await page.waitForTimeout(1000);
    }
    
    console.log('🎉 全パターン連続実行テスト完了');
  });
});
