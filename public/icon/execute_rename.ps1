# 1. CSVファイルを読み込む（文字化け防止のためUTF8を指定）
$list = Import-Csv -Path "rename_list.csv" -Encoding UTF8

Write-Host "リネームを開始します..." -ForegroundColor Cyan

foreach ($item in $list) {
    $old = $item.OldName
    $new = $item.NewName

    # 元のファイルが存在し、かつ名前が変わる場合のみ実行
    if (Test-Path $old) {
        if ($old -ne $new) {
            try {
                Rename-Item -Path $old -NewName $new -ErrorAction Stop
                Write-Host "完了: $old -> $new" -ForegroundColor Green
            } catch {
                Write-Host "エラー: $old の変更に失敗しました ($_)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "スキップ: $old が見つかりません" -ForegroundColor Yellow
    }
}

Write-Host "すべての処理が終了しました！" -ForegroundColor Cyan
Pause