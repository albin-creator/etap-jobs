
// redirect if not admin  
guard('admin');

// number-to-words helper (same as before)  
function numberToWords(num) {  
  if (num === 0) return 'zero';  
  const ones = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven',  
                 'twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];  
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];  
  let words = '';  
  if (Math.floor(num / 1000) > 0) {  
    words += ones[Math.floor(num / 1000)] + ' thousand ';  
    num %= 1000;  
  }  
  if (Math.floor(num / 100) > 0) {  
    words += ones[Math.floor(num / 100)] + ' hundred ';  
    num %= 100;  
  }  
  if (num > 0) {  
    if (num < 20) words += ones[num];  
    else {  
      words += tens[Math.floor(num / 10)];  
      if (num % 10 > 0) words += '-' + ones[num % 10];  
    }  
  }  
  return words.trim();  
}

new Vue({  
  el: '#app',  
  data: {  
    role: 'admin',  
    newJob: {  
      customer: '',  
      contact: '',
      orderNo: '',  
      date: '',  
      dueDate: '',  
      items: [{ name: '', qty: 1, price: 0 }],  
      advance: 0  
    },  
    jobs: [],  
    selectedJob: null  
  },

  computed: {  

  filteredJobs() {  
    return this.jobs;
  },  

  subtotal() {  
    return this.newJob.items.reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0), 
      0
    );  
  },  

  total() {  
    return this.subtotal;  
  },  

  amountWords() {  
    const val = Math.round(this.total);  
    return val === 0 ? 'zero' : numberToWords(val) + ' riyals';  
  },  


  todayStats(){

    const today = new Date().toISOString().slice(0,10);

    let totalAmount = 0;
    let admin = 0;
    let designer = 0;
    let printer = 0;
    let delivery = 0;


    this.jobs.forEach(job=>{

      if(job.jobDate === today || job.date === today){
        totalAmount += Number(job.total || 0);
      }

      if(job.status === 'pending') admin++;

      if(job.status === 'design') designer++;

      if(job.status === 'printer') printer++;

      if(job.status === 'completed') delivery++;

    });


    return {
      totalAmount,
      admin,
      designer,
      printer,
      delivery
    };

  }

  },

  methods: {  


    async saveDelivery(job){

  await api(
    `/jobs/${job.id}/delivery`,
    'PATCH',
    {
      zone: job.zone,
      building: job.building,
      street: job.street
    }
  );


  this.selectedJob = null;

  this.loadJobs();

  },

  async updateDeliveryStatus(job, status){

  await api(
    `/jobs/${job.id}/delivery-status`,
    'PATCH',
    {
      deliveryStatus: status
    }
  );

  job.deliveryStatus = status; // instant UI update

  this.selectedJob = null;

  this.loadJobs();

  },

    openJob(job) {
        console.log("Clicked job:", job);

        this.selectedJob = {
            ...job,
            total: Number(job.total || 0),
            subtotal: Number(job.subtotal || 0),
            advance: Number(job.advance || 0),
            items: (job.items || []).map(item => ({
            name: item.name,
            qty: Number(item.qty || 0),
            price: Number(item.price || 0)
          }))
        };
    },
    

    logout() {
    localStorage.clear();
    location.href = '/index.html';
    },

    async loadJobs() {  
      console.log("Jobs:", this.jobs);
      try {  
        this.jobs = await api('/jobs');  
      } catch (e) {  
        console.error(e);  
      }  
    },

    async getNextOrderNumber() {
  try {
    const res = await api('/jobs/next-order-number');

    if (res.orderNo) {
      this.newJob.orderNo = res.orderNo;
    }

  } catch (e) {
    console.error("Order number error:", e);
  }
},

    async createJob() {  
      const payload = {  
        customer: this.newJob.customer,  
        contact: this.newJob.contact,
        date: this.newJob.date,  
        dueDate: this.newJob.dueDate,  
        items: this.newJob.items
        .filter(it => it.name.trim() !== '')
        .map(it => ({
           name: it.name,
           description: it.description,
           qty: it.qty,
           price: it.price
         })),  
        advance: this.newJob.advance || 0,  
        amountWords: this.amountWords  
      };

      if (payload.items.length === 0) {  
        alert('Add at least one item');  
        return;  
      }

      const res = await api('/jobs', 'POST', payload);  
      if (res.id) {  
        // reset form  
        this.newJob = {  
          customer: '',  
          orderNo: '',  
          date: new Date().toISOString().slice(0, 10),  
          dueDate: '',  
          items: [{ name: '', description:'', qty: 1, price: 0 }],  
          advance: 0  
        };  
        this.loadJobs();  
      } else {  
        alert(res.message || 'Error creating job');  
      }  
    },

    async updateStatus(job, status) {  
      await api(`/jobs/${job.id}/status`, 'PATCH', { status });  
      this.selectedJob = null;  
      this.loadJobs();  
    }  
  },

  mounted() {  

    console.log("Vue mounted");

    // set default dates  
    if (!this.newJob.date) {  
      this.newJob.date = new Date().toISOString().slice(0, 10);  
    }  

    this.getNextOrderNumber(); 
    this.loadJobs();  

     // 🔥 SOCKET REAL TIME
  const socket = io("https://etap-jobs-api.onrender.com");


  socket.on('jobCreated', (job)=>{

      console.log("New job:",job);

      this.getNextOrderNumber();
      this.loadJobs();

  });


  socket.on('jobUpdated',(job)=>{

      console.log("Job updated:",job);

      this.loadJobs();

  });

  }  
});  