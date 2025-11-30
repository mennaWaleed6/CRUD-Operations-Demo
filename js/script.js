import translations from "./translations.js";
import { dataTablesLanguage } from "./translations.js";

var selectedRow = null;
var table;
var productModal;
var currentLanguage = 'en';


/*const languageSelector= document.querySelector("select");

languageSelector.addEventListener("change", (event)=>{
    setLanguage(event.target.value);
    localStorage.setItem("lang", event.target.value);
});*/



document.addEventListener("DOMContentLoaded",()=>{
    const language = localStorage.getItem("lang") || "en";
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
            responsive: true,
            layout: {
                topStart: 'pageLength',      // ← Show X entries
                topEnd: 'search',             // ← Search box
                bottomStart: 'info',
                bottomEnd: 'paging'
            }
        });
    };
    
    localStorage.setItem("lang", language);
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
    
     table.row.add([
        data.productCode,
        data.product,
        data.qty,
        '$'+data.perPrice,
        `<div class="action-buttons">
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
        //confirmButtonColor: '#667eea' ,
        cancelButtonColor: '#f5576c',
        confirmButtonText: lang.deleteConfirmButtonText,
        cancelButtonText: lang.deleteCancelButtonText
    }).then((result) => {
        if (result.isConfirmed) {
            var row = $(button).closest("tr");
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
