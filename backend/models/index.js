const sequelize = require('../config/db');  
const User = require('./User');  
const Job = require('./Job');

User.hasMany(Job, { foreignKey: 'created_by' });  
Job.belongsTo(User, { foreignKey: 'created_by' });

module.exports = { sequelize, User, Job };  