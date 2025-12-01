import translations from "./translations.js";
import { dataTablesLanguage } from "./translations.js";

var selectedRow = null;
var table;
var productModal;
var currentLanguage = 'en';

function loadProductsFromStorage() {
    // Clear existing table data
    table.clear();
    
    // Load all products from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('product_')) {
            const product = JSON.parse(localStorage.getItem(key));
            const id = key.replace('product_', '');
            
            table.row.add([
                product.code,
                product.name,
                product.qty,
                '$' + product.price,
                `<div class="action-buttons">
                    <a href="detail.html?code=${encodeURIComponent(id)}" class="btn btn-view viewBtn"><i class="bi bi-eye"></i></a>
                    <button class='btn-edit editBtn' title='Edit'><i class="bi bi-pencil"></i></button>
                    <button class='btn-delete deleteBtn' title='Delete'><i class="bi bi-trash"></i></button>
                 </div>`
            ]);
        }
    }
    table.draw();
}

const getCookie = (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
};

let productIdCounter = parseInt("0");

const generateUniqueId = () => {
    productIdCounter++;
    document.cookie ='productIdCounter='+ productIdCounter.toString() + '; max-age=' + 60*60*24*30;
    return productIdCounter.toString();
};

document.addEventListener("DOMContentLoaded",()=>{
    const language = getCookie("lang") || "en";
    
    const savedCounter = getCookie("productIdCounter");
    if (savedCounter) {
        productIdCounter = parseInt(savedCounter);
    }
    

    setLanguage(language );
});

const setLanguage =(language) => {
    currentLanguage = language;

    const elements = document.querySelectorAll("[data-il8n]");
    elements.forEach((element)=>{
        const translationKey= element.getAttribute("data-il8n");
        element.textContent = translations[language][translationKey];
    });

    document.dir = language ==='ar' ? 'rtl' : 'ltr';

    toastr.options.positionClass = language === 'ar' 
        ? "toast-top-left" 
        : "toast-top-right";
    
    updateLanguageButtons(language);

    if (table) {

        table.destroy(false);
        table = $('#storelist').DataTable({
            
            language: dataTablesLanguage[language],
            autowidth: false,
            responsive: true
            
        });
    };
    
    document.cookie = 'lang='+language + '; max-age=' + 60*60*24*30;
};

window.setLanguage = setLanguage;

const updateLanguageButtons = (language) => {
    const enBtn = document.getElementById('enBtn');
    const arBtn = document.getElementById('arBtn');


    // Remove active from both buttons
    enBtn.classList.remove('active');
    arBtn.classList.remove('active');

    // Add active to selected button
    if (language === 'en') {
        enBtn.classList.add('active');
    } else {
        arBtn.classList.add('active');
    }
};

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": currentLanguage ==='ar' ? "toast-top-left" : "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};


$(document).ready(function () {
    
    table =$('#storelist').DataTable({
        language: dataTablesLanguage[currentLanguage],
        autowidth: false,
        responsive: true
    });

    if(localStorage.length===0){
        const sampleProducts = [
            {id: generateUniqueId(), code: '001', name: 'Keyboard', qty: '5', price: '150' },
            {id: generateUniqueId(), code: '002', name: 'Mouse', qty: '10', price: '80' },
            {id: generateUniqueId(), code: '003', name: 'Monitor', qty: '2', price: '1200' }
        ];

        sampleProducts.forEach(product => {
            localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
        });}
    loadProductsFromStorage();
    productModal = new bootstrap.Modal(document.getElementById('productForm'),{
        
        backdrop: 'static',
        keyboard: false
    });

    // Submit form
    $(document).on("submit", "#myForm",function (e) {
        e.preventDefault();
        let formData = readFormData();
        let hasError = false;
        const lang = translations[currentLanguage];
    
        $("#codeError").text("");
        $("#productError").text("");
        if (!formData.productCode || formData.productCode.trim() === "") {
            
            $("#codeError").text(lang.codeRequired);
            hasError = true;
        }
        if ( !formData.product) {
            hasError = true;
             $("#productError").text(lang.nameRequired);
        }

        if (hasError) {
            return;
        }
       
        if (selectedRow == null) {
            insertNewRecord(formData);
            toastr.success(lang.addedSuccessfully);
        } else {
            updateRecord(formData);
             toastr.success(lang.updatedSuccessfully);
        }

        resetForm();
        productModal.hide();
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
    });

    $(document).on("click", ".editBtn", function (e) {
    e.preventDefault();
        onEdit(this);
    productModal.show();
});

$(document).on("click", ".deleteBtn", function (e) {
    e.preventDefault();
    onDelete(this);
});

$('#productForm').on('hidden.bs.modal', function () {
    resetForm();
    $("#codeError").text("");
    $("#productError").text("");
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
});
});

// Get form data
function readFormData() {
    return {
        productCode: $("#productCode").val(),
        product: $("#product").val(),
        qty: $("#qty").val(),
        perPrice: $("#perPrice").val()
    };
}

// Insert data
function insertNewRecord(data) {
     const uniqueId = generateUniqueId();

     localStorage.setItem(`product_${uniqueId}`, JSON.stringify({
        id: uniqueId,
        code: data.productCode,
        name: data.product,
        qty: data.qty,
        price: data.perPrice
    }));

     table.row.add([
        data.productCode,
        data.product,
        data.qty,
        '$'+data.perPrice,
        `<div class="action-buttons">
            <a href="detail.html?code=${encodeURIComponent(uniqueId)}" class="btn btn-view viewBtn"><i class="bi bi-eye"></i></a>
            <button class='btn-edit editBtn' title='Edit'><i class="bi bi-pencil"></i></button>
            <button class='btn-delete deleteBtn' title='Delete'><i class="bi bi-trash"></i></button>
         </div>`
    ]).draw();

}

// Edit
function onEdit(button) {
    var row= $(button).closest("tr");
    selectedRow = row;

    $("#productCode").val(row.find("td").eq(0).text());
    $("#product").val(row.find("td").eq(1).text());
    $("#qty").val(row.find("td").eq(2).text());
    var price=row.find("td").eq(3).text().replace('$', '');
    $("#perPrice").val(price);
}

// Update record
function updateRecord(formData) {
  
    var cells = selectedRow.find("td");
    cells.eq(0).text(formData.productCode);
    cells.eq(1).text(formData.product);
    cells.eq(2).text(formData.qty);
    cells.eq(3).text('$' + formData.perPrice);

    var row = selectedRow;
    var actionCell = row.find("td").eq(4).html();
    var codeMatch = actionCell.match(/code=([^"]+)/);
    
    if (codeMatch) {
        const productId = decodeURIComponent(codeMatch[1]);
        const storageKey = `product_${productId}`;
        
        // Update localStorage with new data
        localStorage.setItem(storageKey, JSON.stringify({
            id: productId,
            code: formData.productCode,
            name: formData.product,
            qty: formData.qty,
            price: formData.perPrice
        }));
    }

    selectedRow = null;
}

// Delete row
function onDelete(button) {
    const lang = translations[currentLanguage];
    Swal.fire({
        title: lang.deleteConfirmTitle,
        text: lang.deleteConfirmtext,
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#f5576c',
        confirmButtonText: lang.deleteConfirmButtonText,
        cancelButtonText: lang.deleteCancelButtonText
    }).then((result) => {
        if (result.isConfirmed) {
            var row = $(button).closest("tr");

            var actionCell = row.find("td").eq(4).html();
            var codeMatch = actionCell.match(/code=([^"]+)/);
            
            if (codeMatch) {
                const productId = decodeURIComponent(codeMatch[1]);
                const storageKey = `product_${productId}`;
                localStorage.removeItem(storageKey);
            }

            table.row(row).remove().draw();
            
            Swal.fire({
                title: lang.deleteConfirmTitleMsg,
                text:lang.deleteConfirmTextMsg,
                icon:'success',
                confirmButtonText: lang.deleteConfirmButton

         } );
            
        }
    });

}

// Reset form
function resetForm() {
    $("#myForm")[0].reset();

    selectedRow = null;
}


