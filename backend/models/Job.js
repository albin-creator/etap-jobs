const { DataTypes } = require('sequelize');  
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {  
  customer:    DataTypes.STRING,  
  description: {
  type: DataTypes.TEXT,
  allowNull: true
  },
  contact: {
  type: DataTypes.STRING,
  allowNull: true,
  },
  orderNo: { 
  type: DataTypes.STRING, 
  unique: true,
  field: 'order_no' 
  },
  jobDate:     { type: DataTypes.DATEONLY, field: 'job_date' },  
  dueDate:     { type: DataTypes.DATEONLY, field: 'due_date' },  
  items:       { type: DataTypes.JSONB, defaultValue: [] },  
  subtotal:    { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },  
  total:       { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },  
  advance:     { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },  
  amountWords: { type: DataTypes.TEXT, field: 'amount_words' },  
  status: {  
    type: DataTypes.ENUM('pending', 'design', 'printer', 'ready', 'completed'),  
    defaultValue: 'pending',  
  },  
  zone:      DataTypes.STRING,  
  building:  DataTypes.STRING,  
  street:    DataTypes.STRING,  
  deliveryStatus: {
  type: DataTypes.ENUM(
    'collect_from_office',
    'collect_card',
    'cash',
    'no_delivery'
  ),
  field: 'delivery_status',
  allowNull: true
  },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },  
}, { tableName: 'jobs', underscored: true, timestamps: true, updatedAt: false });

module.exports = Job;  