import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { PricingPage } from '@/pages/PricingPage';
import { StoriesPage } from '@/pages/StoriesPage';
import { AboutPage } from '@/pages/AboutPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EventsPage } from '@/pages/EventsPage';
import { CreateEventPage } from '@/pages/CreateEventPage';
import { OverviewPage } from '@/pages/OverviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* TODO: Wrap with ProtectedRoute when backend auth integration is restored */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/events/new" element={<CreateEventPage />} />
        <Route path="/dashboard/overview" element={<OverviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
