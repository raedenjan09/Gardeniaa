// Test script to verify email functionality
const sendEmail = require('./utils/Mailer');
require('dotenv').config({ path: './config/.env' });

async function testEmail() {
    console.log('🧪 Testing email functionality...');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    console.log('SMTP Email:', process.env.SMTP_EMAIL);
    
    try {
        await sendEmail({
            email: 'test@example.com',
            subject: 'Test Email from Gardenia Order System',
            message: `
                <h1>Test Email</h1>
                <p>This is a test email to verify the email notification system is working correctly.</p>
                <p>If you receive this, the email functionality is properly configured!</p>
            `
        });
        console.log('✅ Email test completed successfully!');
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

testEmail();