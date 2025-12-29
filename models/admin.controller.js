import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    default: "admin", 
    immutable: true // Takay koi role change na kar sake
  }
}, { timestamps: true });

// Access Token generate karne ka logic yahan bhi wese hi aayega
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role }, 
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;