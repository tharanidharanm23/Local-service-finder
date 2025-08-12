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

// ✅ Update Profile Route (Clean version)
app.put("/update-profile", async (req, res) => {
    try {
        console.log("📩 Incoming Update Request:", req.body);

        const { phone, name, email, dob, age, gender, district, address, pincode, password, newPassword } = req.body;

        // Find user
        const user = await User.findOne({ phone });
        if (!user) {
            console.log("❌ No user found with phone:", phone);
            return res.status(404).json({ error: "User not found" });
        }

        // If password is given, verify
        if (password && password.trim() !== "") {
            if (user.password !== password) {
                console.log("❌ Incorrect password");
                return res.status(400).json({ error: "Incorrect password" });
            }
        }

        // Update only provided fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (dob) user.dob = dob;
        if (age) user.age = age;
        if (gender) user.gender = gender;
        if (district) user.district = district;
        if (address) user.address = address;
        if (pincode) user.pincode = pincode;

        if (newPassword && newPassword.trim() !== "") {
            user.password = newPassword;
        }

        const updatedUser = await user.save();
        console.log("✅ Updated User:", updatedUser);

        res.json({ message: "Profile updated successfully", user: updatedUser });

    } catch (err) {
        console.error("🔥 Error updating profile:", err);
        res.status(500).json({ error: err.message });
    }
});


// ✅ Get user details by phone
app.get("/user/:phone", async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.params.phone });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ Start server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
