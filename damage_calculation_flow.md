# ポケモンダメージ計算フロー 実装調査レポート

本ドキュメントは、現在のプロジェクトにおけるダメージ計算の実装状況を、提供された仕様と比較・調査した結果をまとめたものです。

## 1. ダメージ計算式の構造とマッピング

仕様に基づいた計算フローが、コードのどの箇所で実行されているかを一覧化しました。

| 計算順序 | 仕様ステップ | 実装ファイル | 関数・箇所 | 端数処理 (仕様/実装) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **ベースダメージ** | `calculator.ts` | `damageInitial` (L368-370) | 切り捨て / `Math.floor` |
| 2 | **範囲補正** | `calculator.ts` | `multiplyByQ12AndRound` (L381) | 五捨五超入 / 同左 |
| 3 | **天気補正** | `calculator.ts` | `multiplyByQ12AndRound` (L405) | 五捨五超入 / 同左 |
| 4 | **急所補正** | `calculator.ts` | `multiplyByQ12AndRound` (L411) | 五捨五超入 / 同左 |
| 5 | **乱数補正** | `calculator.ts` | `Math.floor` (L498) | 切り捨て / 同左 |
| 6 | **タイプ一致補正** | `calculator.ts` | `multiplyByQ12AndRound` (L501) | 五捨五超入 / 同左 |
| 7 | **相性補正** | `calculator.ts` | `Math.floor` (L504) | 切り捨て / 同左 |
| 8 | **やけど補正** | `calculator.ts` | `multiplyByQ12AndRound` (L509) | 五捨五超入 / 同左 |
| 9 | **M (最終補正)** | `calculator.ts` | `multiplyByQ12AndRound` (L512) | 五捨五超入 / 同左 |
| 10 | **Mprotect** | - | **未実装** | 五捨五超入 / - |

---

## 2. 端数処理の実装詳細

ポケモン特有の丸め処理が以下の関数によって実装されています。

### 五捨五超入 (0.5以下切り捨て、0.5超切り上げ)
`src/calculation/mValueCalculator.ts` の `multiplyByQ12AndRound` 関数が担当します。
```typescript
// 内部ロジック
let resultB = Math.floor(intermediateA / 4096);
if ((intermediateA % 4096) > 2048) { // 0.5 * 4096 = 2048
    resultB += 1;
}
```

### 四捨五入 (M内部の補正値計算)
`src/calculation/mValueCalculator.ts` の `applyMultiplierAndRound` 関数が担当します。
```typescript
// 内部ロジック
const result = (currentValue * multiplier) / 4096;
return Math.round(result);
```

---

## 3. M (最終補正値) の内部計算

`M` は複数の補正を逐一「四捨五入」しながら計算される単一の補正値です。

| 補正項目 | 実装状況 | 備考 |
| :--- | :--- | :--- |
| 壁補正 | 実装済み | `calculateMValueQ12` |
| ブレインフォース | 一部実装 | 「アクセルブレイク/イナズマドライブ」として実装(1.33倍)。 |
| スナイパー補正 | **未実装** | - |
| いろめがね補正 | **未実装** | - |
| もふもふ(ほのお) | **不一致** | `finalPowerCalculator.ts` 内で威力補正として実装されている。 |
| Mhalf / Mfilter | 一部実装 | `multiscale`, `filter`, `solidrock` 等が対応。 |
| フレンドガード | 実装済み | `calculateMValueQ12` |
| たつじんのおび | 実装済み | `calculateMValueQ12` |
| メトロノーム | **未実装** | - |
| いのちのたま | 実装済み | `calculateMValueQ12` |
| 半減の実 | 実装済み | `calculateMValueQ12` |
| Mtwice | **未実装** | - |

---

## 4. 課題・未実装箇所のリスト

調査の結果、以下の点が仕様と異なっているか、未実装であることが分かりました。

1.  **Mprotect の欠落**: ダメージ計算の最終ステップである `Mprotect` がコード内に存在しません。
2.  **もふもふ補正の計算箇所**: 仕様では `M` (最終補正) 内で計算することになっていますが、現在は `calculateFinalMovePower` 内で技威力の倍率として処理されています。
3.  **M 内部補正の不足**: スナイパー、いろめがね、メトロノーム、および汎用的な倍増/半減 (Mtwice/Mhalf) のロジックが不足しています。
4.  **ブレインフォースの定義**: 現在は特定の技（アクセルブレイク等）に対して1.33倍が適用されていますが、特性「ブレインフォース（Neuroforce）」としての1.25倍補正が汎用的に実装されていません。
5.  **M内部の計算順序**: 現在の `calculateMValueQ12` では補正が並列に記述されていますが、仕様通り厳密な順序で逐一四捨五入が行われているか再確認が必要です。
