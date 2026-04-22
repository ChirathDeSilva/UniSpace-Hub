import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layouts/DashboardLayout'
import PublicLayout from '../components/layouts/PublicLayout'
import AboutUsPage from '../pages/about/AboutUsPage'
import BookingPage from '../pages/booking/BookingPage'
import ContactUsPage from '../pages/contact/ContactUsPage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import HomePage from '../pages/home/HomePage'
import NotFoundPage from '../pages/common/NotFoundPage'
import TicketingPage from '../pages/ticketing/TicketingPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHomePage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}