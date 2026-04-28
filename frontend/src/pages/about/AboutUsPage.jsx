import './AboutUsPage.css'

const values = [
  {
    icon: '🎯',
    title: 'Clarity',
    description: 'We believe in transparent communication and clear information architecture to help users navigate campus facilities effortlessly.',
  },
  {
    icon: '🤝',
    title: 'Trust',
    description: 'Security and reliability are at the core of our platform, ensuring your data and bookings are always safe.',
  },
  {
    icon: '⚡',
    title: 'Efficiency',
    description: 'We streamline facility management processes to save time and reduce administrative overhead for everyone.',
  },
  {
    icon: '🌱',
    title: 'Innovation',
    description: 'Continuous improvement and adoption of modern technologies to enhance the user experience.',
  },
]

const stats = [
  {
    number: '1000+',
    label: 'Students & Staff',
  },
  {
    number: '50+',
    label: 'Facilities',
  },
  {
    number: '10K+',
    label: 'Monthly Bookings',
  },
  {
    number: '99%',
    label: 'Uptime',
  },
]

export default function AboutUsPage() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-content">
          <h1 id="about-title">About Uni Space Hub</h1>
          <p>Revolutionizing campus facility management through smart technology and user-centered design.</p>
        </div>
      </section>

      <div className="container page-section">
        {/* Mission Section */}
        <section className="about-section about-mission card reveal">
          <div className="about-section-content">
            <h2>Our Mission</h2>
            <p>
              At Uni Space Hub, our mission is to simplify facility access, support, and booking for universities and educational institutions. We empower students, staff, and administrators to manage campus resources efficiently through an intuitive, modern platform.
            </p>
            <p>
              We believe that technology should enhance campus life, not complicate it. That's why we've built a platform that's as easy to use as it is powerful.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="about-section about-vision card reveal">
          <div className="about-section-content">
            <h2>Our Vision</h2>
            <p>
              We envision a future where every campus has seamless, integrated facility management. A world where students can discover, book, and access campus spaces with just a few clicks, while administrators can focus on what matters most—supporting their community.
            </p>
            <p>
              Through continuous innovation and user feedback, we're building the standard for modern campus operations.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values-section">
          <h2 className="section-title">Our Core Values</h2>
          <div className="about-values-grid">
            {values.map((value) => (
              <div key={value.title} className="about-value-card card">
                <span className="about-value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats-section">
          <h2 className="section-title">By The Numbers</h2>
          <div className="about-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="about-stat-card">
                <div className="about-stat-number">{stat.number}</div>
                <div className="about-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="about-features-section">
          <h2 className="section-title">Why Choose Uni Space Hub?</h2>
          <div className="about-features-grid">
            <div className="about-feature-item card">
              <div className="about-feature-number">01</div>
              <h3>User-Centric Design</h3>
              <p>Built with real users in mind through extensive research and testing on campus communities.</p>
            </div>
            <div className="about-feature-item card">
              <div className="about-feature-number">02</div>
              <h3>Real-Time Synchronization</h3>
              <p>Live updates ensure accurate availability and prevent double-bookings across all facilities.</p>
            </div>
            <div className="about-feature-item card">
              <div className="about-feature-number">03</div>
              <h3>Comprehensive Support</h3>
              <p>Dedicated help desk and support system to assist students and staff with any questions.</p>
            </div>
            <div className="about-feature-item card">
              <div className="about-feature-number">04</div>
              <h3>Advanced Analytics</h3>
              <p>Administrators gain insights into facility usage patterns to optimize resource allocation.</p>
            </div>
            <div className="about-feature-item card">
              <div className="about-feature-number">05</div>
              <h3>Mobile Accessible</h3>
              <p>Fully responsive design works seamlessly on all devices for on-the-go facility access.</p>
            </div>
            <div className="about-feature-item card">
              <div className="about-feature-number">06</div>
              <h3>Enterprise Security</h3>
              <p>Bank-level encryption and security protocols protect user data and institutional information.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section card">
          <h2>Ready to Transform Your Campus?</h2>
          <p>Join thousands of institutions already using Uni Space Hub to streamline facility management.</p>
          <a href="/contact" className="btn btn-primary">Get in Touch</a>
        </section>
      </div>
    </div>
  )
}