const bcrypt = require('bcryptjs');  
const jwt = require('jsonwebtoken');  
const { User } = require('../models');  
require('dotenv').config();

const sign = (u) =>  
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, {  
    expiresIn: '7d',  
  });

exports.signup = async (req, res) => {  
  try {  
    const { name, email, password, role } = req.body;  
    if (!name || !email || !password)  
      return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ where: { email } });  
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);  
    const user = await User.create({  
      name, email, password: hash,  
      role: ['admin', 'designer', 'printer', 'delivery'].includes(role) ? role : 'admin',  
    });

    res.status(201).json({  
      token: sign(user),  
      user: { id: user.id, name: user.name, role: user.role },  
    });  
  } catch (e) {  
    res.status(500).json({ message: e.message });  
  }  
};

exports.login = async (req, res) => {  
  try {  
    const { email, password } = req.body;  
    const user = await User.findOne({ where: { email } });  
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);  
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({  
      token: sign(user),  
      user: { id: user.id, name: user.name, role: user.role },  
    });  
  } catch (e) {  
    res.status(500).json({ message: e.message });  
  }  
};  