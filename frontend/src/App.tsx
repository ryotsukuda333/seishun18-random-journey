import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div className="p-8 text-center"><h1 className="text-4xl font-bold">青春18切符ランダム旅行ジェネレーター</h1><p className="mt-4 text-gray-600">Coming Soon...</p></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
