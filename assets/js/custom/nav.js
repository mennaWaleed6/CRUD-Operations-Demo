
document.addEventListener('DOMContentLoaded',function(){
    const nav=document.querySelector('.navbar');
    if(!nav) return;

    fetch('navbar.html')
        .then(res=>res.text())
        .then(data=>{
            nav.innerHTML=data;
            document.dispatchEvent(new Event('navbar:loaded'));//reapply lang once button exist
        });
});


const footer= document.querySelector('.footer');

fetch('assets/partials/footer.html')
.then(res=>res.text())
.then(html=>{
    footer.innerHTML=html;
    const yearEl = footer.querySelector('#year');
    yearEl.textContent = new Date().getFullYear();
});

