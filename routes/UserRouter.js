const router = require('express').Router()
const controller = require('../controllers/UserController')
const middleware = require('../middleware')

// Get all users (with optional filters)
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetAllUsers
)

// Test email connection (admin only) - MUST be before /:id routes
router.get(
  '/email/test-connection',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  async (req, res) => {
    const emailService = require('../services/emailService')
    try {
      const result = await emailService.testConnection()
      res.json(result)
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

// Send test email (admin only)
router.post(
  '/email/send-test',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  async (req, res) => {
    const emailService = require('../services/emailService')
    try {
      const { to, subject, message } = req.body

      if (!to || !subject || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to, subject, message'
        })
      }

      const result = await emailService.sendEmail(to, subject, message)
      res.json(result)
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

// Debug email settings (admin only)
router.post(
  '/email/debug-settings',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  async (req, res) => {
    const nodemailer = require('nodemailer')

    try {
      console.log('=== EMAIL DEBUG INFO ===')
      console.log('HOST:', process.env.EMAIL_HOST)
      console.log('PORT:', process.env.EMAIL_PORT)
      console.log('SECURE:', process.env.EMAIL_SECURE)
      console.log('USER:', process.env.EMAIL_USER)
      console.log('PASS LENGTH:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0)
      console.log('PASS FIRST 3 CHARS:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 3) + '...' : 'NOT SET')

      // Test different port configurations
      const configs = [
        { port: 587, secure: false, name: 'Port 587 - TLS' },
        { port: 465, secure: true, name: 'Port 465 - SSL' },
        { port: 25, secure: false, name: 'Port 25 - Plain' }
      ]

      const results = []

      for (const config of configs) {
        try {
          console.log(`\n=== Testing ${config.name} ===`)

          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: config.port,
            secure: config.secure,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
            tls: {
              rejectUnauthorized: false,
              checkServerIdentity: () => undefined
            },
            connectionTimeout: 10000,
            debug: true,
            logger: true
          })

          await transporter.verify()
          results.push({ ...config, success: true, error: null })
          console.log(`✅ ${config.name} - SUCCESS`)

        } catch (error) {
          results.push({ ...config, success: false, error: error.message })
          console.log(`❌ ${config.name} - FAILED:`, error.message)
        }
      }

      res.json({
        success: true,
        message: 'Debug test completed',
        results,
        settings: {
          host: process.env.EMAIL_HOST,
          user: process.env.EMAIL_USER,
          passwordSet: !!process.env.EMAIL_PASS
        }
      })

    } catch (error) {
      console.error('Debug Error:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

// Test email with custom settings (admin only)
router.post(
  '/email/test-custom',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  async (req, res) => {
    const nodemailer = require('nodemailer')

    try {
      const { host, port, secure, user, pass, testEmail } = req.body

      if (!host || !port || !user || !pass) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: host, port, user, pass'
        })
      }

      console.log('=== TESTING CUSTOM SETTINGS ===')
      console.log('Host:', host)
      console.log('Port:', port)
      console.log('Secure:', secure)
      console.log('User:', user)
      console.log('Pass length:', pass.length)

      const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: secure === 'true' || secure === true,
        auth: {
          user: user,
          pass: pass
        },
        tls: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        debug: true,
        logger: true
      })

      // Test connection
      await transporter.verify()

      let emailResult = null
      if (testEmail) {
        // Send test email if requested
        const mailOptions = {
          from: `Test <${user}>`,
          to: testEmail,
          subject: 'Custom SMTP Test Email',
          text: 'This is a test email using custom SMTP settings.',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Custom SMTP Test Email</h2>
              <p>This email was sent successfully using custom SMTP settings:</p>
              <ul>
                <li><strong>Host:</strong> ${host}</li>
                <li><strong>Port:</strong> ${port}</li>
                <li><strong>Secure:</strong> ${secure}</li>
                <li><strong>User:</strong> ${user}</li>
              </ul>
              <p>Test completed at: ${new Date().toLocaleString()}</p>
            </div>
          `
        }

        const result = await transporter.sendMail(mailOptions)
        emailResult = { success: true, messageId: result.messageId }
      }

      res.json({
        success: true,
        message: 'Custom SMTP settings test successful',
        connection: { success: true },
        email: emailResult,
        settings: { host, port, secure, user }
      })

    } catch (error) {
      console.error('Custom SMTP Test Error:', error)
      res.status(500).json({
        success: false,
        error: error.message,
        code: error.code
      })
    }
  }
)

// Get user by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetUserById
)

// Get user's reset token
router.get(
  '/:id/reset-token',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetUserResetToken
)

// Create new user (admin/supervisor only)
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateUser
)

// Update user
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateUser
)

// Delete user (soft delete)
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteUser
)

// Change user role
router.patch(
  '/:id/role',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.ChangeUserRole
)

// Change user status
router.patch(
  '/:id/status',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.ChangeUserStatus
)

// Public routes for password reset (no authentication required)
router.post('/forgot-password', controller.RequestPasswordReset)
router.get('/reset-password/verify', controller.VerifyPasswordResetToken)
router.post('/reset-password', controller.ResetPassword)

module.exports = router