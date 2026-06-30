import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
import { InvitationsPage } from '@/pages/InvitationsPage';
import { InvitationEditorPage } from '@/pages/InvitationEditorPage';
import { MediaPage } from '@/pages/MediaPage';
import { GuestsPage } from '@/pages/GuestsPage';
import { RSVPsPage } from '@/pages/RSVPsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  return (
    <AuthBootstrap>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignUpPage />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events/new"
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/overview"
            element={
              <ProtectedRoute>
                <OverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/invitations"
            element={
              <ProtectedRoute>
                <InvitationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/invitations/:invitationId/edit"
            element={
              <ProtectedRoute>
                <InvitationEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/guests"
            element={
              <ProtectedRoute>
                <GuestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rsvps"
            element={
              <ProtectedRoute>
                <RSVPsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/media"
            element={
              <ProtectedRoute>
                <MediaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthBootstrap>
  );
}
