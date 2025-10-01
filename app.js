
(function(){
  const $  = (s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const J = JSON, now = ()=>new Date().toISOString();
  const uid = p => `${p}-${Math.random().toString(36).slice(2,10)}`;
  const load=(k,d)=>{try{return J.parse(localStorage.getItem(k)||J.stringify(d))}catch{return d}};
  const save=(k,v)=>localStorage.setItem(k,J.stringify(v));
  const del =(k)=>localStorage.removeItem(k);

  function toast(t, ok=true){
    let el=$('#toast');
    if(!el){ el=document.createElement('div'); el.id='toast';
      Object.assign(el.style,{position:'fixed',right:'1rem',bottom:'1rem',padding:'.75rem 1rem',
      borderRadius:'.6rem',border:'1px solid #334155',background:'#0a142a',zIndex:9999,color:'#e5e7eb'});
      document.body.appendChild(el);
    }
    el.style.color = ok?'#bbf7d0':'#fecaca';
    el.style.borderColor = ok?'#14532d':'#7f1d1d';
    el.textContent = t; el.style.opacity=1; setTimeout(()=>el.style.opacity=0,3500);
  }

  // Pricing → remember plan
  $$('.js-plan').forEach(a=>a.addEventListener('click',e=>{
    localStorage.setItem('sc.selectedPlan', e.currentTarget.dataset.plan);
  }));

  // Signup
  const signup = $('#signupForm');
  if(signup){
    const planSel = $('#plan'); const preset = localStorage.getItem('sc.selectedPlan'); if(preset) planSel.value = preset;
    signup.addEventListener('submit', e=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(signup).entries());
      if(!data.email || !data.password || !data.consent){ toast('Complete all required fields & consent.', false); return; }
      const cc = (data.cc||'').replace(/\s+/g,''); if(cc.length<12){ toast('Enter a valid card number.', false); return; }
      const accounts = load('sc.accounts', []);
      if(accounts.some(a=>a.email.toLowerCase()===data.email.toLowerCase())){ toast('Account exists. Please sign in.', false); return; }
      const acct = { id:uid('acct'), createdAt:now(), ...data };
      accounts.push(acct); save('sc.accounts', accounts);
      save('sc.session', { id:acct.id, email:acct.email, plan:acct.plan });
      toast('Account created. Welcome!'); setTimeout(()=>location.href='dashboard.html', 800);
    });
  }

  // Login
  const login = $('#loginForm');
  if(login){
    login.addEventListener('submit', e=>{
      e.preventDefault();
      const {email,password} = Object.fromEntries(new FormData(login).entries());
      const accounts = load('sc.accounts', []);
      const user = accounts.find(a=>a.email.toLowerCase()===String(email).toLowerCase() && a.password===password);
      if(!user){ toast('Invalid email or password.', false); return; }
      save('sc.session', { id:user.id, email:user.email, plan:user.plan });
      toast('Signed in.'); setTimeout(()=>location.href='dashboard.html', 600);
    });
  }

  // Forgot
  const forgot = $('#forgotForm');
  if(forgot){
    forgot.addEventListener('submit', e=>{
      e.preventDefault();
      const {email} = Object.fromEntries(new FormData(forgot).entries());
      const accounts = load('sc.accounts', []);
      if(!accounts.some(a=>a.email.toLowerCase()===String(email).toLowerCase())){ toast('No account for that email.', false); return; }
      save('sc.reset.'+email.toLowerCase(), { token:uid('reset'), when:now() });
      toast('Password reset link sent.');
    });
  }

  // Contact
  const contact = $('#contactForm');
  if(contact){
    contact.addEventListener('submit', e=>{
      e.preventDefault();
      const o = Object.fromEntries(new FormData(contact).entries());
      const box = load('sc.contact', []); box.push({ id:uid('msg'), when:now(), ...o }); save('sc.contact', box);
      contact.reset(); toast('Thanks! We received your message.');
    });
  }

  // SMS Opt-in
  const opt = $('#optInForm');
  if(opt){
    opt.addEventListener('submit', e=>{
      e.preventDefault();
      const rec = Object.fromEntries(new FormData(opt).entries());
      if(!rec.consent){ toast('You must consent to receive texts.', false); return; }
      const list = load('sc.optins', []); list.push({ id:uid('sub'), when:now(), userAgent:navigator.userAgent, ...rec }); save('sc.optins', list);
      toast('Subscribed. Reply STOP at any time to opt out.');
    });
  }

  // Dashboard header
  const who = $('#whoami'); if(who){ const me=load('sc.session',null); who.textContent = me? me.email : 'guest'; }
  const signout = $('#signout'); if(signout){ signout.addEventListener('click', ()=>{ del('sc.session'); toast('Signed out.'); setTimeout(()=>location.href='index.html',500); }); }
})();
