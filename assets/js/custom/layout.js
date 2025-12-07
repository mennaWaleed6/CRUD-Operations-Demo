import translations from "./translations.js";

document.addEventListener("DOMContentLoaded", () => {

    const footer= document.querySelector('.footer');

    fetch('assets/partials/footer.html')
    .then(res=>res.text())
    .then(html=>{
        footer.innerHTML=html;
        const yearEl = footer.querySelector('#year');
        yearEl.textContent = new Date().getFullYear();
        applyTranslations();

        document.dispatchEvent(new CustomEvent('footerLoaded'));
    });
});    

const applyTranslations = () => {   
    const language = getCookie("lang");
    document.querySelectorAll('[data-il8n]').forEach((el) => {
    const key = el.getAttribute('data-il8n');
    let text = translations[language][key];
    el.textContent = text;
    });
};


    
    