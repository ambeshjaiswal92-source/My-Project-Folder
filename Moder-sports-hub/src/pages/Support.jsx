import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Predefined bot responses
const botResponses = {
  greeting: "Hello! 👋 Welcome to Moder Sports Hub support. How can I help you today?",
  shipping: "🚚 Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout for ₹199. Free shipping on orders over ₹5,000!",
  returns: "📦 We offer 30-day returns on unworn items with tags attached. Initiate a return from your order details page and we'll email you a prepaid label. Refunds process in 5-7 business days.",
  size: "📏 Check our Size Guide section on this page for detailed measurements. Generally: S (36-38 chest), M (38-40), L (40-43), XL (43-46). When in doubt, size up!",
  payment: "💳 We accept all major credit/debit cards, UPI, Net Banking, and Cash on Delivery. All payments are 100% secure with SSL encryption.",
  order: "📋 You can track your order by logging into your account and visiting 'My Orders'. You'll also receive email updates at each stage of delivery.",
  exchange: "🔄 Yes! Start a return, select 'Exchange', and choose your preferred size. We'll ship the new item once we receive the original.",
  international: "🌍 We currently ship within India only. International shipping is planned for Q3 2026. Stay tuned!",
  contact: "📞 You can reach us at:\n• Email: support@moder.com\n• Phone: +91 98765 43210\n• Hours: 9am-6pm IST, Mon-Sat",
  default: "I'm not sure about that. Could you try asking about shipping, returns, sizes, payment, orders, or exchanges? Or type 'contact' to reach our human support team.",
}

const getKeywords = (message) => {
  const msg = message.toLowerCase()
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) return 'greeting'
  if (msg.includes('ship') || msg.includes('deliver') || msg.includes('arrival')) return 'shipping'
  if (msg.includes('return') || msg.includes('refund') || msg.includes('money back')) return 'returns'
  if (msg.includes('size') || msg.includes('fit') || msg.includes('measure')) return 'size'
  if (msg.includes('pay') || msg.includes('card') || msg.includes('upi') || msg.includes('cod')) return 'payment'
  if (msg.includes('order') || msg.includes('track') || msg.includes('status')) return 'order'
  if (msg.includes('exchange') || msg.includes('swap') || msg.includes('different size')) return 'exchange'
  if (msg.includes('international') || msg.includes('abroad') || msg.includes('outside india')) return 'international'
  if (msg.includes('contact') || msg.includes('phone') || msg.includes('email') || msg.includes('call')) return 'contact'
  return 'default'
}

function Support() {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: botResponses.greeting, time: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText.trim(),
      time: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const keyword = getKeywords(inputText)
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botResponses[keyword],
        time: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const quickReplies = ['Shipping', 'Returns', 'Size Guide', 'Payment', 'Track Order']

  const handleQuickReply = (reply) => {
    setInputText(reply)
    const event = { preventDefault: () => {} }
    setTimeout(() => {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: reply,
        time: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setIsTyping(true)

      setTimeout(() => {
        const keyword = getKeywords(reply)
        const botMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: botResponses[keyword],
          time: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)
    }, 100)
    setInputText('')
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="py-5">
      <div className="container">
        <div className="mb-5 text-center">
          <span className="badge badge-primary mb-2">Support Center</span>
          <h1 className="text-white mb-3">Need help? We have you covered.</h1>
          <p className="text-muted-custom mb-0">
            Find answers for sizing, returns, and common questions, or reach out to our team directly.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card-dark h-100 p-4" id="contact">
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-warning text-dark me-2">Contact Us</span>
                <i className="bi bi-envelope text-warning fs-5"></i>
              </div>
              <p className="text-muted-custom mb-3">
                Our support hours are 9am–6pm IST, Monday to Saturday. We respond within one business day.
              </p>
              <ul className="list-unstyled text-muted-custom mb-3">
                <li className="mb-2"><i className="bi bi-envelope-open me-2 text-warning"></i>support@moder.com</li>
                <li className="mb-2"><i className="bi bi-telephone me-2 text-warning"></i>+91 98765 43210</li>
                <li className="mb-2"><i className="bi bi-geo-alt me-2 text-warning"></i>Lane 4, Sector 21, Pune, IN</li>
              </ul>
              <button 
                className="btn btn-primary"
                onClick={() => setChatOpen(true)}
              >
                <i className="bi bi-chat-dots me-2"></i>Chat with us
              </button>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card-dark h-100 p-4" id="size-guide">
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-info text-dark me-2">Size Guide</span>
                <i className="bi bi-rulers text-info fs-5"></i>
              </div>
              <p className="text-muted-custom mb-3">Measure chest, waist, and hips; compare with our chart below.</p>
              <div className="table-responsive">
                <table className="table table-dark table-sm align-middle mb-0">
                  <thead>
                    <tr className="border-secondary">
                      <th>Size</th>
                      <th>Chest (in)</th>
                      <th>Waist (in)</th>
                      <th>Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['S', '36-38', '29-31', '35-37'], ['M', '38-40', '31-33', '37-39'], ['L', '40-43', '33-36', '39-42'], ['XL', '43-46', '36-39', '42-45']].map(([size, chest, waist, hips]) => (
                      <tr key={size} className="border-secondary">
                        <td className="text-white">{size}</td>
                        <td className="text-muted-custom">{chest}</td>
                        <td className="text-muted-custom">{waist}</td>
                        <td className="text-muted-custom">{hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card-dark h-100 p-4" id="returns">
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-success text-dark me-2">Returns</span>
                <i className="bi bi-box-seam text-success fs-5"></i>
              </div>
              <p className="text-muted-custom mb-3">30-day returns on unworn items with tags. Refunds are issued to the original payment method.</p>
              <ul className="text-muted-custom mb-0">
                <li className="mb-2">Initiate a return from your order details page.</li>
                <li className="mb-2">Use the prepaid label provided via email.</li>
                <li className="mb-2">Processing typically takes 5-7 business days after receipt.</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card-dark h-100 p-4" id="faqs">
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-secondary text-white me-2">FAQs</span>
                <i className="bi bi-question-circle text-secondary fs-5"></i>
              </div>
              <div className="accordion accordion-flush" id="faqAccordion">
                {[{
                  q: 'How long does shipping take?',
                  a: 'Standard shipping takes 5-7 business days. Express options are available at checkout.',
                }, {
                  q: 'Can I exchange for a different size?',
                  a: 'Yes. Start a return, choose exchange, and select your size. Exchanges ship once we receive the original item.',
                }, {
                  q: 'Do you ship internationally?',
                  a: 'We currently ship within India. International shipping is planned for Q3 2026.',
                }].map(({ q, a }, idx) => (
                  <div className="accordion-item bg-transparent border-0" key={q}>
                    <h2 className="accordion-header" id={`faq-${idx}`}>
                      <button
                        className={`accordion-button ${idx === 0 ? '' : 'collapsed'}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq-collapse-${idx}`}
                        aria-expanded={idx === 0}
                        aria-controls={`faq-collapse-${idx}`}
                      >
                        {q}
                      </button>
                    </h2>
                    <div
                      id={`faq-collapse-${idx}`}
                      className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`}
                      aria-labelledby={`faq-${idx}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body text-muted-custom">
                        {a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Chat Widget */}
        {chatOpen && (
          <div 
            className="position-fixed shadow-lg"
            style={{ 
              bottom: '20px', 
              right: '20px', 
              width: '380px', 
              maxWidth: 'calc(100vw - 40px)',
              height: '500px',
              maxHeight: 'calc(100vh - 100px)',
              zIndex: 1050,
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#1a1a2e'
            }}
          >
            {/* Chat Header */}
            <div 
              className="d-flex align-items-center justify-content-between p-3"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.2)' }}
                >
                  <i className="bi bi-headset text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="text-white mb-0 fw-semibold">Moder Support</h6>
                  <small className="text-white-50">
                    <span className="bg-success rounded-circle d-inline-block me-1" style={{ width: '8px', height: '8px' }}></span>
                    Online
                  </small>
                </div>
              </div>
              <button 
                className="btn btn-link text-white p-0"
                onClick={() => setChatOpen(false)}
              >
                <i className="bi bi-x-lg fs-5"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              className="flex-grow-1 p-3 overflow-auto"
              style={{ background: '#16213e' }}
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                      style={{ width: '32px', height: '32px', background: '#667eea' }}
                    >
                      <i className="bi bi-robot text-white small"></i>
                    </div>
                  )}
                  <div 
                    className={`p-3 ${msg.sender === 'user' ? 'text-white' : 'text-white'}`}
                    style={{ 
                      maxWidth: '80%',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#1f2b47',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <p className="mb-1 small">{msg.text}</p>
                    <small className="text-white-50" style={{ fontSize: '10px' }}>{formatTime(msg.time)}</small>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="d-flex justify-content-start mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: '32px', height: '32px', background: '#667eea' }}
                  >
                    <i className="bi bi-robot text-white small"></i>
                  </div>
                  <div className="p-3" style={{ background: '#1f2b47', borderRadius: '16px 16px 16px 4px' }}>
                    <div className="d-flex gap-1">
                      <span className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 1s infinite' }}></span>
                      <span className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 1s infinite 0.2s' }}></span>
                      <span className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 1s infinite 0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 py-2" style={{ background: '#1a1a2e' }}>
              <div className="d-flex gap-2 flex-wrap">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    className="btn btn-sm btn-outline-light rounded-pill"
                    onClick={() => handleQuickReply(reply)}
                    style={{ fontSize: '12px' }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-top border-secondary" style={{ background: '#1a1a2e' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ borderRadius: '20px 0 0 20px' }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary px-4"
                  style={{ borderRadius: '0 20px 20px 0' }}
                  disabled={!inputText.trim()}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Floating Chat Button (when chat is closed) */}
        {!chatOpen && (
          <button
            className="btn btn-primary position-fixed shadow-lg d-flex align-items-center justify-content-center"
            style={{ 
              bottom: '20px', 
              right: '20px', 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%',
              zIndex: 1050,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
            onClick={() => setChatOpen(true)}
          >
            <i className="bi bi-chat-dots-fill fs-4"></i>
          </button>
        )}      </div>
    </main>
  )
}

export default Support
