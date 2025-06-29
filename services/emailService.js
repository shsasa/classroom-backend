const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Debug: Log the environment variables for email configuration
    console.log('Email Configuration Debug:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `[Length: ${process.env.EMAIL_PASS.length}]` : 'NOT SET');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add TLS options to handle certificate issues
      tls: {
        // Don't fail on invalid certificates (for shared hosting)
        rejectUnauthorized: false,
        // Ignore server name verification
        checkServerIdentity: () => undefined,
        // Force minimum TLS version
        minVersion: 'TLSv1.2'
      },
      // Additional options for authentication
      debug: true, // Enable debug mode
      logger: true, // Enable logging
      // Connection timeout
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000 // 60 seconds
    });
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html: html || text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAccountActivationEmail(user) {
    const subject = 'Welcome to Classroom Manager - Account Created';
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">Welcome to Classroom Manager</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #e74c3c; margin-top: 0;">Account Created Successfully</h3>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your account has been created successfully. Here are your account details:</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        <p><strong>Status:</strong> ${user.accountStatus || 'Active'}</p>
                    </div>
                    
                    ${!user.password ? `
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h4 style="color: #856404; margin-top: 0;">Password Setup Required</h4>
                            <p style="color: #856404;">You need to set up your password to access your account. Please contact your administrator or use the password reset feature.</p>
                        </div>
                    ` : ''}
                    
                    <p>You can now access the classroom management system and start using all available features based on your role.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px;">
                        This is an automated message from Classroom Manager.<br>
                        If you have any questions, please contact your administrator.
                    </p>
                </div>
            </div>
        `;

    return await this.sendEmail(user.email, subject, null, html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Classroom Manager - Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>You requested a password reset for your Classroom Manager account.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p style="color: #856404; margin: 0;"><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                    </div>
                    
                    <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px;">
                        This is an automated message from Classroom Manager.<br>
                        If you have any questions, please contact your administrator.
                    </p>
                </div>
            </div>
        `;

    return await this.sendEmail(user.email, subject, null, html);
  }

  async sendAssignmentNotification(user, assignment) {
    const subject = `New Assignment: ${assignment.title}`;
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">New Assignment Posted</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>A new assignment has been posted for your course:</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #e74c3c; margin-top: 0;">${assignment.title}</h3>
                        <p><strong>Course:</strong> ${assignment.course?.name || 'N/A'}</p>
                        <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p><strong>Total Marks:</strong> ${assignment.totalMarks}</p>
                        ${assignment.description ? `<p><strong>Description:</strong> ${assignment.description}</p>` : ''}
                    </div>
                    
                    <p>Please log in to the classroom management system to view the full assignment details and submit your work.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px;">
                        This is an automated message from Classroom Manager.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;

    return await this.sendEmail(user.email, subject, null, html);
  }

  async sendAnnouncementEmail(user, announcement) {
    const subject = `Announcement: ${announcement.title}`;
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">New Announcement</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>A new announcement has been posted:</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #e74c3c; margin-top: 0;">${announcement.title}</h3>
                        ${announcement.content ? `<div style="margin: 15px 0;">${announcement.content}</div>` : ''}
                    </div>
                    
                    <p>Please log in to the classroom management system to view the full announcement.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px;">
                        This is an automated message from Classroom Manager.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;

    return await this.sendEmail(user.email, subject, null, html);
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return { success: true, message: 'SMTP connection verified' };
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
