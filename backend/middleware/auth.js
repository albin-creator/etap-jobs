const jwt = require('jsonwebtoken');  
require('dotenv').config();

// verify token  
exports.protect = (req, res, next) => {  
  const header = req.headers.authorization;  
  if (!header || !header.startsWith('Bearer '))  
    return res.status(401).json({ message: 'No token' });  
  try {  
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);  
    next();  
  } catch {  
    res.status(401).json({ message: 'Invalid token' });  
  }  
};

// restrict to certain roles  
exports.restrictTo = (...roles) => (req, res, next) => {  
  if (!roles.includes(req.user.role))  
    return res.status(403).json({ message: 'Forbidden for your role' });  
  next();  
};  