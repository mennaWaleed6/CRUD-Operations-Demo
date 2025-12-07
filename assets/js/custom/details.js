document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productCode = urlParams.get('code');

    console.log('Product Code from URL:', productCode);
    console.log('localStorage keys:', Object.keys(localStorage));

    if (productCode) {
        loadProductDetails(productCode);
    } else {
        alert('No product code in URL');
    }
});

function loadProductDetails(code) {
    const storageKey = `product_${code}`;
    console.log('Looking for key:', storageKey);
    
    const productDataString = localStorage.getItem(storageKey);
    console.log('Data from localStorage:', productDataString);
    
    if (productDataString) {
        const productData = JSON.parse(productDataString);
        console.log('Parsed data:', productData);
        
        document.getElementById('productCode').textContent = productData.code ;
        document.getElementById('product').textContent = productData.name ;
        document.getElementById('qty').textContent = productData.qty ;
        document.getElementById('perPrice').textContent = productData.price;
        document.getElementById('description').textContent = productData.description;
    } else {
        alert(`Product with code ${code} not found in localStorage`);
        window.history.back();
    }
}


function goBack() {
     window.location.href = 'index2.html';
    
    //window.history.back();
}