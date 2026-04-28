import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/layouts/AdminLayout'
import DashboardLayout from '../components/layouts/DashboardLayout'
import PublicLayout from '../components/layouts/PublicLayout'
import AdminRoute from '../components/routing/AdminRoute'
import AboutUsPage from '../pages/about/AboutUsPage'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminAddFacilityPage from '../pages/admin/AdminAddFacilityPage'
import AdminBookingHandlingPage from '../pages/admin/AdminBookingHandlingPage'
import AdminFacilityListPage from '../pages/admin/AdminFacilityListPage'
import AdminLoggingHandlingPage from '../pages/admin/AdminLoggingHandlingPage'
import AdminTicketHandlingPage from '../pages/admin/AdminTicketHandlingPage'
import SlaDashboardPage from '../pages/admin/SlaDashboardPage'
import BookingPage from '../pages/booking/BookingPage'
import ContactUsPage from '../pages/contact/ContactUsPage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import FacilityPortalPage from '../pages/facilityPortal/FacilityPortalPage'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import NotFoundPage from '../pages/common/NotFoundPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import TicketingPage from '../pages/ticketing/TicketingPage'
import TicketDetailsPage from '../pages/ticketing/TicketDetailsPage'
import TechnicianTicketsPage from '../pages/ticketing/TechnicianTicketsPage'
import UserTicketsPage from '../pages/ticketing/UserTicketsPage'
import UnauthorizedPage from '../pages/common/UnauthorizedPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/facility-portal" element={<FacilityPortalPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/tickets" element={<AdminTicketHandlingPage />} />
        <Route path="/admin/tickets/:id" element={<TicketDetailsPage role="admin" />} />
        <Route path="/user/tickets" element={<UserTicketsPage />} />
        <Route path="/user/tickets/:id" element={<TicketDetailsPage role="user" />} />
        <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
        <Route path="/technician/tickets/:id" element={<TicketDetailsPage role="technician" />} />
        <Route path="/tickets" element={<Navigate to="/user/tickets" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/sla-dashboard" element={<SlaDashboardPage />} />
          <Route path="/admin/add-facility" element={<AdminAddFacilityPage />} />
          <Route path="/admin/facility-list" element={<AdminFacilityListPage />} />
          <Route path="/admin/ticket-handling" element={<AdminTicketHandlingPage />} />
          <Route path="/admin/booking-handling" element={<AdminBookingHandlingPage />} />
          <Route path="/admin/logging-handling" element={<AdminLoggingHandlingPage />} />

          <Route path="/admin/users" element={<Navigate to="/admin/facility-list" replace />} />
          <Route path="/admin/facilities" element={<Navigate to="/admin/facility-list" replace />} />
        </Route>
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHomePage />} />
      </Route>

      <Route path="/dashboard/home" element={<Navigate to="/admin" replace />} />

      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}