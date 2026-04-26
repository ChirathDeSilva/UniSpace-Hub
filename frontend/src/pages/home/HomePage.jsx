import Card from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import bookingImage from '../../assets/home/facility-booking.svg'
import portalImage from '../../assets/home/facility-portal.svg'
import helpDeskImage from '../../assets/home/help-desk.svg'
import heroImage from '../../assets/home/hero-campus.svg'

const homeCards = [
  {
    title: 'Facility Portal',
    description:
      'Access a centralized portal to explore available spaces, services, and facility information for smooth campus operations.',
    image: portalImage,
    alt: 'Facility portal preview illustration',
    to: '/facility-portal',
  },
  {
    title: 'Ticketing',
    description:
      'Get quick assistance for technical and service requests, track ticket progress, and connect with the right team.',
    image: helpDeskImage,
    alt: 'Help desk support illustration',
    to: '/ticketing',
  },
  {
    title: 'Facility Booking',
    description:
      'Reserve classrooms, labs, and common areas with a clear schedule view designed for students, staff, and administrators.',
    image: bookingImage,
    alt: 'Facility booking calendar illustration',
    to: '/booking',
  },
]

export default function HomePage() {
  return (
    <div className="home-page stack reveal-stagger">
      <section className="home-hero" aria-labelledby="home-title">
        <img src={heroImage} alt="University campus banner" className="home-hero-image" />
        <div className="home-hero-content">
          <p className="home-hero-kicker">Uni Space Hub</p>
          <h1 id="home-title">Smart Campus Facility Management</h1>
          <p>
            A streamlined platform for facility access, support, and booking, built with clarity,
            trust, and efficiency in mind.
          </p>
        </div>
      </section>

      <section className="home-intro card">
        <h2>Welcome to Uni Space Hub</h2>
        <p>
          Plan your campus activities faster with one modern workspace for discovery, support,
          and reservations.
        </p>
      </section>

      <section className="home-card-grid" aria-label="Core modules">
        {homeCards.map((item) => (
          <Link key={item.title} to={item.to} className="home-feature-link" aria-label={`Open ${item.title}`}>
            <Card className="home-feature-card">
              <img src={item.image} alt={item.alt} className="home-feature-image" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}