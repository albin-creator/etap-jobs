const express = require('express');  
const cors = require('cors');  
const path = require('path');  
require('dotenv').config();  
const { sequelize } = require('./models');

const app = express();  
app.use(cors());  
app.use(express.json());

// serve frontend  
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', require('./routes/authRoutes'));  
app.use('/api/jobs', require('./routes/jobRoutes'));

const PORT = process.env.PORT || 5000;  
sequelize.sync({ alter: true }).then(() => {  
  app.listen(PORT, () => console.log(`✅ Server running on :${PORT}`));  
});  