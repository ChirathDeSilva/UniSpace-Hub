import Card from '../../components/ui/Card'

export default function DashboardHomePage() {
  return (
    <section className="stack reveal-stagger">
      <div className="stack">
        <h1>Dashboard</h1>
        <p>Pick a module and start building your team features.</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <Card>
          <h2 style={{ marginBottom: '0.5rem' }}>Bookings</h2>
          <p>Room and facility reservations.</p>
        </Card>

        <Card>
          <h2 style={{ marginBottom: '0.5rem' }}>Timetable</h2>
          <p>Class schedules and conflict checks.</p>
        </Card>

        <Card>
          <h2 style={{ marginBottom: '0.5rem' }}>Support Tickets</h2>
          <p>Track and resolve student requests.</p>
        </Card>
      </div>
    </section>
  )
}