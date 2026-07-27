const API = 'https://etap-jobs-api.onrender.com/api';

function saveSession(token, user) {  
  localStorage.setItem('token', token);  
  localStorage.setItem('user', JSON.stringify(user));  
}  
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }  
function getToken() { return localStorage.getItem('token'); }  
function logout() { localStorage.clear(); location.href = '/index.html'; }

// redirect user to their role page  
function routeByRole(role) {  
  const map = {  
    admin: 'admin.html', designer: 'designer.html',  
    printer: 'printer.html', delivery: 'delivery.html',  
  };  
  location.href = '/' + (map[role] || 'index.html');  
}

// guard a page: only allow given role  
function guard(requiredRole) {  
  const u = getUser();  
  if (!u || !getToken()) return (location.href = '/index.html');  
  if (u.role !== requiredRole) return routeByRole(u.role);  
}

async function api(path, method = 'GET', body) {  
  const res = await fetch(API + path, {  
    method,  
    headers: {  
      'Content-Type': 'application/json',  
      Authorization: 'Bearer ' + getToken(),  
    },  
    body: body ? JSON.stringify(body) : undefined,  
  });  
  if (res.status === 401) return logout();  
  return res.json();  
}  