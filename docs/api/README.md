# Seishun18 Random Journey API ドキュメント

このドキュメントでは、Seishun18 Random Journey APIの使用方法について説明します。

## ベースURL

- 開発環境: `http://localhost:8787`
- 本番環境: `https://api.randomjourney.example.com`

## 認証

現在、APIは認証なしで利用可能です。将来的にはAPI keyによる認証を実装予定です。

## エンドポイント

### ヘルスチェック

```
GET /
```

APIの稼働状態を確認します。

**レスポンス例**:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "production"
}
```

### 全ての旅行先を取得

```
GET /destinations
```

システムに登録されている全ての旅行先情報を取得します。

**レスポンス例**:

```json
{
  "destinations": [
    {
      "id": "tokyo",
      "name": "東京",
      "prefecture": "東京都",
      "description": "日本の首都であり、最も人口の多い都市。現代的な高層ビルと伝統的な寺社が共存する。",
      "imageUrl": "https://example.com/images/tokyo.jpg",
      "attractions": ["東京スカイツリー", "浅草寺", "渋谷スクランブル交差点"],
      "accessInfo": "JR東京駅が主要ターミナル",
      "travelTime": 0
    },
    {
      "id": "kyoto",
      "name": "京都",
      "prefecture": "京都府",
      "description": "1000年以上の歴史を持つ古都。多くの寺院、神社、庭園がある日本文化の中心地。",
      "imageUrl": "https://example.com/images/kyoto.jpg",
      "attractions": ["金閣寺", "伏見稲荷大社", "清水寺"],
      "accessInfo": "JR京都駅から市バスやタクシーで各観光地へアクセス",
      "travelTime": 160
    }
  ]
}
```

### 特定の旅行先を取得

```
GET /destinations/:id
```

指定されたIDの旅行先情報を取得します。

**パラメータ**:

- `id`: 旅行先のID（例: `tokyo`, `kyoto`）

**レスポンス例**:

```json
{
  "destination": {
    "id": "tokyo",
    "name": "東京",
    "prefecture": "東京都",
    "description": "日本の首都であり、最も人口の多い都市。現代的な高層ビルと伝統的な寺社が共存する。",
    "imageUrl": "https://example.com/images/tokyo.jpg",
    "attractions": ["東京スカイツリー", "浅草寺", "渋谷スクランブル交差点"],
    "accessInfo": "JR東京駅が主要ターミナル",
    "travelTime": 0
  }
}
```

### ランダムな旅行先を取得

```
GET /random-destination
```

システムからランダムに選ばれた旅行先情報を取得します。

**レスポンス例**:

```json
{
  "destination": {
    "id": "sendai",
    "name": "仙台",
    "prefecture": "宮城県",
    "description": "東北地方最大の都市。「杜の都」と呼ばれる緑豊かな街で、伊達政宗ゆかりの地。",
    "imageUrl": "https://example.com/images/sendai.jpg",
    "attractions": ["仙台城跡", "瑞鳳殿", "秋保大滝"],
    "accessInfo": "JR仙台駅から市バスや地下鉄で各観光地へアクセス",
    "travelTime": 90
  }
}
```

## エラーレスポンス

APIはエラーが発生した場合、適切なHTTPステータスコードと共に以下の形式でエラー情報を返します。

```json
{
  "error": {
    "message": "エラーメッセージ"
  }
}
```

**一般的なエラーコード**:

- `400 Bad Request`: リクエストの形式が不正
- `404 Not Found`: 指定されたリソースが見つからない
- `500 Internal Server Error`: サーバー内部でエラーが発生 