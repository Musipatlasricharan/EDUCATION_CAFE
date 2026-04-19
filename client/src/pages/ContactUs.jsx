import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Globe, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize EmailJS with Public Key
  useState(() => {
    emailjs.init('lDGYdLTg5jDKsdQph')
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)

    try {
      // Create template parameters - Ensure these match your EmailJS template!
      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject || 'General Enquiry',
        message: form.message,
      }

      console.log('Sending email with params:', templateParams);

      const response = await emailjs.send(
        'service_44rs3wr',
        'template_g8bja5i',
        templateParams,
        'lDGYdLTg5jDKsdQph'
      )

      console.log('EmailJS Success:', response.status, response.text);
      setLoading(false)
      setSubmitted(true)
      toast.success('Message sent! We\'ll reply within 24 hours.')
    } catch (error) {
      console.error('EmailJS Detailed Error:', error);
      setLoading(false)
      // Display a more helpful error message
      const errorMsg = error?.text || error?.message || 'Check console for details';
      toast.error(`Failed to send message: ${errorMsg}`);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ─── HERO ─── */}
      <div style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
        padding: '60px 56px',
        position: 'relative', overflow: 'hidden', marginBottom: 40,
      }}>
        {/* Decorative circles */}
        {[
          { w: 320, h: 320, top: -100, right: -80, opacity: 0.06 },
          { w: 200, h: 200, bottom: -60, left: '35%', opacity: 0.05 },
          { w: 120, h: 120, top: 20, left: '60%', opacity: 0.08 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            background: '#fff',
            width: c.w, height: c.h, top: c.top, bottom: c.bottom,
            left: c.left, right: c.right, opacity: c.opacity,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(255,255,255,0.13)',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: 22,
          }}>
            <MessageSquare size={14} color="#93c5fd" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', letterSpacing: 0.5 }}>Contact Support</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            We're Here to Help<br />
            <span style={{ color: '#93c5fd' }}>Anytime, Always</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            Got a question or found an issue? Drop us a message — our team responds within 24 hours on working days.
          </p>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { icon: <Clock size={16} />, label: '24h Response' },
              { icon: <Globe size={16} />, label: 'Open to All Students' },
              { icon: <CheckCircle size={16} />, label: 'Free Support' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
                <span style={{ color: '#93c5fd' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 32, alignItems: 'start' }}>

        {/* LEFT — Contact Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Info Cards */}
          {[
            {
              icon: <Mail size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
              label: 'Email Us', value: 'musipatlasricharan36@gmail.com',
              sub: 'We reply within 24 hours', href: 'mailto:musipatlasricharan36@gmail.com',
            },
            {
              icon: <Phone size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
              label: 'Call Us', value: '+91 73961 68735',
              sub: 'Mon – Sat · 9 AM – 6 PM IST', href: 'tel:+917396168735',
            },
            {
              icon: <MapPin size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
              label: 'Visit Us', value: 'NIN Colony, Uppal',
              sub: 'Hyderabad, Telangana — 500039', href: 'https://maps.google.com/?q=Uppal,Hyderabad',
            },
          ].map(card => (
            <a key={card.label} href={card.href} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '22px 28px', borderLeft: `4px solid ${card.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.18)` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: card.bg, color: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 4 }}>{card.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{card.sub}</p>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              </div>
            </a>
          ))}

          {/* Map */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Our Location</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>NIN Colony, Uppal · Hyderabad</p>
            </div>
            <iframe
              title="EduCafe Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30451.876540167856!2d78.5536!3d17.4045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9956b9b99d33%3A0x1a0b34fcd826ef3c!2sUppal%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%" height="200"
              style={{ border: 0, display: 'block' }}
              allowFullScreen="" loading="lazy"
            />
          </div>

          {/* Quick Help */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Quick Help</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { q: 'Forgot your password?', a: 'Use "Forgot Password" on the login page.' },
                { q: 'Resource not loading?', a: 'Use the Report button on the resource page.' },
                { q: 'Want to be a moderator?', a: 'Message us with subject "Moderator Request".' },
              ].map((item, i, arr) => (
                <div key={item.q} style={{
                  padding: '14px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{item.q}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Contact Form */}
        <div className="card" style={{ padding: '40px 44px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
                background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle size={44} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Message Sent! 🎉</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, maxWidth: 320, margin: '0 auto 8px' }}>
                Thanks for reaching out! We'll reply to
              </p>
              <p style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 32, fontSize: 15 }}>{form.email}</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                className="btn-primary" style={{ padding: '12px 32px' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Send Us a Message</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
                Fill in the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input className="input-field" placeholder="John Doe"
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)' }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input type="email" className="input-field" placeholder="you@email.com"
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)' }}>
                    Subject
                  </label>
                  <select className="input-field" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    style={{ width: '100%' }}>
                    <option value="">Choose a topic...</option>
                    <option value="general">General Enquiry</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="resource">Resource Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="moderator">Moderator Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)' }}>
                    Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea className="input-field" rows={6}
                    placeholder="Tell us what's on your mind..."
                    value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    {form.message.length}/500 characters
                  </p>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}
                  style={{
                    padding: '15px', fontSize: 15, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                  {loading ? (
                    <>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        animation: 'spin 0.7s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
