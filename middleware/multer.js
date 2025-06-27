const multer = require('multer')
const fs = require('fs')
const path = require('path')

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`)
  }
})

const upload = multer({ storage: storage })

module.exports = upload