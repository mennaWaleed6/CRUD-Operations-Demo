import translations from "./translations.js";
import { dataTablesLanguage } from "./translations.js";

var selectedRow = null;
var table;
var productModal;
var currentLanguage = 'en';
var selectedProductId= null;
let tableInitialized = false;
const isProductPage = !!document.querySelector('#storelist');
const STORAGE_VERSION = 2;
const englishRegex = /^[A-Za-z0-9\s.,'-]+$/;
const arabicRegex = /^[\u0600-\u06FF0-9\s.,'-]+$/;

function createActionButtons(productId) {
    return `<div class="action-buttons">
                <a href="details.html?code=${encodeURIComponent(productId)}" class="btn btn-view viewBtn" title="View"><i class="bi bi-eye" aria-hidden="true"></i></a>
                <button class='btn-edit editBtn' title='Edit' data-product-id="${productId}"><i class="bi bi-pencil" aria-hidden="true"></i></button>
                <button class='btn-delete deleteBtn' title='Delete' data-product-id="${productId}"><i class="bi bi-trash" aria-hidden="true"></i></button>
                </div>`;    
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

const setLanguage = (language) => {
    currentLanguage = language;

    const elements = document.querySelectorAll("[data-il8n]");
    elements.forEach((element)=>{
        const translationKey= element.getAttribute("data-il8n");
        element.textContent = translations[language][translationKey];
    });

    document.dir = language ==='ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = language ==='ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;


    document.addEventListener('DOMContentLoaded', function() {
        // Enable Bootstrap RTL or LTR
        const rtlLink = document.getElementById("bootstrapRTL");
        const ltrLink = document.getElementById("bootstrapLTR");

        console.log("rtllink: ", rtlLink, " ltrLink: ", ltrLink);
        if (language === 'ar') {
            rtlLink.disabled = false;
            ltrLink.disabled = true;
        } else {
            rtlLink.disabled = true;
            ltrLink.disabled = false;
        }

    });
    updateLanguageButtons(language);

    if(tableInitialized && isProductPage && window.location.pathname.includes('index2.html')){
        updateToastrlanguage(language);
        updateTableLanguage(language);    

   }
    document.cookie = 'lang='+language + '; max-age=' + 60*60*24*30;
};

const updateToastrlanguage = (language) => {
    toastr.options.positionClass = language === 'ar' 
        ? "toast-top-left" 
        : "toast-top-right";
};

const updateTableLanguage = (language) => {
        if(!isProductPage) return;
        if(!table){
            console.error("table not initialized in updateTableLang.");
            return;
        }
        
        table.destroy(false);

        $('#storelist').removeClass().addClass('table table-hover table-striped nowrap');

        table = initTable();
        
        loadProductsFromStorage();
        /*if(table){
        loadProductsFromStorage();
        }else{
            console.error("Table initialization failed in updateTableLang.");
        }
    */
};

const updateLanguageButtons = (language) => {
    const enBtn = document.getElementById('enBtn');
    const arBtn = document.getElementById('arBtn');

    if (!enBtn || !arBtn) return;

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

window.setLanguage = setLanguage;
window.getCookie = getCookie;
window.updateLanguageButtons = updateLanguageButtons;

document.addEventListener('navbar:loaded', function() {
    const language = getCookie("lang") || "en";
    setLanguage(language);
});
if(window.toastr){
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
}
const initTable = () => {

    if ($.fn.DataTable.isDataTable("#storelist")) {
        $("#storelist").DataTable().destroy(true);
    }

   /* if(!document.getElementById('storelist')) {
        console.error("Table element with ID 'storelist' not found.");
        return null;
    }*/

    return $("#storelist").DataTable({
        
        layout:{ 
            topStart:{ 
                buttons:[{ 
                         text: currentLanguage === 'ar' ? 'تصدير إلى إكسل' : 'Export to Excel',
                         action: function (){
                            exportExcel();
                        }
                    }
                ]
            }
        },
        scrollX: false,//caused header and scroll duplication in adding footer
        responsive: false,
        columnDefs: [
       // { targets: 0, visible: true , searchable: true},    
        { targets: 5, visible: false },
        { targets: 6, orderable: false, searchable: false}
        ],
        language: dataTablesLanguage[currentLanguage],
        autowidth: false,
        drawCallback: function () {
            this.api().columns.adjust();
            attachEventHandlers();
        }
    });
};

const excelHeaders = {
    en: ["Code", "Name", "Quantity", "Price", "Description"],
    ar: ["الكود", "الاسم", "الكمية", "السعر", "الوصف"]
};

function exportExcel() {
    if (!table) return;

    const data = table.rows().data().toArray();
    const lang = currentLanguage;

    const sheetData = [excelHeaders[lang]];

    data.forEach(row => {
        sheetData.push([
            row[0], // code
            currentLanguage === 'ar' ? row[2] : row[1], // name based on lang
            row[3], // quantity
            row[4].replace('$', ''), // price clean
            row[5]  // hidden description
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    if (lang === 'ar') ws["!rtl"] = true;

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    const filename = lang === 'ar' ? "الموظفين.xlsx" 
    : "Employee.xlsx";
    XLSX.writeFile(wb, filename);
}


// Attach event handlers to dynamically added elements
function attachEventHandlers() {
    $(document).off("click", ".editBtn").on("click", ".editBtn", function (e) {
        e.preventDefault();
        selectedProductId = $(this).data('product-id');
        console.log("Editing product ID: " + selectedProductId);
        onEdit(this);
        productModal.show();
        console.log("edit form opened");
    });

    $(document).off("click", ".deleteBtn").on("click", ".deleteBtn", function (e) {
        e.preventDefault();
        onDelete(this);
    });
    return table;
};

function loadProductsFromStorage() {

    if (!table) {
        console.error("DataTable is not initialized.");
         // Retry after a short delay
        setTimeout(() => {
            if(table) {
                loadProductsFromStorage();
            } else {
                console.error("Failed to load products - DataTable still not initialized");
            }
        }, 100);
        return;
    }
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
                product.nameEn,
                product.nameAr ,
                product.qty,
                '$' + product.price,
                product.description,
                createActionButtons(id)
            ]);
        }
    }
    table.draw();
}

function resetProductsForNewVersion() {
    const savedVersion = parseInt(localStorage.getItem("storageVersion") || "1");

    if (savedVersion >= STORAGE_VERSION) return; // Already upgraded ✔

    console.warn("Detected new version - Resetting product storage...");

    // Remove only product_ keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("product_")) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Add default sample data
    const sampleProducts = [
        { id: "1", code: "001", nameEn: "Keyboard", nameAr: "لوحة مفاتيح", qty: "5", price: "150", description: "Mechanical keyboard with RGB lighting" },
        { id: "2", code: "002", nameEn: "Mouse", nameAr: "فأرة", qty: "10", price: "80", description: "Wireless ergonomic mouse" },
        { id: "3", code: "003", nameEn: "Monitor", nameAr: "شاشة", qty: "2", price: "1200", description: "27-inch 4K UHD display" }
    ];

    sampleProducts.forEach(product =>
        localStorage.setItem(`product_${product.id}`, JSON.stringify(product))
    );

    // Mark upgrade done
    localStorage.setItem("storageVersion", STORAGE_VERSION.toString());

    console.log("✔ Storage reset and dummy data inserted");
}
/*function hasAnyProducts() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);    
        if (key.startsWith('product_')) {
            return true;
        }
    }
    return false;
}
*/
if(window.jQuery){
    $(document).ready(function () {

        resetProductsForNewVersion();
        //console.log("Document .ready script.js loaded");
        const language = getCookie("lang") || "en";
        
        const savedCounter = getCookie("productIdCounter");
        if (savedCounter) {
            productIdCounter = parseInt(savedCounter);
        }
        

        setLanguage(language );

        if(!isProductPage ) return;

        table = initTable();
        tableInitialized = true;
       /* if(!hasAnyProducts()){
            const sampleProducts = [
                {id: generateUniqueId(), code: '001', nameEn: 'Keyboard',nameAr: 'لوحة مفاتيح',qty: '5', price: '150', description: 'High-quality mechanical keyboard with RGB lighting' },
                {id: generateUniqueId(), code: '002', nameEn: 'Mouse',nameAr: 'فأرة', qty: '10', price: '80', description: 'Wireless mouse with ergonomic design' },
                {id: generateUniqueId(), code: '003', nameEn: 'Monitor',nameAr: 'شاشة عرض', qty: '2', price: '1200', description: '27-inch 4K UHD display with HDR support' }
            ];

            sampleProducts.forEach(product => {
                localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
            });
        }
        if(table){*/
        loadProductsFromStorage();/*}
        else{
            console.error("Table initialization failed in document.ready.");
        }*/

        productModal = new bootstrap.Modal(document.getElementById('productForm'),{
            
            backdrop: true,
            keyboard: true
        });

        $(document).on("click", "#newProductBtn", function (e) {
            e.preventDefault();
            
            // Clear any previous data
            selectedRow = null;
            selectedProductId = null;
            resetForm();
            $("#codeError").text("");
            $("#productError").text("");
            $("#productErrorAr").text("");
            
            // Open the modal
            productModal.show();
            
            console.log("✓ New Product form opened");
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
            if ( !formData.productEn.trim()) {
                
                $("#productError").text(lang.nameEnRequired);
                hasError = true;
            }else if(!englishRegex.test(formData.productEn.trim())){
                $("#productError").text(lang.nameEnInvalid);
                hasError = true;
            }
            if ( !formData.productAr.trim()) {
                
                $("#productErrorAr").text(lang.nameArRequired);
                hasError = true;
            }else if(!arabicRegex.test(formData.productAr.trim())){
                $("#productErrorAr").text(lang.nameArInvalid);
                hasError = true;
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
        });

        $(document).on("click", ".editBtn", function (e) {
            e.preventDefault();
            selectedProductId = $(this).data('product-id');
            console.log("Editing product ID: " + selectedProductId);

            onEdit(this);
            productModal.show();
            console.log("edit form opened");
        });

        $(document).on("click", ".deleteBtn", function (e) {
            e.preventDefault();
            onDelete(this);
        });

        $('#productForm').on('hidden.bs.modal', function () {
            resetForm();
            $("#codeError").text("");
            $("#productError").text("");
            $('.modal-backdrop').remove();//
            $('body').removeClass('modal-open');//
            
        });

        document.addEventListener('visibilitychange', function() {
            console.log("Visibility changed: ", document.hidden+ ", isProductPage: "+ isProductPage + ", tableInitialized: " + tableInitialized +   " isproductpage: "+ isProductPage);
            if(!document.hidden && isProductPage && tableInitialized) {
                console.log("returned to product list");
                loadProductsFromStorage();
            }});
    });
} else {
    //for details page apply set lang
    document.addEventListener('DOMContentLoaded', function() {
        const language = getCookie("lang") || "en";
        setLanguage(language);
    });
}
// Get form data
function readFormData() {
    return {
        productCode: $("#productCode").val(),
        productEn: $("#productEn").val(),
        productAr: $("#productAr").val(),
        qty: $("#qty").val(),
        perPrice: $("#perPrice").val(),
        description: $("#description").val()
    };
}

// Insert data
function insertNewRecord(data) {
     const uniqueId = generateUniqueId();

     localStorage.setItem(`product_${uniqueId}`, JSON.stringify({
        id: uniqueId,
        code: data.productCode,
        nameEn: data.productEn,
        nameAr: data.productAr,
        qty: data.qty,
        price: data.perPrice,
        description: data.description
    }));

    //const displayName = currentLanguage === 'ar' ? data.productAr : data.productEn;

     table.row.add([
        data.productCode,
        data.productEn,
        data.productAr,
        data.qty,
        '$'+data.perPrice,
        data.description,
        createActionButtons(uniqueId)
    ]).draw();

    console.log("✓ New product added - ID " + uniqueId );

}

// Edit
function onEdit(button) {
    var row= $(button).closest("tr");
    console.log("on clicking on edit"+row.find("td")+"/n selectedprodId:"+ selectedProductId);
    selectedRow = row;

    const productId = $(button).data('product-id');

    $("#productCode").val(row.find("td").eq(0).text());
    
    $("#qty").val(row.find("td").eq(3).text());
    var price=row.find("td").eq(4).text().replace('$', '');
    $("#perPrice").val(price);

    const storageKey = `product_${productId}`;
    const product = JSON.parse(localStorage.getItem(storageKey));
    console.log("product: "+ product);
    $("#productEn").val(product.nameEn);
    $("#productAr").val(product.nameAr);
    $("#description").val(product.description);
    //$("#description").val(row.find("td").eq(4).text());

    console.log("✓ Form populated - Code: " + row.find("td").eq(0).text() + 
                ", Description: " + product.description);
}

// Update record
function updateRecord(formData) {
  
    var cells = selectedRow.find("td");

    //const displayName = currentLanguage === 'ar' ? formData.productAr : formData.productEn;
    //update visible cells
    cells.eq(0).text(formData.productCode);
    cells.eq(1).text(formData.productEn);
    cells.eq(2).text(formData.productAr);
    cells.eq(3).text(formData.qty);
    cells.eq(4).text('$' + formData.perPrice);
    
    const storageKey = `product_${selectedProductId}`;
        
        // Update localStorage with new data
    localStorage.setItem(storageKey, JSON.stringify({
        id: selectedProductId,
        code: formData.productCode,
        nameEn: formData.productEn,
        nameAr: formData.productAr,
        qty: formData.qty,
        price: formData.perPrice,
        description: formData.description
    }));
    //}

    selectedRow = null;
    selectedProductId = null;
}

// Delete row
function onDelete(button) {
    const lang = translations[currentLanguage];

    const productId = $(button).data('product-id');

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

            const storageKey = `product_${productId}`;
            localStorage.removeItem(storageKey);
            //}

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
    selectedProductId = null;
}


