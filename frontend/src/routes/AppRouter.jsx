import { Navigate, Route, Routes } from 'react-router-dom'

import PublicLayout from '../components/layouts/PublicLayout'
import AdminLayout from '../components/layouts/AdminLayout'
import DashboardLayout from '../components/layouts/DashboardLayout'

import AdminRoute from '../components/routing/AdminRoute'
import ProtectedRoute from '../components/routing/ProtectedRoute'

import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import AuthCallbackPage from '../pages/auth/AuthCallbackPage'

import UnauthorizedPage from '../pages/common/UnauthorizedPage'
import NotFoundPage from '../pages/common/NotFoundPage'

import AboutUsPage from '../pages/about/AboutUsPage'
import ContactUsPage from '../pages/contact/ContactUsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import NotificationsPage from '../pages/notifications/NotificationsPage'

import FacilityPortalPage from '../pages/facilityPortal/FacilityPortalPage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'

/* ================= TICKETING ================= */
import TicketingPage from '../pages/ticketing/TicketingPage'
import TicketDetailsPage from '../pages/ticketing/TicketDetailsPage'
import TechnicianTicketsPage from '../pages/ticketing/TechnicianTicketsPage'

/* ================= BOOKING (STUDENT) ================= */
import BookingPage from '../pages/student/booking/CreateBooking'
import MyBookings from '../pages/student/booking/MyBookings'
import BookingDetails from '../pages/student/booking/BookingDetails'
import VerifyBooking from '../pages/student/booking/VerifyBooking'

/* ================= ADMIN ================= */
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminAddFacilityPage from '../pages/admin/AdminAddFacilityPage'
import AdminFacilityListPage from '../pages/admin/AdminFacilityListPage'
import AdminTicketHandlingPage from '../pages/admin/AdminTicketHandlingPage'
import SlaDashboardPage from '../pages/admin/SlaDashboardPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'

import AdminBookingDashboard from '../pages/admin/booking/AdminBookingDashboard'
import AdminBookingReview from '../pages/admin/booking/AdminBookingReview'
import AdminBookingScanner from '../pages/admin/booking/AdminBookingScanner'

export default function AppRouter() {
  return (
    <Routes>

      {/* ================= AUTH CALLBACK ================= */}
      <Route path="/oauth2/redirect" element={<AuthCallbackPage />} />

      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />

        <Route path="/facility-portal" element={<FacilityPortalPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />

        {/* Booking public access */}
        <Route path="/booking" element={<BookingPage />} />
      </Route>

      {/* ================= PROTECTED USER ROUTES ================= */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* ================= USER TICKETS ================= */}
          <Route path="/user/tickets" element={<TicketingPage />} />
          <Route path="/user/tickets/:id" element={<TicketDetailsPage role="user" />} />

          {/* ================= TECHNICIAN ================= */}
          <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          <Route path="/technician/tickets/:id" element={<TicketDetailsPage role="technician" />} />

          {/* ================= STUDENT BOOKINGS ================= */}
          <Route path="/student/booking/my" element={<MyBookings />} />
          <Route path="/student/booking/new" element={<BookingPage />} />
          <Route path="/student/booking/:id" element={<BookingDetails />} />
          <Route path="/verify-booking/:token" element={<VerifyBooking />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
        </Route>
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          
          {/* Admin overview */}
          <Route path="/admin" element={<AdminOverviewPage />} />

          {/* Facilities */}
          <Route path="/admin/add-facility" element={<AdminAddFacilityPage />} />
          <Route path="/admin/facility-list" element={<AdminFacilityListPage />} />

          {/* Tickets */}
          <Route path="/admin/ticket-handling" element={<AdminTicketHandlingPage />} />
          <Route path="/admin/tickets/:id" element={<TicketDetailsPage role="admin" />} />
          <Route path="/admin/sla-dashboard" element={<SlaDashboardPage />} />

          {/* Users */}
          <Route path="/admin/users" element={<AdminUsersPage />} />

          {/* Bookings admin */}
          <Route path="/admin/booking-handling" element={<AdminBookingDashboard />} />
          <Route path="/admin/booking/review/:id" element={<AdminBookingReview />} />
          <Route path="/admin/booking/scanner" element={<AdminBookingScanner />} />

          {/* Redirects */}
          <Route path="/admin/tickets" element={<Navigate to="/admin/ticket-handling" replace />} />
          <Route path="/admin/facilities" element={<Navigate to="/admin/facility-list" replace />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}