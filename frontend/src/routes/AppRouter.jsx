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
import BookingPage from '../pages/student/booking/CreateBooking'
import ContactUsPage from '../pages/contact/ContactUsPage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import FacilityPortalPage from '../pages/facilityPortal/FacilityPortalPage'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import NotFoundPage from '../pages/common/NotFoundPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import TicketingPage from '../pages/ticketing/TicketingPage'
import UnauthorizedPage from '../pages/common/UnauthorizedPage'

import MyBookings from '../pages/student/booking/MyBookings'
import BookingDetails from '../pages/student/booking/BookingDetails';
import AdminBookingDashboard from '../pages/admin/booking/AdminBookingDashboard'
import AdminBookingReview from '../pages/admin/booking/AdminBookingReview'
import AdminBookingScanner from '../pages/admin/booking/AdminBookingScanner'
import VerifyBooking from '../pages/student/booking/VerifyBooking'


export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/facility-portal" element={<FacilityPortalPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/student/booking" element={<MyBookings />} />
        <Route path="/student/booking/new" element={<BookingPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/student/booking/my" element={<MyBookings />} /> 
        <Route
              path="/student/booking/:id"
              element={<BookingDetails />}
              
            />
        <Route path="/verify-booking/:token" element={<VerifyBooking />} />

      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/add-facility" element={<AdminAddFacilityPage />} />
          <Route path="/admin/facility-list" element={<AdminFacilityListPage />} />
          <Route path="/admin/ticket-handling" element={<AdminTicketHandlingPage />} />
          <Route path="/admin/booking-handling" element={<AdminBookingDashboard />} />
          <Route path="/admin/logging-handling" element={<AdminLoggingHandlingPage />} />

          <Route path="/admin/users" element={<Navigate to="/admin/facility-list" replace />} />
          <Route path="/admin/facilities" element={<Navigate to="/admin/facility-list" replace />} />
          <Route path="/admin/tickets" element={<Navigate to="/admin/ticket-handling" replace />} />
        
          <Route
              path="/admin/booking/review/:id"
              element={
               
                  <AdminBookingReview />
                
              }
            />

          <Route
              path="/admin/booking/scanner"
              element={
                
                  <AdminBookingScanner />
              
              }
            />



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