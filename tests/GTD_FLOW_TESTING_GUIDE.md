# GTDフロー包括的テストガイド

## 📋 概要

このガイドでは、GTDフローの全パターンを網羅したPlaywrightテストの実行方法と、生成されるスクリーンショット付きレポートについて説明します。

## 🚀 テスト実行方法

### 必要な準備

1. **依存関係のインストール**
```bash
npm install
npx playwright install
```

2. **アプリケーションの起動**
```bash
npm start
```
別のターミナルでアプリケーションが`http://localhost:3000`で動作していることを確認してください。

### テスト実行コマンド

#### 基本的なGTDフローテスト
```bash
# GTDフローテストのみ実行
npm run test:gtd-flow

# ブラウザ表示モードで実行（デバッグ用）
npm run test:gtd-flow:headed

# GTDフローテスト + レポート生成
npm run test:gtd-flow:full
```

#### その他のテストコマンド
```bash
# 全E2Eテストを実行
npm run test:e2e

# Playwright UIモードで実行
npm run test:e2e:ui

# デバッグモードで実行
npm run test:e2e:debug

# テスト結果をクリーンアップ
npm run clean:test-results

# レポートのみ生成（既存のスクリーンショットから）
npm run generate:test-report
```

## 📊 テストパターン

### 実装されているテストパターン

1. **パターン1: 非実行項目 → ゴミ箱** 🗑️
   - 不要な項目を削除する流れ

2. **パターン2: 非実行項目 → いつかやるリスト** ⏰
   - 将来的に実行する可能性がある項目

3. **パターン3: 非実行項目 → 参照資料** 📚
   - 後で参照する情報として保存

4. **パターン4: 実行項目 → プロジェクト化** 🎯
   - 複数のアクションが必要な項目

5. **パターン5: 実行項目 → 即実行** ⚡
   - 2分以内で完了できる項目

6. **パターン6: 実行項目 → カレンダー登録** 📅
   - 特定の日時が決まっている項目

7. **パターン7: 実行項目 → 次のアクションリスト** 📝
   - 特定の日時は決まっていないが実行が必要な項目

8. **パターン8: 実行項目 → 委任** 👥
   - 他者に委任する項目

### 特殊テスト

- **エラーハンドリング**: 存在しないタスクIDでの動作確認
- **ローディング状態**: データ読み込み中の表示確認
- **全パターン連続実行**: 複数パターンの連続動作確認

## 📸 スクリーンショット機能

### キャプチャされるタイミング

各テストパターンで以下のタイミングでスクリーンショットが自動保存されます：

1. **Step 0**: モーダルオープン時
2. **Step 1**: 各ステップの入力前
3. **Step 2**: 各ステップの入力後
4. **Step 3**: 各ステップの完了時
5. **Step N**: 最終完了メッセージ

### 保存場所

```
test-results/
├── gtd-flow-screenshots/           # スクリーンショット
│   ├── pattern1-trash_step0_modal-opened_[timestamp].png
│   ├── pattern1-trash_step1_before-input_[timestamp].png
│   └── ...
└── gtd-flow-reports/              # HTMLレポート
    └── gtd-flow-test-report-[date].html
```

## 📋 テストレポート

### HTMLレポートの特徴

生成されるHTMLレポートには以下の機能があります：

- **📊 テスト概要**: 実行されたテスト数、スクリーンショット数
- **🔗 クイックナビゲーション**: 各テストパターンへのジャンプリンク
- **🎨 視覚的表示**: グリッド形式でのスクリーンショット表示
- **🔍 拡大表示**: クリックでモーダル表示、ESCキーで閉じる
- **📱 レスポンシブ対応**: モバイル・デスクトップ対応

### レポートの確認方法

1. テスト実行後、生成されたHTMLファイルをブラウザで開く
```bash
# レポートファイルの場所を確認
ls test-results/gtd-flow-reports/

# ブラウザで開く（例）
open test-results/gtd-flow-reports/gtd-flow-test-report-2025-05-22.html
```

2. レポートの構成
   - **ヘッダー**: テスト実行日時、概要情報
   - **ナビゲーション**: 各テストへのクイックリンク
   - **テスト結果**: パターン別のスクリーンショット一覧
   - **モーダル表示**: 画像クリックで拡大表示

## 🔧 デバッグとトラブルシューティング

### よくある問題と解決方法

#### 1. テストが失敗する場合

```bash
# アプリケーションが起動しているか確認
curl http://localhost:3000

# ブラウザ表示モードでデバッグ
npm run test:gtd-flow:headed

# 詳細なデバッグ情報を表示
npm run test:e2e:debug
```

#### 2. スクリーンショットが生成されない場合

```bash
# test-resultsディレクトリの権限を確認
ls -la test-results/

# ディレクトリを手動作成
mkdir -p test-results/gtd-flow-screenshots
mkdir -p test-results/gtd-flow-reports
```

#### 3. data-testid属性が見つからない場合

実際のコンポーネントに適切なdata-testid属性が設定されているか確認してください：

```typescript
// 例: Step1.tsx
<Input
  value={itemName}
  onChange={({ detail }) => setItemName(detail.value)}
  placeholder="例: 会議の準備"
  data-testid="item-name-input"  // ← この属性が必要
/>
```

#### 4. GTDフローモーダルが開かない場合

実際のアプリケーションでGTDフローを開く方法に合わせてテストコードを調整してください：

```typescript
// openGtdFlow関数を実際の実装に合わせて修正
async function openGtdFlow(page: any, testName: string) {
  // 実際のGTDフロー開始方法に応じて調整
  await page.click('[data-testid="gtd-flow-button"]');
  // または
  // await page.evaluate(() => {
  //   window.openGtdFlow('task-id');
  // });
}
```

## 📈 継続的インテグレーション

### CI/CDパイプラインでの実行

```yaml
# .github/workflows/gtd-flow-tests.yml の例
name: GTD Flow Tests
on: [push, pull_request]

jobs:
  test-gtd-flow:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Start application
        run: npm start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run GTD Flow tests
        run: npm run test:gtd-flow
      
      - name: Generate test report
        run: npm run generate:test-report
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: gtd-flow-test-results
          path: test-results/
```

## 📝 テスト作成のベストプラクティス

### 1. スクリーンショット命名規則

```
{testName}_step{number}_{stepName}_{timestamp}.png
```

### 2. テストデータの管理

```typescript
// テスト用データは一意のIDを使用
const testTask = {
  id: `test-task-${Date.now()}`,
  title: 'テスト用タスク',
  // ...
};
```

### 3. 待機処理のベストプラクティス

```typescript
// 要素の表示を待つ
await page.waitForSelector('[data-testid="element"]');

// ネットワークの完了を待つ
await page.waitForLoadState('networkidle');

// カスタム条件を待つ
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="element"]')?.textContent === 'Expected Text';
});
```

### 4. エラーハンドリング

```typescript
test('エラーケースのテスト', async ({ page }) => {
  try {
    await page.click('[data-testid="button"]');
    await captureStep(page, testName, 'action-completed', 1);
  } catch (error) {
    await captureStep(page, testName, 'error-occurred', 1);
    throw error;
  }
});
```

## 🎯 今後の拡張予定

### 追加予定のテストパターン

1. **マルチデバイステスト**: モバイル、タブレット、デスクトップ
2. **アクセシビリティテスト**: スクリーンリーダー、キーボードナビゲーション
3. **パフォーマンステスト**: ページ読み込み時間、操作レスポンス
4. **国際化テスト**: 多言語対応の確認

### レポート機能の拡張

1. **動画キャプチャ**: スクリーンショットに加えて動画記録
2. **比較機能**: 前回実行との差分表示
3. **メトリクス**: 実行時間、成功率などの統計情報
4. **Slack連携**: テスト結果の自動通知

## 📞 サポート

テストに関する質問や問題が発生した場合：

1. **ドキュメントを確認**: このREADMEとPlaywright公式ドキュメント
2. **ログを確認**: コンソール出力とスクリーンショット
3. **Issue作成**: GitHubリポジトリにIssueを作成

---

🎉 Happy Testing! GTDフローの品質向上にご協力いただき、ありがとうございます！
