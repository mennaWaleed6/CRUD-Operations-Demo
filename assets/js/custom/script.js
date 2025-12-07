import translations from "./translations.js";
import { dataTablesLanguage } from "./translations.js";

var selectedRow = null;
var table;
var productModal;
var currentLanguage = 'en';
var selectedProductId= null;
let tableInitialized = false;
const isProductPage = !!document.querySelector('#storelist');

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

    /*if ($.fn.DataTable.isDataTable("#storelist")) {
        $("#storelist").DataTable().destroy();
    }

    if(!document.getElementById('storelist')) {
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
        { targets: 4, visible: false },
        { targets: 5, orderable: false, searchable: false}
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
            row[1], // name
            row[2], // quantity
            row[3].replace('$', ''), // price clean
            row[4]  // hidden description
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
                product.name,
                product.qty,
                '$' + product.price,
                product.description,
                createActionButtons(id)
            ]);
        }
    }
    table.draw();
}
if(window.jQuery){
    $(document).ready(function () {
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

        if(localStorage.length===0){
            const sampleProducts = [
                {id: generateUniqueId(), code: '001', name: 'Keyboard', qty: '5', price: '150', description: 'High-quality mechanical keyboard with RGB lighting' },
                {id: generateUniqueId(), code: '002', name: 'Mouse', qty: '10', price: '80', description: 'Wireless mouse with ergonomic design' },
                {id: generateUniqueId(), code: '003', name: 'Monitor', qty: '2', price: '1200', description: '27-inch 4K UHD display with HDR support' }
            ];

            sampleProducts.forEach(product => {
                localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
            });
        }
        if(table){
        loadProductsFromStorage();}
        else{
            console.error("Table initialization failed in document.ready.");
        }

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
        product: $("#product").val(),
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
        name: data.product,
        qty: data.qty,
        price: data.perPrice,
        description: data.description
    }));

     table.row.add([
        data.productCode,
        data.product,
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
    $("#product").val(row.find("td").eq(1).text());
    $("#qty").val(row.find("td").eq(2).text());
    var price=row.find("td").eq(3).text().replace('$', '');
    $("#perPrice").val(price);

    const storageKey = `product_${productId}`;
    const product = JSON.parse(localStorage.getItem(storageKey));
    console.log("product: "+ product);
    $("#description").val(product.description);
    //$("#description").val(row.find("td").eq(4).text());

    console.log("✓ Form populated - Code: " + row.find("td").eq(0).text() + 
                ", Description: " + product.description);
}

// Update record
function updateRecord(formData) {
  
    var cells = selectedRow.find("td");
    //update visible cells
    cells.eq(0).text(formData.productCode);
    cells.eq(1).text(formData.product);
    cells.eq(2).text(formData.qty);
    cells.eq(3).text('$' + formData.perPrice);
    
    const storageKey = `product_${selectedProductId}`;
        
        // Update localStorage with new data
    localStorage.setItem(storageKey, JSON.stringify({
        id: selectedProductId,
        code: formData.productCode,
        name: formData.product,
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

           // var actionCell = row.find("td").eq(5).html();
            //var codeMatch = actionCell.match(/code=([^"]+)/);
            
           // if (codeMatch) {
                //const productId = decodeURIComponent(codeMatch[1]);
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


