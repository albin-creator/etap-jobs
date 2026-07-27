/* ---------- admin panel logic ---------- */

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
      orderNo: '',  
      date: '',  
      dueDate: '',  
      items: [{ name: '', qty: 1, unit: '', price: 0 }],  
      advance: 0  
    },  
    jobs: [],  
    selectedJob: null  
  },

  computed: {  
    filteredJobs() {  
      return this.jobs;  // admin sees all  
    },  
    subtotal() {  
      return this.newJob.items.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0);  
    },  
    total() {  
      return this.subtotal;  
    },  
    amountWords() {  
      const val = Math.round(this.total);  
      return val === 0 ? 'zero' : numberToWords(val) + ' dollars';  
    }  
  },

  methods: {  
    async loadJobs() {  
      try {  
        this.jobs = await api('/api/jobs');  
      } catch (e) {  
        console.error(e);  
      }  
    },

    async createJob() {  
      const payload = {  
        customer: this.newJob.customer,  
        orderNo: this.newJob.orderNo,  
        date: this.newJob.date,  
        dueDate: this.newJob.dueDate,  
        items: this.newJob.items.filter(it => it.name.trim() !== ''),  
        advance: this.newJob.advance || 0,  
        amountWords: this.amountWords  
      };

      if (payload.items.length === 0) {  
        alert('Add at least one item');  
        return;  
      }

      const res = await api('/api/jobs', 'POST', payload);  
      if (res.id) {  
        // reset form  
        this.newJob = {  
          customer: '',  
          orderNo: '',  
          date: new Date().toISOString().slice(0, 10),  
          dueDate: '',  
          items: [{ name: '', qty: 1, unit: '', price: 0 }],  
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
    // set default dates  
    if (!this.newJob.date) {  
      this.newJob.date = new Date().toISOString().slice(0, 10);  
    }  
    this.loadJobs();  
  }  
});  