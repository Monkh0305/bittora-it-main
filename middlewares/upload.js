const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'))
  },
  filename: function (_req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

module.exports = upload
