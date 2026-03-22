/**
 * Google Apps Script for Contact Form Integration with Email Notifications
 * 
 * セットアップ手順:
 * 1. Googleスプレッドシートを作成
 * 2. スプレッドシート上部メニューから「拡張機能」→「Apps Script」を選択
 * 3. 以下のコードを貼り付け
 * 4. NOTIFICATION_EMAIL変数にメール送信先アドレスを設定
 * 5. 「デプロイ」→「新しいデプロイ」を選択
 * 6. 種類: 「ウェブアプリ」を選択
 * 7. 実行ユーザー: 「自分」を選択
 * 8. アクセス: 「全員」を選択
 * 9. デプロイURLをコピーして、script.jsの「YOUR_GOOGLE_APPS_SCRIPT_URL_HERE」と置き換え
 */

// ★★★ ここにメール通知先のアドレスを設定してください ★★★
const NOTIFICATION_EMAIL = 'kaori.deguchi@unlimitedenergy.co.jp';

/**
 * フォーム送信データを受信してスプレッドシートに保存し、メール通知を送信
 */
function doPost(e) {
    try {
        // スプレッドシートを取得（最初のシートを使用）
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // ヘッダー行がない場合は追加
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                '受信日時',
                '会社名・所属',
                'お名前',
                'メールアドレス',
                '電話番号',
                'カテゴリー',
                'お問い合わせ内容'
            ]);

            // ヘッダー行のスタイル設定
            const headerRange = sheet.getRange(1, 1, 1, 7);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#1a365d');
            headerRange.setFontColor('#ffffff');
        }

        // POSTデータを解析
        const data = JSON.parse(e.postData.contents);

        // 新しい行を追加
        sheet.appendRow([
            data.timestamp,
            data.company,
            data.name,
            data.email,
            data.phone,
            data.inquiryType,
            data.message
        ]);

        // メール通知を送信
        sendEmailNotification(data);

        // 成功レスポンスを返す
        return ContentService
            .createTextOutput(JSON.stringify({
                status: 'success',
                message: 'データが正常に保存されました'
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // エラーレスポンスを返す
        return ContentService
            .createTextOutput(JSON.stringify({
                status: 'error',
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * メール通知を送信する関数
 */
function sendEmailNotification(data) {
    Logger.log('=== メール送信開始 ===');
    Logger.log('送信先: ' + NOTIFICATION_EMAIL);
    Logger.log('受信データ: ' + JSON.stringify(data));

    try {
        // カテゴリーの日本語表記に変換
        const categoryMap = {
            'back-office': 'バックオフィス支援',
            'grant': '補助金・研究費 採択後支援',
            'conference': '学会・国際会議運営支援',
            'hr': '人材マッチング・育成支援',
            'other': 'その他（ざっくりしたご相談など）'
        };

        const categoryJa = categoryMap[data.inquiryType] || data.inquiryType;
        Logger.log('カテゴリー変換: ' + data.inquiryType + ' -> ' + categoryJa);

        // メール件名
        const subject = `【お問い合わせ受付】${data.company} ${data.name}様より`;
        Logger.log('メール件名: ' + subject);

        // HTMLメール本文
        const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', 'Meiryo', 'メイリオ', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f7fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .info-row {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #cbd5e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 5px;
          }
          .value {
            color: #2d3748;
          }
          .message-box {
            background: white;
            padding: 15px;
            border-left: 4px solid #1a365d;
            margin-top: 10px;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #cbd5e0;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🔔 新規お問い合わせ受付</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Unlimited Energy お問い合わせフォーム</p>
          </div>
          <div class="content">
            <div class="info-row">
              <div class="label">📅 受信日時</div>
              <div class="value">${data.timestamp}</div>
            </div>
            
            <div class="info-row">
              <div class="label">🏢 会社名・所属</div>
              <div class="value">${data.company}</div>
            </div>
            
            <div class="info-row">
              <div class="label">👤 お名前</div>
              <div class="value">${data.name}</div>
            </div>
            
            <div class="info-row">
              <div class="label">📧 メールアドレス</div>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            
            <div class="info-row">
              <div class="label">📞 電話番号</div>
              <div class="value">${data.phone}</div>
            </div>
            
            <div class="info-row">
              <div class="label">📁 カテゴリー</div>
              <div class="value">${categoryJa}</div>
            </div>
            
            <div class="info-row">
              <div class="label">💬 お問い合わせ内容</div>
              <div class="message-box">${data.message}</div>
            </div>
            
            <div class="footer">
              このメールは、ウェブサイトのお問い合わせフォームから自動送信されています。<br>
              Googleスプレッドシートにもデータが保存されています。
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

        // テキストメール本文（HTMLが表示できない場合のフォールバック）
        const plainBody = `
【新規お問い合わせ受付】

受信日時: ${data.timestamp}
会社名・所属: ${data.company}
お名前: ${data.name}
メールアドレス: ${data.email}
電話番号: ${data.phone}
カテゴリー: ${categoryJa}

お問い合わせ内容:
${data.message}

---
このメールは、ウェブサイトのお問い合わせフォームから自動送信されています。
Googleスプレッドシートにもデータが保存されています。
    `;

        Logger.log('メール本文作成完了');

        // メール送信（MailAppを使用 - より互換性が高い）
        MailApp.sendEmail({
            to: NOTIFICATION_EMAIL,
            subject: subject,
            body: plainBody,
            htmlBody: htmlBody,
            name: 'Unlimited Energy お問い合わせフォーム'
        });

        Logger.log('✅ メール送信成功: ' + NOTIFICATION_EMAIL);

    } catch (error) {
        Logger.log('❌ メール送信エラー: ' + error.toString());
        Logger.log('エラー詳細: ' + error.stack);
        throw error; // エラーを再スローして、doPostでもキャッチできるようにする
    }
}

// GETリクエスト用（テスト用）
function doGet(e) {
    return ContentService
        .createTextOutput('Contact Form API is running. Use POST method to submit data.')
        .setMimeType(ContentService.MimeType.TEXT);
}
