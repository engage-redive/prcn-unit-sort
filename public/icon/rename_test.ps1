# 画像があるフォルダで実行してください
$files = Get-ChildItem -Filter "Menu_HOME_*.png"
$result = foreach ($f in $files) {
    $oldName = $f.Name
    $newName = $oldName
    
    # 正規表現の解説:
    # Menu_HOME_ : 消したい接頭辞
    # (\d{4})    : 1番目のグループ（4桁の数字）
    # -          : ハイフン
    # ([a-zA-Z]) : 2番目のグループ（ハイフンの直後の1文字）
    # .* : 残りの文字（MegaやWorldなど）を無視
    # \.png      : 拡張子
    if ($oldName -match 'Menu_HOME_(\d{4})-([a-zA-Z]).*\.png') {
        $num = $matches[1]           # 「0003」や「0025」をそのまま保持
        $initial = $matches[2].ToLower() # 「M」を「m」に変換
        $newName = "$num-$initial.png"
    } 
    # ハイフンがない基本形式（Menu_HOME_0001.pngなど）の場合
    elseif ($oldName -match 'Menu_HOME_(\d{4})\.png') {
        $newName = "$($matches[1]).png"
    }

    [PSCustomObject]@{
        OldName = $oldName
        NewName = $newName
    }
}

$result | Export-Csv -Path "rename_list.csv" -Encoding UTF8 -NoTypeInformation