import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * GTDフロー包括的テストスイート - スクリーンショット付き
 * 全ての可能なフローパターンをテストし、各ステップのキャプチャを保存
 */

test.describe('GTDフロー - 包括的テスト（スクリーンショット付き）', () => {
  
  // テスト結果を保存するディレクトリ
  const testResultsDir = path.join(__dirname, '..', 'test-results', 'gtd-flow-screenshots');
  
  // テスト用のタスクデータ
  const testTask = {
    id: 'test-task-gtd-flow',
    title: 'GTDフローテスト用タスク',
    description: 'テスト用のタスクです'
  };

  test.beforeAll(async () => {
    // テスト結果ディレクトリを作成
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
      console.log(`📁 テスト結果ディレクトリを作成: ${testResultsDir}`);
    }
  });

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
    
    console.log('📋 テスト用タスクが作成されました');
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
   * スクリーンショット撮影ヘルパー関数
   */
  async function captureStep(page: any, testName: string, stepName: string, stepNumber: number) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${testName}_step${stepNumber}_${stepName}_${timestamp}.png`;
    const filePath = path.join(testResultsDir, fileName);
    
    await page.screenshot({
      path: filePath,
      fullPage: true
    });
    
    console.log(`📸 スクリーンショット保存: ${fileName}`);
    return fileName;
  }

  /**
   * GTDフロー共通ヘルパー関数
   */
  async function openGtdFlow(page: any, testName: string) {
    // GTDフローモーダルを開く（実際の実装に合わせて調整）
    await page.evaluate((taskId) => {
      // 実際のアプリケーションでGTDフローを開く方法に応じて調整
      const gtdButton = document.querySelector('[data-testid="gtd-flow-button"]');
      if (gtdButton) {
        gtdButton.click();
      } else {
        // カスタムイベントで開く場合
        const event = new CustomEvent('openGtdFlow', { detail: { memoId: taskId } });
        document.dispatchEvent(event);
      }
    }, testTask.id);
    
    // モーダルが表示されるのを待つ
    await page.waitForSelector('[data-testid="gtd-flow-modal"]', { timeout: 10000 });
    
    // 初期状態をキャプチャ
    await captureStep(page, testName, 'modal-opened', 0);
  }

  async function fillStepOne(page: any, itemName: string, testName: string, description?: string) {
    // ステップ1のキャプチャ
    await captureStep(page, testName, 'step1-before-input', 1);
    
    // アイテム名を入力
    await page.fill('[data-testid="item-name-input"]', itemName);
    
    if (description) {
      await page.fill('[data-testid="item-description-input"]', description);
    }
    
    // 入力後のキャプチャ
    await captureStep(page, testName, 'step1-after-input', 2);
    
    await page.click('[data-testid="next-button"]');
    
    // ステップ1完了後のキャプチャ
    await captureStep(page, testName, 'step1-completed', 3);
  }

  async function selectActionable(page: any, isActionable: boolean, testName: string) {
    // ステップ2の表示をキャプチャ
    await page.waitForSelector('[data-testid="is-actionable-question"]');
    await captureStep(page, testName, 'step2-actionable-question', 4);
    
    if (isActionable) {
      await page.click('[data-testid="actionable-yes"]');
    } else {
      await page.click('[data-testid="actionable-no"]');
    }
    
    // 選択後のキャプチャ
    await captureStep(page, testName, 'step2-selection-made', 5);
    
    await page.click('[data-testid="next-button"]');
    
    // ステップ2完了後のキャプチャ
    await captureStep(page, testName, 'step2-completed', 6);
  }

  /**
   * パターン1: 非実行項目 → ゴミ箱
   */
  test('パターン1: 非実行項目をゴミ箱に移動', async ({ page }) => {
    const testName = 'pattern1-trash';
    
    await openGtdFlow(page, testName);
    
    // ステップ1: アイテム情報入力
    await fillStepOne(page, '不要な資料', testName);
    
    // ステップ2: 行動不要を選択
    await selectActionable(page, false, testName);
    
    // ステップ3: 非実行項目の処理を選択
    await page.waitForSelector('[data-testid="non-actionable-outcome"]');
    await captureStep(page, testName, 'step3-outcome-options', 7);
    
    await page.click('[data-testid="outcome-trash"]');
    await captureStep(page, testName, 'step3-trash-selected', 8);
    
    await page.click('[data-testid="next-button"]');
    
    // 完了メッセージをキャプチャ
    await page.waitForSelector('[data-testid="completion-message"]:has-text("ゴミ箱に移動")');
    await captureStep(page, testName, 'completion-message', 9);
    
    console.log('✅ パターン1: ゴミ箱移動が完了');
  });

  /**
   * パターン2: 非実行項目 → いつかやるリスト
   */
  test('パターン2: 非実行項目をいつかやるリストに移動', async ({ page }) => {
    const testName = 'pattern2-someday';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '将来読みたい本', testName);
    await selectActionable(page, false, testName);
    
    // いつかやるリストを選択
    await captureStep(page, testName, 'step3-before-someday-selection', 7);
    await page.click('[data-testid="outcome-someday"]');
    await captureStep(page, testName, 'step3-someday-selected', 8);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("いつかやるリスト")');
    await captureStep(page, testName, 'completion-message', 9);
    
    console.log('✅ パターン2: いつかやるリスト移動が完了');
  });

  /**
   * パターン3: 非実行項目 → 参照資料
   */
  test('パターン3: 非実行項目を参照資料に分類', async ({ page }) => {
    const testName = 'pattern3-reference';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '重要な契約書', testName);
    await selectActionable(page, false, testName);
    
    // 参照資料を選択
    await captureStep(page, testName, 'step3-before-reference-selection', 7);
    await page.click('[data-testid="outcome-reference"]');
    await captureStep(page, testName, 'step3-reference-selected', 8);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("参照資料")');
    await captureStep(page, testName, 'completion-message', 9);
    
    console.log('✅ パターン3: 参照資料分類が完了');
  });

  /**
   * パターン4: 実行項目 → 複数アクション → プロジェクト化
   */
  test('パターン4: 複数アクションでプロジェクト化', async ({ page }) => {
    const testName = 'pattern4-project';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '新しいWebサイトを作る', testName);
    await selectActionable(page, true, testName);
    
    // 複数アクションを選択
    await page.waitForSelector('[data-testid="num-actions-question"]');
    await captureStep(page, testName, 'step3-actions-question', 7);
    
    await page.click('[data-testid="actions-multiple"]');
    await captureStep(page, testName, 'step3-multiple-selected', 8);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("プロジェクト")');
    await captureStep(page, testName, 'completion-message', 9);
    
    console.log('✅ パターン4: プロジェクト化が完了');
  });

  /**
   * パターン5: 実行項目 → 単一アクション → 2分以内 → 即実行
   */
  test('パターン5: 2分以内のタスクを即実行', async ({ page }) => {
    const testName = 'pattern5-immediate';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, 'メールを返信する', testName);
    await selectActionable(page, true, testName);
    
    // 単一アクションを選択
    await page.waitForSelector('[data-testid="num-actions-question"]');
    await captureStep(page, testName, 'step3-single-action', 7);
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分以内を選択
    await page.waitForSelector('[data-testid="two-minute-question"]');
    await captureStep(page, testName, 'step4-two-minute-question', 8);
    await page.click('[data-testid="two-minute-yes"]');
    await captureStep(page, testName, 'step4-yes-selected', 9);
    await page.click('[data-testid="next-button"]');
    
    // 実行完了確認
    await page.waitForSelector('[data-testid="task-completion-question"]');
    await captureStep(page, testName, 'step5-completion-question', 10);
    await page.click('[data-testid="task-completed-yes"]');
    await captureStep(page, testName, 'step5-completed-yes', 11);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("完了")');
    await captureStep(page, testName, 'completion-message', 12);
    
    console.log('✅ パターン5: 即実行完了');
  });

  /**
   * パターン6: 実行項目 → 単一アクション → 2分超過 → 自分でやる → 特定日時あり
   */
  test('パターン6: 特定日時ありのタスクをカレンダーに登録', async ({ page }) => {
    const testName = 'pattern6-calendar';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '歯科検診の予約', testName);
    await selectActionable(page, true, testName);
    
    // 単一アクション
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分超過
    await page.waitForSelector('[data-testid="two-minute-question"]');
    await captureStep(page, testName, 'step4-two-minute-no', 8);
    await page.click('[data-testid="two-minute-no"]');
    await page.click('[data-testid="next-button"]');
    
    // 自分でやる
    await page.waitForSelector('[data-testid="delegation-question"]');
    await captureStep(page, testName, 'step5-delegation-question', 9);
    await page.click('[data-testid="delegation-do-it"]');
    await captureStep(page, testName, 'step5-do-it-selected', 10);
    await page.click('[data-testid="next-button"]');
    
    // 特定日時あり
    await page.waitForSelector('[data-testid="specific-date-question"]');
    await captureStep(page, testName, 'step6-date-question', 11);
    await page.click('[data-testid="specific-date-yes"]');
    
    // 日時を入力
    await page.fill('[data-testid="due-date-input"]', '2025-06-01');
    await captureStep(page, testName, 'step6-date-entered', 12);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("カレンダー")');
    await captureStep(page, testName, 'completion-message', 13);
    
    console.log('✅ パターン6: カレンダー登録が完了');
  });

  /**
   * パターン7: 実行項目 → 単一アクション → 2分超過 → 自分でやる → 特定日時なし
   */
  test('パターン7: 特定日時なしのタスクを次のアクションリストに追加', async ({ page }) => {
    const testName = 'pattern7-next-action';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '部屋の掃除', testName);
    await selectActionable(page, true, testName);
    
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
    await page.waitForSelector('[data-testid="specific-date-question"]');
    await captureStep(page, testName, 'step6-no-date', 11);
    await page.click('[data-testid="specific-date-no"]');
    await captureStep(page, testName, 'step6-no-date-selected', 12);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("次のアクション")');
    await captureStep(page, testName, 'completion-message', 13);
    
    console.log('✅ パターン7: 次のアクションリスト追加が完了');
  });

  /**
   * パターン8: 実行項目 → 単一アクション → 2分超過 → 委任する
   */
  test('パターン8: タスクを他者に委任', async ({ page }) => {
    const testName = 'pattern8-delegate';
    
    await openGtdFlow(page, testName);
    
    await fillStepOne(page, '資料の準備', testName);
    await selectActionable(page, true, testName);
    
    // 単一アクション
    await page.click('[data-testid="actions-single"]');
    await page.click('[data-testid="next-button"]');
    
    // 2分超過
    await page.click('[data-testid="two-minute-no"]');
    await page.click('[data-testid="next-button"]');
    
    // 委任する
    await page.waitForSelector('[data-testid="delegation-question"]');
    await captureStep(page, testName, 'step5-delegate-option', 9);
    await page.click('[data-testid="delegation-delegate-it"]');
    
    // 委任先を入力
    await page.fill('[data-testid="delegate-to-input"]', '田中さん');
    await captureStep(page, testName, 'step5-delegate-input', 10);
    await page.click('[data-testid="next-button"]');
    
    await page.waitForSelector('[data-testid="completion-message"]:has-text("連絡待ち")');
    await captureStep(page, testName, 'completion-message', 11);
    
    console.log('✅ パターン8: 委任が完了');
  });

  /**
   * エラーハンドリングテスト
   */
  test('エラーハンドリング: 存在しないタスクID', async ({ page }) => {
    const testName = 'error-handling';
    
    // 存在しないタスクIDでGTDフローを開こうとする
    await page.evaluate(() => {
      const event = new CustomEvent('openGtdFlow', { 
        detail: { memoId: 'non-existent-task-id' } 
      });
      document.dispatchEvent(event);
    });
    
    // エラーメッセージが表示されることを確認
    await page.waitForSelector('[data-testid="error-message"]:has-text("見つかりません")');
    await captureStep(page, testName, 'error-message-displayed', 1);
    
    console.log('✅ エラーハンドリング: 適切なエラーメッセージが表示');
  });

  /**
   * 全パターン連続実行テスト（ダイジェスト版）
   */
  test('全パターン連続実行テスト', async ({ page }) => {
    const testName = 'all-patterns-digest';
    const patterns = [
      { name: 'ゴミ箱', actionable: false, outcome: 'trash' },
      { name: 'いつかやる', actionable: false, outcome: 'someday' },
      { name: '参照資料', actionable: false, outcome: 'reference' },
      { name: 'プロジェクト化', actionable: true, actions: 'multiple' },
    ];

    let stepCounter = 0;

    for (const pattern of patterns) {
      console.log(`🔄 パターンテスト開始: ${pattern.name}`);
      
      await openGtdFlow(page, `${testName}-${pattern.name}`);
      await fillStepOne(page, `${pattern.name}テスト`, `${testName}-${pattern.name}`);
      await selectActionable(page, pattern.actionable, `${testName}-${pattern.name}`);
      
      if (!pattern.actionable) {
        await page.click(`[data-testid="outcome-${pattern.outcome}"]`);
        await captureStep(page, testName, `pattern-${pattern.name}-selected`, ++stepCounter);
        await page.click('[data-testid="next-button"]');
      } else if (pattern.actions === 'multiple') {
        await page.click('[data-testid="actions-multiple"]');
        await captureStep(page, testName, `pattern-${pattern.name}-selected`, ++stepCounter);
        await page.click('[data-testid="next-button"]');
      }
      
      // 完了を確認
      await page.waitForSelector('[data-testid="completion-message"]');
      await captureStep(page, testName, `pattern-${pattern.name}-completed`, ++stepCounter);
      
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
