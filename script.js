var selectedRow = null;
var table;
var productModal;

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-right",
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
    table =$('#storelist').DataTable();

    productModal = new bootstrap.Modal(document.getElementById('productForm'),{
        
        backdrop: 'static',
        keyboard: false
    });

    // Submit form
    $(document).on("submit", "#myForm",function (e) {
        e.preventDefault();
        let formData = readFormData();

        if (!formData.productCode || !formData.product) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Product Code and Name are required!'
            });
            return;
        }
        if (selectedRow == null) {
            insertNewRecord(formData);
            toastr.success("Product added successfully!");
        } else {
            updateRecord(formData);
             toastr.success("Product updated successfully!");
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
    // Invalidate and redraw without replacing the entire row
    //table.row(rowNode).invalidate().draw(false);

    selectedRow = null;
}

// Delete row
function onDelete(button) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var row = $(button).closest("tr");
            table.row(row).remove().draw();
            
            Swal.fire(
                'Deleted!',
                'Product has been deleted.',
                'success'
            );
            
        }
    });

}

// Reset form
function resetForm() {
    $("#myForm")[0].reset();

    selectedRow = null;
}
