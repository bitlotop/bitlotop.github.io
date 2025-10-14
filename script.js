
document.querySelectorAll('.burger').forEach(b=>b.addEventListener('click',()=>{
  const menu=document.querySelector('.menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}));

function submitNewsletter(e){
  e.preventDefault();
  const email = document.getElementById('email').value;
  alert('Thanks! (placeholder) — we received: ' + email);
  // Replace this with real integration (Mailchimp / backend) later.
  return false;
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    e.preventDefault();
    const id=this.getAttribute('href').substring(1);
    const el=document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});
