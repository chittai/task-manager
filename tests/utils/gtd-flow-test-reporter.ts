/**
 * GTDフローテスト結果レポートジェネレーター
 * スクリーンショットを整理してHTMLレポートを生成
 */

import fs from 'fs';
import path from 'path';

interface ScreenshotInfo {
  fileName: string;
  testName: string;
  stepNumber: number;
  stepName: string;
  timestamp: string;
  filePath: string;
}

interface TestResult {
  testName: string;
  screenshots: ScreenshotInfo[];
}

export class GtdFlowTestReporter {
  private testResultsDir: string;
  private reportOutputDir: string;

  constructor() {
    this.testResultsDir = path.join(__dirname, '..', 'test-results', 'gtd-flow-screenshots');
    this.reportOutputDir = path.join(__dirname, '..', 'test-results', 'gtd-flow-reports');
  }

  /**
   * スクリーンショットファイルを解析してテスト結果を整理
   */
  parseScreenshots(): TestResult[] {
    if (!fs.existsSync(this.testResultsDir)) {
      console.log('📁 スクリーンショットディレクトリが存在しません');
      return [];
    }

    const files = fs.readdirSync(this.testResultsDir)
      .filter(file => file.endsWith('.png'))
      .sort();

    const screenshots: ScreenshotInfo[] = files.map(fileName => {
      // ファイル名の形式: testName_stepNumber_stepName_timestamp.png
      const parts = fileName.replace('.png', '').split('_');
      
      if (parts.length >= 4) {
        const testName = parts[0];
        const stepNumber = parseInt(parts[1].replace('step', ''));
        const stepName = parts[2];
        const timestamp = parts.slice(3).join('_');

        return {
          fileName,
          testName,
          stepNumber,
          stepName,
          timestamp,
          filePath: path.join(this.testResultsDir, fileName)
        };
      }

      // フォールバック処理
      return {
        fileName,
        testName: 'unknown',
        stepNumber: 0,
        stepName: 'unknown',
        timestamp: '',
        filePath: path.join(this.testResultsDir, fileName)
      };
    });

    // テスト名でグループ化
    const testResults: { [key: string]: TestResult } = {};
    
    screenshots.forEach(screenshot => {
      if (!testResults[screenshot.testName]) {
        testResults[screenshot.testName] = {
          testName: screenshot.testName,
          screenshots: []
        };
      }
      testResults[screenshot.testName].screenshots.push(screenshot);
    });

    // ステップ番号でソート
    Object.values(testResults).forEach(testResult => {
      testResult.screenshots.sort((a, b) => a.stepNumber - b.stepNumber);
    });

    return Object.values(testResults);
  }

  /**
   * HTMLレポートを生成
   */
  generateHtmlReport(testResults: TestResult[]): string {
    const reportDate = new Date().toLocaleString('ja-JP');
    
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GTDフロー テスト結果レポート</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .test-container {
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .screenshot-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .screenshot-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .screenshot-img {
            width: 100%;
            height: 200px;
            object-fit: contain;
            background: #f8f9fa;
            cursor: pointer;
        }
        .screenshot-info {
            padding: 15px;
            background: #f8f9fa;
        }
        .step-number {
            background: #3498db;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .step-name {
            font-weight: bold;
            margin: 8px 0;
            color: #2c3e50;
        }
        .timestamp {
            font-size: 0.8em;
            color: #666;
        }
        .summary {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
        }
        .modal-content {
            margin: auto;
            display: block;
            width: 90%;
            max-width: 1200px;
            max-height: 90%;
            object-fit: contain;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover,
        .close:focus {
            color: #bbb;
            text-decoration: none;
        }
        .navigation {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 100;
        }
        .nav-link {
            display: inline-block;
            margin: 5px 10px;
            padding: 8px 16px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background 0.3s ease;
        }
        .nav-link:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔄 GTDフロー テスト結果レポート</h1>
        <p>生成日時: ${reportDate}</p>
    </div>

    <div class="summary">
        <h2>📊 テスト概要</h2>
        <p><strong>テスト数:</strong> ${testResults.length}</p>
        <p><strong>総スクリーンショット数:</strong> ${testResults.reduce((total, test) => total + test.screenshots.length, 0)}</p>
        <p><strong>テスト実行フロー:</strong> GTDの全パターンを網羅したEnd-to-Endテスト</p>
    </div>

    <div class="navigation">
        <h3>🔗 クイックナビゲーション</h3>
        ${testResults.map(test => 
          `<a href="#${test.testName}" class="nav-link">${this.getTestDisplayName(test.testName)}</a>`
        ).join('')}
    </div>

    ${testResults.map(test => `
        <div class="test-container" id="${test.testName}">
            <div class="test-title">
                ${this.getTestDisplayName(test.testName)}
                <span style="font-size: 0.7em; color: #666;">(${test.screenshots.length} screenshots)</span>
            </div>
            
            <div class="screenshot-grid">
                ${test.screenshots.map(screenshot => `
                    <div class="screenshot-item">
                        <img 
                            src="../gtd-flow-screenshots/${screenshot.fileName}" 
                            alt="${screenshot.stepName}"
                            class="screenshot-img"
                            onclick="openModal('../gtd-flow-screenshots/${screenshot.fileName}')"
                        />
                        <div class="screenshot-info">
                            <span class="step-number">Step ${screenshot.stepNumber}</span>
                            <div class="step-name">${this.getStepDisplayName(screenshot.stepName)}</div>
                            <div class="timestamp">${this.formatTimestamp(screenshot.timestamp)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}

    <!-- モーダル -->
    <div id="myModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImg">
    </div>

    <script>
        function openModal(src) {
            document.getElementById('myModal').style.display = 'block';
            document.getElementById('modalImg').src = src;
        }

        function closeModal() {
            document.getElementById('myModal').style.display = 'none';
        }

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        // モーダル背景クリックで閉じる
        document.getElementById('myModal').addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * テスト名を表示用に変換
   */
  private getTestDisplayName(testName: string): string {
    const displayNames: { [key: string]: string } = {
      'pattern1-trash': '🗑️ パターン1: 非実行項目をゴミ箱に移動',
      'pattern2-someday': '⏰ パターン2: いつかやるリストに移動',
      'pattern3-reference': '📚 パターン3: 参照資料に分類',
      'pattern4-project': '🎯 パターン4: プロジェクト化',
      'pattern5-immediate': '⚡ パターン5: 2分以内で即実行',
      'pattern6-calendar': '📅 パターン6: カレンダーに登録',
      'pattern7-next-action': '📝 パターン7: 次のアクションリストに追加',
      'pattern8-delegate': '👥 パターン8: 他者に委任',
      'error-handling': '❌ エラーハンドリング',
      'all-patterns-digest': '🔄 全パターン連続実行'
    };

    return displayNames[testName] || testName;
  }

  /**
   * ステップ名を表示用に変換
   */
  private getStepDisplayName(stepName: string): string {
    const displayNames: { [key: string]: string } = {
      'modal-opened': 'モーダルオープン',
      'step1-before-input': 'ステップ1: 入力前',
      'step1-after-input': 'ステップ1: 入力後',
      'step1-completed': 'ステップ1: 完了',
      'step2-actionable-question': 'ステップ2: 実行可能性質問',
      'step2-selection-made': 'ステップ2: 選択済み',
      'step2-completed': 'ステップ2: 完了',
      'step3-outcome-options': 'ステップ3: 結果選択肢',
      'step3-trash-selected': 'ステップ3: ゴミ箱選択',
      'step3-someday-selected': 'ステップ3: いつかやる選択',
      'step3-reference-selected': 'ステップ3: 参照資料選択',
      'step3-actions-question': 'ステップ3: アクション数質問',
      'step3-multiple-selected': 'ステップ3: 複数アクション選択',
      'step3-single-action': 'ステップ3: 単一アクション',
      'step4-two-minute-question': 'ステップ4: 2分質問',
      'step4-yes-selected': 'ステップ4: はい選択',
      'step4-two-minute-no': 'ステップ4: いいえ選択',
      'step5-completion-question': 'ステップ5: 完了確認質問',
      'step5-completed-yes': 'ステップ5: 完了確認',
      'step5-delegation-question': 'ステップ5: 委任質問',
      'step5-do-it-selected': 'ステップ5: 自分でやる選択',
      'step5-delegate-option': 'ステップ5: 委任オプション',
      'step5-delegate-input': 'ステップ5: 委任先入力',
      'step6-date-question': 'ステップ6: 日時質問',
      'step6-date-entered': 'ステップ6: 日時入力',
      'step6-no-date': 'ステップ6: 日時なし',
      'step6-no-date-selected': 'ステップ6: 日時なし選択',
      'completion-message': '✅ 完了メッセージ',
      'error-message-displayed': '❌ エラーメッセージ表示'
    };

    return displayNames[stepName] || stepName.replace(/-/g, ' ');
  }

  /**
   * タイムスタンプを表示用に変換
   */
  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp.replace(/-/g, ':'));
      return date.toLocaleString('ja-JP');
    } catch {
      return timestamp;
    }
  }

  /**
   * レポートを生成して保存
   */
  async generateReport(): Promise<string> {
    // 出力ディレクトリを作成
    if (!fs.existsSync(this.reportOutputDir)) {
      fs.mkdirSync(this.reportOutputDir, { recursive: true });
    }

    // スクリーンショットを解析
    const testResults = this.parseScreenshots();
    
    if (testResults.length === 0) {
      console.log('📷 スクリーンショットが見つかりませんでした');
      return '';
    }

    // HTMLレポートを生成
    const htmlContent = this.generateHtmlReport(testResults);
    
    // ファイルに保存
    const reportFileName = `gtd-flow-test-report-${new Date().toISOString().split('T')[0]}.html`;
    const reportFilePath = path.join(this.reportOutputDir, reportFileName);
    
    fs.writeFileSync(reportFilePath, htmlContent, 'utf8');
    
    console.log(`📋 テストレポートを生成しました: ${reportFilePath}`);
    console.log(`🔍 テスト数: ${testResults.length}`);
    console.log(`📸 総スクリーンショット数: ${testResults.reduce((total, test) => total + test.screenshots.length, 0)}`);
    
    return reportFilePath;
  }

  /**
   * 古いスクリーンショットとレポートをクリーンアップ
   */
  cleanup(daysToKeep: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 古いスクリーンショットを削除
    if (fs.existsSync(this.testResultsDir)) {
      const screenshots = fs.readdirSync(this.testResultsDir);
      screenshots.forEach(file => {
        const filePath = path.join(this.testResultsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ 古いスクリーンショットを削除: ${file}`);
        }
      });
    }

    // 古いレポートを削除
    if (fs.existsSync(this.reportOutputDir)) {
      const reports = fs.readdirSync(this.reportOutputDir);
      reports.forEach(file => {
        const filePath = path.join(this.reportOutputDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ 古いレポートを削除: ${file}`);
        }
      });
    }
  }
}

// レポート生成スクリプトとして実行する場合
if (require.main === module) {
  const reporter = new GtdFlowTestReporter();
  
  reporter.generateReport()
    .then(reportPath => {
      if (reportPath) {
        console.log('\n🎉 レポート生成完了!');
        console.log(`📁 レポートファイル: ${reportPath}`);
        console.log('\nブラウザで開いてテスト結果を確認してください。');
      }
    })
    .catch(error => {
      console.error('❌ レポート生成中にエラーが発生しました:', error);
    });
}
