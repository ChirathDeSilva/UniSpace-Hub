import { useState } from 'react'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import './ContactUsPage.css'

const initialFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const initialErrorsState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState(initialErrorsState)
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'
  const [submitMessage, setSubmitMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus(null)
    setSubmitMessage('')

    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage('Thank you for your message! We will get back to you soon.')
        setFormData(initialFormState)
        setErrors(initialErrorsState)
      } else {
        setSubmitStatus('error')
        setSubmitMessage('Failed to send your message. Please try again later.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('An error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormState)
    setErrors(initialErrorsState)
    setSubmitStatus(null)
    setSubmitMessage('')
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-hero-content">
          <h1 id="contact-title">Get in Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div className="container page-section">
        <div className="contact-grid">
          {/* Form Section */}
          <section className="contact-form-section card stack reveal">
            <div className="stack">
              <h2>Send us a Message</h2>

              {submitStatus && (
                <div
                  className={`contact-alert contact-alert-${submitStatus}`}
                  role="alert"
                >
                  <span className="contact-alert-icon">
                    {submitStatus === 'success' ? '✓' : '⚠'}
                  </span>
                  <span>{submitMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="stack" noValidate>
                <InputField
                  id="contact-name"
                  name="name"
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={isLoading}
                  required
                />

                <InputField
                  id="contact-email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={isLoading}
                  required
                />

                <InputField
                  id="contact-subject"
                  name="subject"
                  label="Subject"
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  disabled={isLoading}
                  required
                />

                <div className="field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows="6"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    required
                  ></textarea>
                  {errors.message && (
                    <p className="field-error" id="contact-message-error" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="contact-form-actions cluster">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Spinner /> Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoading}>
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Contact Info Section */}
          <section className="contact-info-section">
            <div className="contact-info-card">
              <div className="contact-info-icon email-icon">✉</div>
              <h3>Email Us</h3>
              <a href="mailto:support@unispacehub.com">support@unispacehub.com</a>
              <p className="text-muted">We'll get back to you within 24 hours</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon phone-icon">☎</div>
              <h3>Call Us</h3>
              <a href="tel:+1234567890">+1 (234) 567-8900</a>
              <p className="text-muted">Monday - Friday: 9 AM - 5 PM</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon location-icon">📍</div>
              <h3>Visit Us</h3>
              <p>Campus Administration Building</p>
              <p className="text-muted">123 University Avenue, City, State 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}