import { Routes, Route } from 'react-router-dom'

// 簡易的なページコンポーネント
const HomePage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">青春18切符ランダム旅行</h1>
    <p>現在地から青春18切符で行けるランダムな駅を提案します</p>
  </div>
)

const SearchPage = () => <div className="container mx-auto p-4">検索ページ（開発中）</div>
const ResultPage = () => <div className="container mx-auto p-4">結果ページ（開発中）</div>
const SharePage = () => <div className="container mx-auto p-4">共有ページ（開発中）</div>

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/share/:id" element={<SharePage />} />
      </Routes>
    </div>
  )
}

export default App