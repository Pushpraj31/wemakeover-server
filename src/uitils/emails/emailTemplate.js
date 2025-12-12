import 'dotenv/config';

// Base styles for consistent design across all templates
const baseStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .header {
      background: linear-gradient(135deg, #CC2B52 0%, #B02547 100%);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #1f2937;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      background: #CC2B52;
      color: #ffffff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      margin: 10px 0;
    }
    .button:hover {
      background: #B02547;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(204, 43, 82, 0.3);
    }
    .info-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      border-left: 4px solid #CC2B52;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef3f3 0%, #fce8e8 100%);
      border: 2px solid #CC2B52;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 10px;
        border-radius: 12px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .footer {
        padding: 25px 20px;
      }
    }
  </style>
`;

const emailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <title>Email Verification - Wemakeover</title>
  ${baseStyles}
  <style>
    .otp-display {
      font-size: 42px;
      font-weight: 800;
      color: #CC2B52;
      letter-spacing: 8px;
      margin: 25px 0;
      text-align: center;
      background: #fef3f3;
      padding: 20px;
      border-radius: 12px;
      border: 2px dashed #CC2B52;
    }
    .instruction {
      text-align: center;
      color: #6b7280;
      margin: 20px 0;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Verify Your Email</h1>
      <p>Welcome to Wemakeover! Let's get you started</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hi there,
      </p>
      
      <p style="margin-bottom: 25px;">
        Thank you for choosing Wemakeover! To complete your registration and start enjoying our premium beauty services, please verify your email address using the OTP below:
      </p>
      
      <div class="otp-display">
        ${otp}
      </div>
      
      <div class="instruction">
        <p style="margin: 0;">Enter this code in the verification screen to continue</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> This OTP will expire in 5 minutes for security reasons.
      </div>
      
      <p style="margin-top: 25px;">
        If you didn't create an account with Wemakeover, please ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">Wemakeover - Beauty Services at Your Doorstep</p>
      <p style="margin: 0 0 10px 0;">Need help? Contact us at <a href="mailto:support@wemakeover.com" style="color: #CC2B52; text-decoration: none;">support@wemakeover.com</a></p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Wemakeover. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

const passwordResetEmailTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <title>Reset Your Password - Wemakeover</title>
  ${baseStyles}
  <style>
    .reset-instruction {
      text-align: center;
      margin: 25px 0;
      color: #6b7280;
    }
    .security-note {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin: 25px 0;
      color: #92400e;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Reset Your Password</h1>
      <p>Secure your Wemakeover account</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hello,
      </p>
      
      <p style="margin-bottom: 20px;">
        We received a request to reset your password for your Wemakeover account. Click the button below to create a new password:
      </p>
      
      <div class="button-container">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      
      <div class="reset-instruction">
        <p style="margin: 0;">Or copy and paste this link in your browser:</p>
        <p style="margin: 10px 0; word-break: break-all; color: #CC2B52; font-size: 14px;">
          ${resetLink}
        </p>
      </div>
      
      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and ensure your account is secure.
      </div>
      
      <p style="margin-top: 20px;">
        For your security, we recommend choosing a strong, unique password that you haven't used elsewhere.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">Wemakeover - Your Beauty Partner</p>
      <p style="margin: 0 0 10px 0;">Questions? <a href="mailto:support@wemakeover.com" style="color: #CC2B52; text-decoration: none;">Contact our support team</a></p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Wemakeover. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

const contactUsEmailTemplate = (userName, userEmail, message) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>New Contact Request - Wemakeover</title>
  ${baseStyles}
  <style>
    .user-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
      align-items: flex-start;
    }
    .info-label {
      font-weight: 600;
      color: #0369a1;
      min-width: 80px;
      font-size: 14px;
    }
    .info-value {
      color: #0c4a6e;
      font-size: 15px;
      flex: 1;
    }
    .message-box {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-style: italic;
      color: #475569;
      line-height: 1.6;
    }
    .priority-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>New Contact Request</h1>
      <p>A potential customer needs assistance</p>
    </div>
    
    <div class="content">
      <div class="priority-badge">🔄 Requires Response</div>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hello Team,
      </p>
      
      <p style="margin-bottom: 20px;">
        You've received a new message through the Contact Us form. Here are the details:
      </p>
      
      <div class="user-info">
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${userName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">
            <a href="mailto:${userEmail}" style="color: #CC2B52; text-decoration: none;">${userEmail}</a>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span>
        </div>
      </div>
      
      <div style="margin: 25px 0;">
        <h3 style="color: #CC2B52; margin-bottom: 10px;">📝 Customer Message:</h3>
        <div class="message-box">
          ${message}
        </div>
      </div>
      
      <div class="info-card">
        <p style="margin: 0; color: #1f2937;">
          <strong>Next Steps:</strong> Please respond to this inquiry within 24 hours to provide excellent customer service.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">Wemakeover - Customer Support</p>
      <p style="margin: 0 0 10px 0;">This is an automated notification from your website contact form.</p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Wemakeover. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
};

const bookingNotificationEmailTemplate = (bookingData) => {
  const { 
    orderNumber, 
    customerName, 
    customerEmail, 
    customerPhone, 
    services, 
    bookingDate, 
    bookingSlot, 
    address, 
    subtotal, 
    taxAmount, 
    totalAmount, 
    paymentMethod, 
    paymentStatus, 
    status 
  } = bookingData;

  const servicesListHTML = services.map(service => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; word-wrap: break-word; overflow-wrap: break-word;">
        <strong>${service.name}</strong>
        ${service.description ? `<br/><span style="font-size: 13px; color: #6b7280;">${service.description}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${service.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${service.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
        ₹${(service.price * service.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const fullAddress = address.completeAddress || 
    `${address.houseFlatNumber ? address.houseFlatNumber + ', ' : ''}${address.streetAreaName ? address.streetAreaName + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`.trim();

  const statusColor = status === 'confirmed' ? '#10b981' : status === 'pending' ? '#f59e0b' : status === 'cancelled' ? '#ef4444' : '#6b7280';
  const paymentMethodColor = paymentMethod === 'cod' ? '#3b82f6' : paymentMethod === 'online' ? '#10b981' : '#6b7280';

  return `
<!DOCTYPE html>
<html>
<head>
  <title>New Booking - ${orderNumber}</title>
  ${baseStyles}
  <style>
    .order-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin-bottom: 25px;
      border: 2px solid #fcd34d;
    }
    .status-badges {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #CC2B52;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      color: #111827;
      font-weight: 500;
    }
    .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .services-table thead {
      background: #f3f4f6;
    }
    .services-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #374151;
      font-weight: 600;
      text-transform: uppercase;
    }
    .pricing-summary {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    .pricing-row.total {
      border-top: 2px solid #CC2B52;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: 700;
      color: #CC2B52;
    }
    .address-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .services-table {
        font-size: 12px;
      }
      .services-table th, .services-table td {
        padding: 8px 6px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎉 New Booking Received</h1>
      <p>Ready to deliver beautiful results!</p>
    </div>
    
    <div class="content">
      <div class="order-badge">
        Order #${orderNumber}
      </div>

      <div class="status-badges">
        <span class="badge" style="background-color: ${statusColor};">
          ${status.toUpperCase()}
        </span>
        <span class="badge" style="background-color: ${paymentMethodColor};">
          ${(paymentMethod || 'online').toUpperCase()}
        </span>
      </div>

      <div class="section">
        <div class="section-title">👤 Customer Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${customerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${customerEmail}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📅 Booking Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Booking Date</div>
            <div class="info-value">${bookingDate}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Time Slot</div>
            <div class="info-value">${bookingSlot}</div>
          </div>
        </div>
        
        <div class="address-box">
          <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">📍 Service Location</div>
          <div style="color: #78350f; font-size: 14px; line-height: 1.6;">
            ${fullAddress}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💅 Services Booked</div>
        <table class="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${servicesListHTML}
          </tbody>
        </table>
      </div>

      <div class="pricing-summary">
        <div class="pricing-row">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="pricing-row">
          <span>Tax (18% GST):</span>
          <span>₹${taxAmount.toFixed(2)}</span>
        </div>
        <div class="pricing-row total">
          <span>Total Amount:</span>
          <span>₹${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">Action Required</p>
      <p style="margin: 0 0 15px 0;">Please review this booking and prepare for the scheduled service.</p>
      <div style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        This is an automated notification. Please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>`;
};

const welcomeNewsletterEmailTemplate = (data) => {
  const { unsubscribeUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to Wemakeover Newsletter</title>
  ${baseStyles}
  <style>
    .welcome-message {
      text-align: center;
      margin-bottom: 30px;
    }
    .welcome-message h2 {
      color: #111827;
      font-size: 24px;
      margin-bottom: 15px;
    }
    .welcome-message p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
    .benefits-section {
      background: #f9fafb;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .benefits-section h3 {
      color: #CC2B52;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .benefit-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .benefit-icon {
      width: 24px;
      height: 24px;
      background: #CC2B52;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      flex-shrink: 0;
      margin-right: 12px;
    }
    .benefit-text {
      color: #374151;
      font-size: 15px;
      line-height: 1.5;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .frequency-info {
      background: #fef3c7;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
      text-align: center;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #CC2B52;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to Wemakeover</h1>
      <p>Your Beauty Journey Starts Here</p>
    </div>

    <div class="content">
      <div class="welcome-message">
        <h2>Thank You for Subscribing!</h2>
        <p>
          We're thrilled to have you join our beauty community. Get ready for exclusive tips, 
          special offers, and the latest updates on our at-home beauty services.
        </p>
      </div>

      <div class="benefits-section">
        <h3>What You'll Get:</h3>
        
        <div class="benefit-item">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text">
            <strong>Beauty Tips & Tricks:</strong> Expert advice on skincare, haircare, and makeup delivered to your inbox
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text">
            <strong>Exclusive Offers:</strong> Be the first to know about special discounts and seasonal promotions
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text">
            <strong>New Service Updates:</strong> Stay informed about our latest beauty services and offerings
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text">
            <strong>Wellness Content:</strong> Holistic beauty and self-care inspiration to help you look and feel your best
          </div>
        </div>
      </div>

      <div class="cta-section">
        <p style="color: #6b7280; margin-bottom: 20px;">
          Ready to experience luxury beauty services at home?
        </p>
        <a href="${process.env.FRONTEND_URL || 'https://wemakeover.com'}" class="button">
          Explore Our Services
        </a>
      </div>

      <div class="frequency-info">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          You'll receive our newsletter bi-weekly, packed with valuable content. 
          We respect your inbox and promise no spam!
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="social-links">
        <a href="#">Facebook</a> • 
        <a href="#">Instagram</a> • 
        <a href="#">Twitter</a>
      </div>
      
      <p style="margin: 15px 0;">
        Questions? Contact us at <a href="mailto:support@wemakeover.com" style="color: #CC2B52; text-decoration: none;">support@wemakeover.com</a>
      </p>
      
      <p style="margin: 15px 0; font-size: 12px;">
        <a href="${unsubscribeUrl}" style="color: #CC2B52; text-decoration: none;">Unsubscribe</a> • 
        <a href="${process.env.FRONTEND_URL || 'https://wemakeover.com'}/privacy-policy" style="color: #CC2B52; text-decoration: none;">Privacy Policy</a>
      </p>
      
      <p style="margin: 15px 0; color: #9ca3af; font-size: 11px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        Delivering beauty to your doorstep
      </p>
    </div>
  </div>
</body>
</html>`;
};

const enquiryNotificationEmailTemplate = (enquiryData) => {
  const {
    enquiryNumber,
    userDetails,
    serviceDetails,
    enquiryDetails,
    status,
    priority,
    createdAt,
    userId,
  } = enquiryData;

  const userType = userId ? 'Registered User' : 'Guest User';
  
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };
  
  const priorityColor = priorityColors[priority] || priorityColors.medium;
  
  const statusColors = {
    pending: '#f59e0b',
    contacted: '#3b82f6',
    quoted: '#8b5cf6',
    converted: '#10b981',
    cancelled: '#6b7280',
  };
  
  const statusColor = statusColors[status] || statusColors.pending;
  
  const formattedDate = new Date(createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <title>New Service Enquiry - Wemakeover</title>
  ${baseStyles}
  <style>
    .enquiry-number {
      text-align: center;
      background: #fef3c7;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    .enquiry-number h2 {
      margin: 0;
      color: #92400e;
      font-size: 24px;
      font-weight: 700;
    }
    .badges {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }
    .badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
    }
    .info-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      border-left: 4px solid #CC2B52;
    }
    .info-card h3 {
      margin: 0 0 15px 0;
      color: #111827;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 140px;
      max-width: 140px;
      font-size: 14px;
      flex-shrink: 0;
    }
    .info-value {
      color: #111827;
      font-size: 14px;
      flex: 1;
      min-width: 0;
    }
    .message-box {
      background: #fff;
      border: 2px dashed #d1d5db;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      font-style: italic;
      color: #4b5563;
      line-height: 1.6;
    }
    .icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #CC2B52;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      .info-row {
        flex-direction: column;
      }
      .info-label {
        min-width: auto;
        max-width: none;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>New Service Enquiry Received</h1>
      <p>A customer is interested in your services</p>
    </div>

    <div class="content">
      <div class="enquiry-number">
        <h2>${enquiryNumber}</h2>
      </div>

      <div class="badges">
        <span class="badge" style="background-color: ${statusColor};">
          ${status.toUpperCase()}
        </span>
        <span class="badge" style="background-color: ${priorityColor};">
          ${priority.toUpperCase()} PRIORITY
        </span>
        <span class="badge" style="background-color: #6366f1;">
          ${userType}
        </span>
      </div>

      <div class="info-card">
        <h3>
          <span class="icon">★</span>
          Service Details
        </h3>
        <div class="info-row">
          <span class="info-label">Service Name:</span>
          <span class="info-value"><strong>${serviceDetails.serviceName}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Category:</span>
          <span class="info-value">${serviceDetails.serviceCategory}</span>
        </div>
        ${serviceDetails.priceRange ? `
        <div class="info-row">
          <span class="info-label">Price Range:</span>
          <span class="info-value">₹${serviceDetails.priceRange}</span>
        </div>
        ` : ''}
      </div>

      <div class="info-card">
        <h3>
          <span class="icon">👤</span>
          Customer Details
        </h3>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${userDetails.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">
            <a href="mailto:${userDetails.email}" style="color: #CC2B52; text-decoration: none;">
              ${userDetails.email}
            </a>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">
            <a href="tel:${userDetails.phone}" style="color: #CC2B52; text-decoration: none;">
              ${userDetails.phone}
            </a>
          </span>
        </div>
      </div>

      ${enquiryDetails && (enquiryDetails.message || enquiryDetails.preferredDate || enquiryDetails.preferredTimeSlot) ? `
      <div class="info-card">
        <h3>
          <span class="icon">📋</span>
          Enquiry Details
        </h3>
        ${enquiryDetails.preferredDate ? `
        <div class="info-row">
          <span class="info-label">Preferred Date:</span>
          <span class="info-value">${new Date(enquiryDetails.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>
        ` : ''}
        ${enquiryDetails.preferredTimeSlot ? `
        <div class="info-row">
          <span class="info-label">Preferred Time:</span>
          <span class="info-value">${enquiryDetails.preferredTimeSlot}</span>
        </div>
        ` : ''}
        ${enquiryDetails.message ? `
        <div class="info-row">
          <span class="info-label">Message:</span>
        </div>
        <div class="message-box">
          "${enquiryDetails.message}"
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 25px; padding: 15px; background: #eff6ff; border-radius: 8px;">
        <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 500;">
          Enquiry received on: ${formattedDate}
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">
        Action Required
      </p>
      <p style="margin: 0 0 15px 0;">
        Please contact the customer as soon as possible to discuss their requirements.
      </p>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        This is an automated notification. Please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>`;
};

const enquiryConfirmationEmailTemplate = (enquiryData) => {
  const {
    enquiryNumber,
    userDetails,
    serviceDetails,
    enquiryDetails,
    createdAt,
  } = enquiryData;

  const formattedDate = new Date(createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Enquiry Confirmation - Wemakeover</title>
  ${baseStyles}
  <style>
    .success-icon {
      text-align: center;
      font-size: 60px;
      margin-bottom: 20px;
      color: #10b981;
    }
    .enquiry-number-box {
      text-align: center;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border: 2px solid #fbbf24;
    }
    .enquiry-number-box p {
      margin: 0 0 10px 0;
      color: #78350f;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .enquiry-number-box h2 {
      margin: 0;
      color: #92400e;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .service-summary {
      background: #f9fafb;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
      border-left: 4px solid #10b981;
    }
    .service-summary h3 {
      margin: 0 0 15px 0;
      color: #111827;
      font-size: 16px;
      font-weight: 600;
    }
    .service-row {
      display: flex;
      padding: 8px 0;
    }
    .service-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 120px;
      font-size: 14px;
    }
    .service-value {
      color: #111827;
      font-size: 14px;
    }
    .timeline {
      background: #eff6ff;
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
    }
    .timeline h3 {
      margin: 0 0 20px 0;
      color: #1e40af;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }
    .timeline-step {
      display: flex;
      margin-bottom: 15px;
      align-items: flex-start;
    }
    .timeline-step:last-child {
      margin-bottom: 0;
    }
    .timeline-number {
      background: #3b82f6;
      color: white;
      width: 30px;
      height: 30px;
      min-width: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      margin-right: 15px;
    }
    .timeline-content {
      flex: 1;
    }
    .timeline-content strong {
      color: #1e40af;
      font-size: 15px;
    }
    .timeline-content p {
      margin: 5px 0 0 0;
      color: #4b5563;
      font-size: 13px;
      line-height: 1.5;
    }
    .contact-box {
      background: #fef2f2;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
      text-align: center;
      border: 2px solid #fecaca;
    }
    .contact-box h3 {
      margin: 0 0 10px 0;
      color: #991b1b;
      font-size: 16px;
    }
    .contact-box p {
      margin: 5px 0;
      color: #7f1d1d;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .service-row {
        flex-direction: column;
      }
      .service-label {
        min-width: auto;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="success-icon">✓</div>
      <h1>Thank You for Your Enquiry!</h1>
      <p>We've received your service request</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">
        Hi <strong>${userDetails.name}</strong>, <br/>
        Thank you for your interest in our services. We're excited to help you look and feel your best!
      </p>

      <div class="enquiry-number-box">
        <p>Your Enquiry Reference Number</p>
        <h2>${enquiryNumber}</h2>
      </div>

      <div class="service-summary">
        <h3>📝 Service Summary</h3>
        <div class="service-row">
          <span class="service-label">Service:</span>
          <span class="service-value"><strong>${serviceDetails.serviceName}</strong></span>
        </div>
        <div class="service-row">
          <span class="service-label">Category:</span>
          <span class="service-value">${serviceDetails.serviceCategory}</span>
        </div>
        ${serviceDetails.priceRange ? `
        <div class="service-row">
          <span class="service-label">Price Range:</span>
          <span class="service-value">₹${serviceDetails.priceRange}</span>
        </div>
        ` : ''}
        ${enquiryDetails?.preferredDate ? `
        <div class="service-row">
          <span class="service-label">Preferred Date:</span>
          <span class="service-value">${new Date(enquiryDetails.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>
        ` : ''}
        <div class="service-row">
          <span class="service-label">Submitted on:</span>
          <span class="service-value">${formattedDate}</span>
        </div>
      </div>

      <div class="timeline">
        <h3>🕒 What Happens Next?</h3>
        
        <div class="timeline-step">
          <div class="timeline-number">1</div>
          <div class="timeline-content">
            <strong>Review Your Enquiry</strong>
            <p>Our team is reviewing your request and will get back to you shortly.</p>
          </div>
        </div>

        <div class="timeline-step">
          <div class="timeline-number">2</div>
          <div class="timeline-content">
            <strong>Get in Touch</strong>
            <p>We'll contact you within 24 hours via phone or email to discuss your requirements.</p>
          </div>
        </div>

        <div class="timeline-step">
          <div class="timeline-number">3</div>
          <div class="timeline-content">
            <strong>Confirm Booking</strong>
            <p>Once we discuss the details, we'll help you book your service at a convenient time.</p>
          </div>
        </div>

        <div class="timeline-step">
          <div class="timeline-number">4</div>
          <div class="timeline-content">
            <strong>Enjoy Your Service</strong>
            <p>Sit back and relax while our professionals take care of you!</p>
          </div>
        </div>
      </div>

      <div class="contact-box">
        <h3>Need Help?</h3>
        <p>If you have any questions or need immediate assistance, feel free to contact us:</p>
        <p>
          📧 Email: <a href="mailto:${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}" style="color: #CC2B52; text-decoration: none;">${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}</a><br/>
          📱 Phone: <a href="tel:${process.env.ADMIN_PHONE_NUMBER || '+91-XXXXXXXXXX'}" style="color: #CC2B52; text-decoration: none;">${process.env.ADMIN_PHONE_NUMBER || '+91-XXXXXXXXXX'}</a>
        </p>
      </div>

      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
        Please save your enquiry number <strong>${enquiryNumber}</strong> for future reference.
      </p>
    </div>

    <div class="footer">
      <p style="font-weight: 600; color: #374151;">
        Thank you for choosing Wemakeover!
      </p>
      <p>
        We're committed to providing you with the best beauty services.
      </p>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        Delivering beauty to your doorstep
      </div>
    </div>
  </div>
</body>
</html>`;
};

const bookingCancellationAdminEmailTemplate = (cancellationData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    services,
    bookingDate,
    bookingSlot,
    cancelledAt,
    cancellationReason,
    refundEligible,
    refundAmount,
    totalAmount
  } = cancellationData;

  const servicesListHTML = services.map(service => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${service.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${service.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
        ₹${(service.price * service.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Cancellation - Wemakeover</title>
  ${baseStyles}
  <style>
    .alert-badge {
      background: #fef2f2;
      color: #991b1b;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin-bottom: 25px;
      border: 2px solid #fca5a5;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #ef4444;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      color: #111827;
      font-weight: 500;
    }
    .reason-box {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .services-table thead {
      background: #f3f4f6;
    }
    .services-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #374151;
      font-weight: 600;
      text-transform: uppercase;
    }
    .refund-box {
      background: ${refundEligible ? '#d1fae5' : '#fee2e2'};
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: center;
    }
    .refund-box h3 {
      margin: 0 0 10px 0;
      color: ${refundEligible ? '#065f46' : '#991b1b'};
    }
    .refund-box p {
      margin: 5px 0;
      color: ${refundEligible ? '#047857' : '#b91c1c'};
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>⚠️ Booking Cancelled</h1>
      <p>A customer has cancelled their booking</p>
    </div>

    <div class="content">
      <div class="alert-badge">
        Order #${orderNumber} - CANCELLED
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${customerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${customerEmail}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Cancelled Booking Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Booking Date</div>
            <div class="info-value">${bookingDate}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Time Slot</div>
            <div class="info-value">${bookingSlot}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Cancelled At</div>
            <div class="info-value">${cancelledAt}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Amount</div>
            <div class="info-value" style="color: #ef4444; font-weight: 700;">₹${totalAmount.toFixed(2)}</div>
          </div>
        </div>
        
        ${cancellationReason ? `
        <div class="reason-box">
          <strong>Cancellation Reason:</strong>
          <div style="color: #7f1d1d; font-size: 14px; line-height: 1.6;">
            "${cancellationReason}"
          </div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Cancelled Services</div>
        <table class="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${servicesListHTML}
          </tbody>
        </table>
      </div>

      <div class="refund-box">
        <h3>${refundEligible ? '✅ Refund Eligible' : '❌ No Refund Required'}</h3>
        ${refundEligible ? `
          <p><strong>Refund Amount: ₹${refundAmount.toFixed(2)}</strong></p>
          <p>Please process the refund according to your refund policy.</p>
        ` : `
          <p>Payment was not completed (COD or pending payment).</p>
          <p>No refund action required.</p>
        `}
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">
        Action Required
      </p>
      <p style="margin: 0 0 15px 0;">
        Please note this cancellation in your records and follow up if needed.
      </p>
      <div style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        This is an automated notification. Please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>`;
};

const bookingCancellationUserEmailTemplate = (cancellationData) => {
  const {
    orderNumber,
    customerName,
    services,
    bookingDate,
    bookingSlot,
    cancelledAt,
    refundEligible,
    refundAmount,
    totalAmount
  } = cancellationData;

  const servicesListHTML = services.map(service => `
    <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
      <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${service.name}</div>
      <div style="font-size: 14px; color: #6b7280;">
        Quantity: ${service.quantity} × ₹${service.price.toFixed(2)} = ₹${(service.price * service.quantity).toFixed(2)}
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Cancellation Confirmation - Wemakeover</title>
  ${baseStyles}
  <style>
    .header-icon {
      font-size: 60px;
      margin-bottom: 10px;
      color: #ef4444;
    }
    .order-number-box {
      text-align: center;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border: 2px solid #fca5a5;
    }
    .order-number-box p {
      margin: 0 0 10px 0;
      color: #991b1b;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .order-number-box h2 {
      margin: 0;
      color: #dc2626;
      font-size: 28px;
      font-weight: 700;
    }
    .cancelled-details {
      background: #f9fafb;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
    }
    .cancelled-details h3 {
      margin: 0 0 15px 0;
      color: #111827;
      font-size: 16px;
      font-weight: 600;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 140px;
      font-size: 14px;
    }
    .detail-value {
      color: #111827;
      font-size: 14px;
    }
    .refund-info-box {
      background: ${refundEligible ? '#d1fae5' : '#fef3c7'};
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      text-align: center;
      border: 2px solid ${refundEligible ? '#6ee7b7' : '#fbbf24'};
    }
    .refund-info-box h3 {
      margin: 0 0 15px 0;
      color: ${refundEligible ? '#065f46' : '#92400e'};
      font-size: 20px;
    }
    .refund-info-box p {
      margin: 8px 0;
      color: ${refundEligible ? '#047857' : '#78350f'};
      font-size: 15px;
      line-height: 1.6;
    }
    .refund-amount {
      font-size: 32px;
      font-weight: 700;
      color: ${refundEligible ? '#065f46' : '#92400e'};
      margin: 15px 0;
    }
    .help-box {
      background: #eff6ff;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
      text-align: center;
    }
    .help-box h3 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 16px;
    }
    .help-box p {
      margin: 5px 0;
      color: #1e3a8a;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .detail-row {
        flex-direction: column;
      }
      .detail-label {
        min-width: auto;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">✓</div>
      <h1>Booking Cancelled</h1>
      <p>Your cancellation has been confirmed</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">
        Hi <strong>${customerName}</strong>, <br/>
        We've successfully cancelled your booking as requested.
      </p>

      <div class="order-number-box">
        <p>Cancelled Booking</p>
        <h2>${orderNumber}</h2>
      </div>

      <div class="cancelled-details">
        <h3>📋 Cancelled Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Date:</span>
          <span class="detail-value">${bookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time Slot:</span>
          <span class="detail-value">${bookingSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cancelled On:</span>
          <span class="detail-value">${cancelledAt}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value" style="font-weight: 700;">₹${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 15px;">
          Cancelled Services:
        </h3>
        ${servicesListHTML}
      </div>

      <div class="refund-info-box">
        ${refundEligible ? `
          <h3>💰 Refund Information</h3>
          <p>You are eligible for a full refund.</p>
          <div class="refund-amount">₹${refundAmount.toFixed(2)}</div>
          <p>
            The refund will be processed within 5-7 business days to your original payment method.
          </p>
          <p style="font-size: 13px; margin-top: 15px;">
            You will receive a separate email confirmation once the refund is processed.
          </p>
        ` : `
          <h3>ℹ️ Payment Information</h3>
          <p>
            Since payment was not completed, no refund is necessary.
          </p>
          <p style="font-size: 13px; margin-top: 10px;">
            You were not charged for this booking.
          </p>
        `}
      </div>

      <div class="help-box">
        <h3>Need Help?</h3>
        <p>If you have any questions or concerns, feel free to contact us:</p>
        <p>
          📧 Email: <a href="mailto:${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}" style="color: #CC2B52; text-decoration: none;">${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}</a><br/>
          📱 Phone: <a href="tel:${process.env.ADMIN_PHONE_NUMBER || '+91-XXXXXXXXXX'}" style="color: #CC2B52; text-decoration: none;">${process.env.ADMIN_PHONE_NUMBER || '+91-XXXXXXXXXX'}</a>
        </p>
      </div>

      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
        We hope to serve you again soon! 💝
      </p>
    </div>

    <div class="footer">
      <p style="font-weight: 600; color: #374151;">
        Thank you for choosing Wemakeover!
      </p>
      <p>
        We're sorry to see this booking cancelled, but we look forward to serving you in the future.
      </p>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
        © ${new Date().getFullYear()} Wemakeover - Beauty Services Platform<br/>
        Delivering beauty to your doorstep
      </div>
    </div>
  </div>
</body>
</html>`;
};

const bookingRescheduleAdminEmailTemplate = (rescheduleData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    services,
    originalDate,
    originalSlot,
    newDate,
    newSlot,
    rescheduledAt,
    rescheduleReason,
    rescheduleCount,
    paymentMethod,
    totalAmount
  } = rescheduleData;

  const servicesListHTML = services.map(service => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; word-wrap: break-word; overflow-wrap: break-word;">
        <strong>${service.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${service.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
        ₹${(service.price * service.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Rescheduled - Wemakeover</title>
  ${baseStyles}
  <style>
    .alert-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin-bottom: 25px;
      border: 2px solid #fcd34d;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f59e0b;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      color: #111827;
      font-weight: 500;
    }
    .change-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .change-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .change-item {
      padding: 15px;
      text-align: center;
      border-radius: 8px;
    }
    .change-item.old {
      background: #fee2e2;
    }
    .change-item.new {
      background: #d1fae5;
    }
    .change-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .change-item.old .change-label {
      color: #991b1b;
    }
    .change-item.new .change-label {
      color: #065f46;
    }
    .change-value {
      font-size: 16px;
      font-weight: 700;
    }
    .change-item.old .change-value {
      color: #dc2626;
      text-decoration: line-through;
    }
    .change-item.new .change-value {
      color: #059669;
    }
    .reason-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .services-table thead {
      background: #f3f4f6;
    }
    .services-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #374151;
      font-weight: 600;
      text-transform: uppercase;
    }
    .reschedule-count-box {
      background: #eff6ff;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: center;
      border: 2px solid #3b82f6;
    }
    .reschedule-count-box p {
      margin: 5px 0;
      color: #1e40af;
      font-size: 14px;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .change-comparison {
        grid-template-columns: 1fr;
      }
      .services-table {
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔄 Booking Rescheduled</h1>
      <p>A customer has rescheduled their booking</p>
    </div>

    <div class="content">
      <div class="alert-badge">
        Order #${orderNumber} - RESCHEDULED
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${customerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${customerEmail}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Payment Method</div>
            <div class="info-value">${paymentMethod === 'cod' ? 'Pay After Service' : 'Online Payment'}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Schedule Changes</div>
        <div class="change-box">
          <div class="change-comparison">
            <div class="change-item old">
              <div class="change-label">❌ Original Schedule</div>
              <div class="change-value">${new Date(originalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div class="change-value">${originalSlot}</div>
            </div>
            <div class="change-item new">
              <div class="change-label">✅ New Schedule</div>
              <div class="change-value">${new Date(newDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div class="change-value">${newSlot}</div>
            </div>
          </div>
        </div>

        ${rescheduleReason ? `
        <div class="reason-box">
          <strong>Reschedule Reason:</strong>
          <p style="margin: 0; color: #78350f;">${rescheduleReason}</p>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Services Booked</div>
        <table class="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${servicesListHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb; font-weight: bold;">
              <td colspan="2" style="padding: 15px; text-align: right;">Total Amount:</td>
              <td style="padding: 15px; text-align: right; color: #059669; font-size: 18px;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="reschedule-count-box">
        <p>📊 Reschedule Count: ${rescheduleCount} of 3 allowed</p>
        <p style="font-size: 12px; color: #3b82f6; font-weight: normal;">Rescheduled on: ${new Date(rescheduledAt).toLocaleString('en-IN')}</p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">WeMakeover - Beauty Services</p>
      <p style="margin: 0;">Contact: ${process.env.ADMIN_EMAIL || 'hello@wemakeover.co.in'} | ${process.env.ADMIN_PHONE_NUMBER || '+91 98765 43210'}</p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">
        This is an automated notification. Please review the rescheduled booking in your admin dashboard.
      </p>
    </div>
  </div>
</body>
</html>`;
};

const bookingRescheduleUserEmailTemplate = (rescheduleData) => {
  const {
    orderNumber,
    customerName,
    services,
    originalDate,
    originalSlot,
    newDate,
    newSlot,
    rescheduledAt,
    rescheduleReason,
    rescheduleCount,
    paymentMethod,
    totalAmount,
    address
  } = rescheduleData;

  const servicesListHTML = services.map(service => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; word-wrap: break-word; overflow-wrap: break-word;">
        <strong>${service.name}</strong>
        <br />
        <span style="font-size: 12px; color: #6b7280;">${service.description || ''}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${service.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
        ₹${(service.price * service.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Rescheduled Successfully - Wemakeover</title>
  ${baseStyles}
  <style>
    .success-badge {
      background: #d1fae5;
      color: #065f46;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin-bottom: 25px;
      border: 2px solid #6ee7b7;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #10b981;
    }
    .highlight-box {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      border-left: 4px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .change-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .change-item {
      padding: 15px;
      text-align: center;
      border-radius: 8px;
    }
    .change-item.old {
      background: #fee2e2;
    }
    .change-item.new {
      background: #d1fae5;
    }
    .change-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .change-item.old .change-label {
      color: #991b1b;
    }
    .change-item.new .change-label {
      color: #065f46;
    }
    .change-value {
      font-size: 16px;
      font-weight: 700;
    }
    .change-item.old .change-value {
      color: #dc2626;
      text-decoration: line-through;
    }
    .change-item.new .change-value {
      color: #059669;
    }
    .info-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 600;
    }
    .info-value {
      font-size: 14px;
      color: #111827;
      font-weight: 500;
      text-align: right;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 60%;
    }
    .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .services-table thead {
      background: #f3f4f6;
    }
    .services-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #374151;
      font-weight: 600;
      text-transform: uppercase;
    }
    .important-note {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin-top: 20px;
    }
    @media only screen and (max-width: 600px) {
      .change-comparison {
        grid-template-columns: 1fr;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        max-width: 100%;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Booking Rescheduled!</h1>
      <p>Your booking has been successfully rescheduled</p>
    </div>

    <div class="content">
      <div class="success-badge">
        ✓ Order #${orderNumber} - Updated
      </div>

      <div class="greeting">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your booking has been successfully rescheduled. Here are your updated booking details:</p>
      </div>

      <div class="section">
        <div class="section-title">📅 Updated Schedule</div>
        <div class="highlight-box">
          <div class="change-comparison">
            <div class="change-item old">
              <div class="change-label">❌ Previous</div>
              <div class="change-value">${new Date(originalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div class="change-value">${originalSlot}</div>
            </div>
            <div class="change-item new">
              <div class="change-label">✅ New</div>
              <div class="change-value">${new Date(newDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div class="change-value">${newSlot}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📋 Booking Information</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Order Number:</span>
            <span class="info-value">${orderNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${paymentMethod === 'cod' ? 'Pay After Service' : 'Online Payment'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Service Location:</span>
            <span class="info-value">${address ? `${address.city}, ${address.state}` : 'Home Service'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Reschedule Count:</span>
            <span class="info-value">${rescheduleCount} of 3 allowed</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💅 Your Services</div>
        <table class="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${servicesListHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb; font-weight: bold;">
              <td colspan="2" style="padding: 15px; text-align: right;">Total Amount:</td>
              <td style="padding: 15px; text-align: right; color: #059669; font-size: 18px;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="important-note">
        <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">📌 Important:</p>
        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
          <li>You can reschedule up to 3 times (${3 - rescheduleCount} remaining)</li>
          <li>Rescheduling must be done at least 4 hours before the service</li>
          <li>Our beautician will arrive at your location at the scheduled time</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'https://wemakeover.co.in'}/my-bookings/${orderNumber}" class="button">
          View Booking Details
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">WeMakeover - Beauty Services at Your Doorstep</p>
      <p style="margin: 0;">Need help? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL || 'hello@wemakeover.co.in'}" style="color: #CC2B52; text-decoration: none;">${process.env.ADMIN_EMAIL || 'hello@wemakeover.co.in'}</a></p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">
        You're receiving this email because you rescheduled a booking with WeMakeover.
      </p>
    </div>
  </div>
</body>
</html>`;
};

const paymentConfirmationAdminEmailTemplate = (paymentData) => {
  const {
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    services,
    totalAmount,
    paymentMethod,
    transactionId,
    paidAt,
    bookingDate,
    bookingSlot,
    address
  } = paymentData;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedPaidAt = new Date(paidAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Payment Received - ${orderNumber}</title>
  ${baseStyles}
  <style>
    .payment-badge {
      background-color: #d1fae5;
      color: #065f46;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin-bottom: 25px;
      border: 2px solid #6ee7b7;
    }
    .info-section {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-section h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      min-width: 140px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
    .service-item {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .service-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .service-details {
      font-size: 13px;
      color: #6b7280;
    }
    .total-amount {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .total-amount-label {
      font-size: 14px;
      margin-bottom: 5px;
      opacity: 0.9;
    }
    .total-amount-value {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .info-row {
        flex-direction: column;
      }
      .info-label {
        min-width: auto;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>💰 Payment Received</h1>
      <p>Order #${orderNumber}</p>
    </div>

    <div class="content">
      <div class="payment-badge">✓ Payment Completed</div>

      <div class="info-section">
        <h3>Payment Details</h3>
        <div class="info-row">
          <div class="info-label">Amount Received:</div>
          <div class="info-value">${formatCurrency(totalAmount)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Payment Method:</div>
          <div class="info-value">${paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</div>
        </div>
        ${transactionId ? `
        <div class="info-row">
          <div class="info-label">Transaction ID:</div>
          <div class="info-value">${transactionId}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">Paid At:</div>
          <div class="info-value">${formattedPaidAt}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>Customer Details</h3>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${customerName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value">${customerEmail}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value">${customerPhone}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>Booking Details</h3>
        <div class="info-row">
          <div class="info-label">Service Date:</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Time Slot:</div>
          <div class="info-value">${bookingSlot}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address:</div>
          <div class="info-value">${address.completeAddress || address.streetAreaName}, ${address.city}, ${address.state} - ${address.pincode}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>Services</h3>
        ${services.map(service => `
          <div class="service-item">
            <div class="service-name">${service.name}</div>
            <div class="service-details">Quantity: ${service.quantity} | Price: ${formatCurrency(service.price * service.quantity)}</div>
          </div>
        `).join('')}
      </div>

      <div class="total-amount">
        <div class="total-amount-label">Total Amount Received</div>
        <div class="total-amount-value">${formatCurrency(totalAmount)}</div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">WeMakeover - Admin Notification</p>
      <p style="margin: 0;">This is an automated notification for payment received.</p>
    </div>
  </div>
</body>
</html>`;
};

const paymentConfirmationUserEmailTemplate = (paymentData) => {
  const {
    orderNumber,
    customerName,
    services,
    totalAmount,
    paymentMethod,
    transactionId,
    paidAt,
    bookingDate,
    bookingSlot,
    address
  } = paymentData;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedPaidAt = new Date(paidAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Payment Confirmation - ${orderNumber}</title>
  ${baseStyles}
  <style>
    .success-badge {
      background-color: #d1fae5;
      color: #065f46;
      padding: 12px 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .info-section {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-section h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      min-width: 140px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
    .service-item {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .service-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .service-details {
      font-size: 13px;
      color: #6b7280;
    }
    .receipt-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .receipt-title {
      font-size: 14px;
      margin-bottom: 10px;
      opacity: 0.9;
      text-align: center;
    }
    .receipt-amount {
      font-size: 36px;
      font-weight: 700;
      margin: 10px 0;
      text-align: center;
    }
    .receipt-status {
      text-align: center;
      font-size: 14px;
      opacity: 0.95;
    }
    .next-steps {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .next-steps h4 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 16px;
    }
    .next-steps ul {
      margin: 0;
      padding-left: 20px;
      color: #1f2937;
    }
    .next-steps li {
      margin-bottom: 5px;
    }
    @media only screen and (max-width: 600px) {
      .receipt-amount {
        font-size: 28px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-label {
        min-width: auto;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Payment Received!</h1>
      <p>Thank you for your payment</p>
    </div>

    <div class="content">
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">
        Dear <strong>${customerName}</strong>,
      </p>

      <div class="success-badge">
        ✓ Your payment has been successfully processed
      </div>

      <div class="receipt-box">
        <div class="receipt-title">Payment Receipt</div>
        <div class="receipt-amount">${formatCurrency(totalAmount)}</div>
        <div class="receipt-status">Order #${orderNumber} | ${formattedPaidAt}</div>
      </div>

      <div class="info-section">
        <h3>📋 Payment Details</h3>
        <div class="info-row">
          <div class="info-label">Amount Paid:</div>
          <div class="info-value">${formatCurrency(totalAmount)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Payment Method:</div>
          <div class="info-value">${paymentMethod === 'online' ? 'Online Payment (UPI/Card)' : 'Cash on Delivery'}</div>
        </div>
        ${transactionId ? `
        <div class="info-row">
          <div class="info-label">Transaction ID:</div>
          <div class="info-value">${transactionId}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">Payment Date:</div>
          <div class="info-value">${formattedPaidAt}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Status:</div>
          <div class="info-value" style="color: #10b981;">Completed ✓</div>
        </div>
      </div>

      <div class="info-section">
        <h3>📅 Booking Details</h3>
        <div class="info-row">
          <div class="info-label">Service Date:</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Time Slot:</div>
          <div class="info-value">${bookingSlot}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>💅 Services Booked</h3>
        ${services.map(service => `
          <div class="service-item">
            <div class="service-name">${service.name}</div>
            <div class="service-details">Quantity: ${service.quantity} | Price: ${formatCurrency(service.price * service.quantity)}</div>
          </div>
        `).join('')}
      </div>

      <div class="info-section">
        <h3>📍 Service Address</h3>
        <p style="margin: 0; color: #1f2937; font-size: 14px;">
          ${address.completeAddress || address.streetAreaName}<br>
          ${address.city}, ${address.state} - ${address.pincode}<br>
          Phone: ${address.phone}
        </p>
      </div>

      <div class="next-steps">
        <h4>✨ What's Next?</h4>
        <ul>
          <li>Your booking is confirmed</li>
          <li>Our beautician will arrive at your location on time</li>
          <li>Please keep your phone accessible for any updates</li>
          <li>Have your booking ID ready: <strong>${orderNumber}</strong></li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://wemakeover.co.in'}/my-bookings/${orderNumber}" class="button">
          View Booking Details
        </a>
      </div>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
        Need help? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}" style="color: #10b981; text-decoration: none;">${process.env.ADMIN_EMAIL || 'support@wemakeover.com'}</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; font-weight: 600;">WeMakeover - Beauty Services at Your Doorstep</p>
      <p style="margin: 0;">Thank you for choosing WeMakeover!</p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">
        You're receiving this email because you made a payment for a booking with WeMakeover.
      </p>
    </div>
  </div>
</body>
</html>`;
};

export { 
  emailTemplate, 
  passwordResetEmailTemplate, 
  contactUsEmailTemplate, 
  bookingNotificationEmailTemplate,
  welcomeNewsletterEmailTemplate,
  enquiryNotificationEmailTemplate,
  enquiryConfirmationEmailTemplate,
  bookingCancellationAdminEmailTemplate,
  bookingCancellationUserEmailTemplate,
  bookingRescheduleAdminEmailTemplate,
  bookingRescheduleUserEmailTemplate,
  paymentConfirmationAdminEmailTemplate,
  paymentConfirmationUserEmailTemplate
};