import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { RandomPage } from '@/pages/RandomPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/random" element={<RandomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
