// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/serviceFinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  dob: String,
  age: Number,
  gender: String,
  district: String,
  phone: String,
  email: String,
  address: String,
  pincode: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// ✅ API test route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// ✅ Register route
app.post('/register', async (req, res) => {
  try {
    const existing = await User.findOne({ phone: req.body.phone });
    if (existing) {
      return res.status(409).json({ error: "Phone number already registered" });
    }

    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// ✅ Delete Account route
app.post('/delete-account', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    await User.deleteOne({ phone });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account", details: err.message });
  }
});

// ✅ GET current user details
app.get("/get-user/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

// ✅ UPDATE user details
app.put("/update-user", async (req, res) => {
  try {
    const { phone, name, age, district, pincode, dob, gender, email, address } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { $set: { name, age, district, pincode, dob, gender, email, address } },
      { new: true } // return updated document
    );

    if (updatedUser) {
      res.json({ message: "✅ User updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
});

// ✅ Start server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
