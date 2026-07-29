const { Job } = require('../models');
const { Op } = require('sequelize');


// status a role is allowed to see
const roleFilter = {
  admin: null,
  designer: ['design'],
  printer: ['printer'],
  delivery: ['ready','payment_pending'],
};



exports.getJobs = async (req, res) => {

  try {

    const allowed = roleFilter[req.user.role];

    let where = {};

    if (req.user.role === 'delivery') {

      where = {
        status: 'ready',
        deliveryStatus: {
          [Op.ne]: 'delivered'
        }
      };

    } else if (allowed) {

      where = {
        status: allowed
      };

    }


    const jobs = await Job.findAll({
      where,
      order: [['id','DESC']]
    });


    res.json(jobs);


  } catch(e) {

    res.status(500).json({
      message:e.message
    });

  }

};





exports.createJob = async (req,res)=>{


try {


const b=req.body;

const items = (b.items || [])
.filter(i => i.name?.trim());


if(!items.length){

return res.status(400).json({
message:'Add at least one item'
});

}




const subtotal = items.reduce(
(s,i)=>s+(i.qty||0)*(i.price||0),
0
);


// 🔹 AUTO ORDER NUMBER
const year = new Date().getFullYear();

const lastJob = await Job.findOne({
  where: {
    orderNo: {
      [Op.like]: `ORD-${year}-%`
    }
  },
  order: [['createdAt', 'DESC']]
});

let nextNumber = 1;

if (lastJob && lastJob.orderNo) {
  const lastNumber = parseInt(lastJob.orderNo.split('-')[2]);
  nextNumber = lastNumber + 1;
}

const padded = String(nextNumber).padStart(3, '0');

const orderNo = `ORD-${year}-${padded}`;


const job = await Job.create({

customer:b.customer || 'anonymous',

contact:b.contact || null,

orderNo:b.orderNo,

jobDate:b.date || new Date(),

dueDate:b.dueDate,

orderNo,

items,

subtotal,

total:subtotal,

advance:b.advance || 0,

amountWords:b.amountWords,

status:'pending',

createdBy:req.user.id,

});





// 🔥 REAL TIME EVENT
const io = req.app.get('io');

io.emit('jobCreated', job);



res.status(201).json(job);



}catch(e){

res.status(500).json({
message:e.message
});

}


};







exports.updateStatus = async(req,res)=>{


try{


const job = await Job.findByPk(req.params.id);


if(!job){

return res.status(404).json({
message:'Not found'
});

}



job.status=req.body.status;


await job.save();



// 🔥 REAL TIME EVENT
const io=req.app.get('io');

io.emit('jobUpdated', job);



res.json(job);



}catch(e){

res.status(500).json({
message:e.message
});

}


};







exports.updateDelivery = async(req,res)=>{


try{


const job=await Job.findByPk(req.params.id);


if(!job){

return res.status(404).json({
message:'Not found'
});

}



const {
zone,
building,
street
}=req.body;



Object.assign(job,{
zone,
building,
street
});



await job.save();



// 🔥 REAL TIME EVENT
const io=req.app.get('io');

io.emit('jobUpdated',job);



res.json(job);



}catch(e){

res.status(500).json({
message:e.message
});

}


};



exports.updateDeliveryStatus = async(req,res)=>{

try{

const job = await Job.findByPk(req.params.id);


if(!job){
return res.status(404).json({
message:'Job not found'
});
}


job.deliveryStatus = req.body.deliveryStatus;


await job.save();



const io=req.app.get('io');

io.emit('jobUpdated',job);



res.json(job);



}catch(e){

res.status(500).json({
message:e.message
});

}

};


exports.getNextOrderNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const lastJob = await Job.findOne({
      where: {
        orderNo: {
          [Op.like]: `ORD-${year}-%`
        }
      },
      order: [['createdAt', 'DESC']]
    });

    let nextNumber = 1;

    if (lastJob && lastJob.orderNo) {
      const lastNumber = parseInt(lastJob.orderNo.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const padded = String(nextNumber).padStart(3, '0');

    res.json({
      orderNo: `ORD-${year}-${padded}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to generate order number'
    });
  }
};