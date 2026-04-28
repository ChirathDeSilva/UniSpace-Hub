import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const dashboardActions = [
  {
    title: 'SLA Dashboard',
    description: 'Monitor SLA risk and breach alerts in real time.',
    to: '/admin/sla-dashboard',
  },
  {
    title: 'Add Facility',
    description: 'Create and configure a new facility record.',
    to: '/admin/add-facility',
  },
  {
    title: 'List Added Facilities',
    description: 'View and manage all created facility entries.',
    to: '/admin/facility-list',
  },
  {
    title: 'Ticket Handling',
    description: 'Track, assign, and resolve support tickets.',
    to: '/admin/ticket-handling',
  },
  {
    title: 'Booking Handling',
    description: 'Review facility bookings and resolve scheduling issues.',
    to: '/admin/booking-handling',
  },
  {
    title: 'User Management',
    description: 'Manage users, assign roles, and remove accounts.',
    to: '/admin/users',
  },
]

export default function AdminOverviewPage() {
  return (
    <section className="stack reveal" aria-labelledby="admin-overview-title">
      <div className="stack" style={{ gap: '0.4rem' }}>
        <h1 id="admin-overview-title">Admin Dashboard</h1>
        <p>Select a module to start administrative operations.</p>
      </div>

      <div className="admin-action-grid">
        {dashboardActions.map((item) => (
          <Card key={item.to} className="admin-action-card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link to={item.to}>
              <Button>Open {item.title}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
