const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: '.env.local' });

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'contact@stratanoble.com';
const TO_EMAIL = process.env.ADMIN_EMAIL || FROM_EMAIL;

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in your environment.');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

sgMail
  .send({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: 'Test Email from SendGrid (Node.js Script)',
    text: 'This is a test email sent from your SendGrid setup script.',
    html: '<strong>This is a test email sent from your SendGrid setup script.</strong>',
  })
  .then(() => {
    console.log('✅ Test email sent successfully to', TO_EMAIL);
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:', error.response?.body || error.message);
    process.exit(1);
  }); 