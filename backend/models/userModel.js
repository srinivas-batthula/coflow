const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String},
  is_from_google: { type: Boolean, default: false }
}, {timestamps: true})

  // Auto-hashes password before saving it to DB
userSchema.pre('save', async function (next) {
  if (!(this.isModified('password'))) {
      return next()
  }
  try {
      const saltRounds = 13
      this.password = await bcrypt.hash(this.password, saltRounds)
      this.passwordModifiedAt = new Date()
      next()
  }
  catch (error) {
      next(error)
  }
})

  // Compares given password with the hashed-password in DB securely
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("hackpilot_users", userSchema);



module.exports = User;