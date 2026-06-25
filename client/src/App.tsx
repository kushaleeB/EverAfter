import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { FeaturesPage } from '@/pages/FeaturesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
