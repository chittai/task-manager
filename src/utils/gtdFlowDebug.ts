/**
 * GTDフローのエラーハンドリングテスト用ユーティリティ
 * 
 * このファイルは開発者がGTDフローの修正をテストするための
 * ヘルパー関数を提供します。
 */

export interface TestScenario {
  name: string;
  description: string;
  setup: () => void;
  expectedResult: string;
}

/**
 * GTDフローテストシナリオ
 */
export const gtdFlowTestScenarios: TestScenario[] = [
  {
    name: "正常ケース: 存在するタスクでGTDフロー開始",
    description: "有効なタスクIDでGTDフローを開始し、正常に動作することを確認",
    setup: () => {
      console.log("📋 テスト: 有効なタスクでGTDフローを開始");
      // このテストでは、既存のタスクIDを使用してGTDフローを開始
    },
    expectedResult: "GTDフローが正常に開始され、タスク情報が表示される"
  },
  {
    name: "エラーケース: 存在しないタスクIDでGTDフロー開始",
    description: "無効なタスクIDでGTDフローを開始し、適切なエラーメッセージが表示されることを確認",
    setup: () => {
      console.log("❌ テスト: 存在しないタスクIDでGTDフローを開始");
      // このテストでは、存在しないタスクID（例: "invalid-task-id"）を使用
    },
    expectedResult: "詳細なエラーメッセージが表示され、3秒後にモーダルが自動的に閉じる"
  },
  {
    name: "ローディングケース: タスク読み込み中のGTDフロー開始",
    description: "タスクデータの読み込み中にGTDフローを開始し、ローディング画面が表示されることを確認",
    setup: () => {
      console.log("⏳ テスト: タスク読み込み中のGTDフロー開始");
      // このテストでは、useTasksのloadingがtrueの状態でテスト
    },
    expectedResult: "ローディング画面が表示され、データ読み込み完了後に正常な画面に遷移"
  }
];

/**
 * デバッグ用のローカルストレージ操作関数
 */
export const debugUtils = {
  /**
   * ローカルストレージからタスクデータを取得
   */
  getTasks: () => {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Failed to get tasks from localStorage:', error);
      return [];
    }
  },

  /**
   * 利用可能なタスクIDを表示
   */
  showAvailableTaskIds: () => {
    const tasks = debugUtils.getTasks();
    console.log('📋 利用可能なタスクID:');
    tasks.forEach((task: any, index: number) => {
      console.log(`  ${index + 1}. ${task.id} - "${task.title}"`);
    });
    return tasks.map((task: any) => task.id);
  },

  /**
   * テスト用のダミータスクを作成
   */
  createTestTask: () => {
    const testTask = {
      id: 'test-task-' + Date.now(),
      title: 'テスト用タスク',
      description: 'GTDフローテスト用に作成されたタスク',
      status: 'inbox',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingTasks = debugUtils.getTasks();
    const updatedTasks = [...existingTasks, testTask];
    
    try {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('✅ テスト用タスクが作成されました:', testTask.id);
      return testTask;
    } catch (error) {
      console.error('Failed to create test task:', error);
      return null;
    }
  },

  /**
   * ローカルストレージをクリア（注意：すべてのタスクが削除されます）
   */
  clearAllTasks: () => {
    if (confirm('⚠️ 警告: すべてのタスクが削除されます。続行しますか？')) {
      localStorage.removeItem('tasks');
      console.log('🗑️ すべてのタスクが削除されました');
    }
  },

  /**
   * ローカルストレージの状態を表示
   */
  showStorageInfo: () => {
    const tasks = debugUtils.getTasks();
    console.log('📊 ローカルストレージ情報:');
    console.log(`  タスク数: ${tasks.length}`);
    console.log(`  ストレージサイズ: ${JSON.stringify(tasks).length} bytes`);
    
    if (tasks.length > 0) {
      console.log('  最新タスク:', tasks[tasks.length - 1]);
    }
  }
};

/**
 * コンソールでテストを実行するためのヘルパー関数
 * 
 * 使用方法:
 * 1. ブラウザの開発者ツールを開く
 * 2. コンソールで以下のコマンドを実行:
 * 
 * // 利用可能なタスクIDを表示
 * debugUtils.showAvailableTaskIds();
 * 
 * // テスト用タスクを作成
 * debugUtils.createTestTask();
 * 
 * // ストレージ情報を表示
 * debugUtils.showStorageInfo();
 */
export const runConsoleTests = () => {
  console.log('🧪 GTDフロー デバッグテスト開始');
  console.log('==========================================');
  
  debugUtils.showStorageInfo();
  console.log('');
  debugUtils.showAvailableTaskIds();
  
  console.log('');
  console.log('📝 テストシナリオ:');
  gtdFlowTestScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   説明: ${scenario.description}`);
    console.log(`   期待結果: ${scenario.expectedResult}`);
    console.log('');
  });
  
  console.log('💡 ヒント: debugUtils オブジェクトを使用して手動テストを実行できます');
  console.log('==========================================');
};

// コンソールでアクセスできるようにグローバルオブジェクトに追加
if (typeof window !== 'undefined') {
  (window as any).gtdFlowDebug = {
    debugUtils,
    gtdFlowTestScenarios,
    runConsoleTests
  };
}
