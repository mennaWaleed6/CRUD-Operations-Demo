var selectedRow = null;
var table;

$(document).ready(function () {
    table =$('#storelist').DataTable();

    // Submit form
    $("form").submit(function (e) {
        e.preventDefault();
        let formData = readFormData();

        if (selectedRow == null) {
            insertNewRecord(formData);
        } else {
            updateRecord(formData);
        }

        resetForm();
    });

    $(document).on("click", ".editBtn", function () {
    onEdit(this);
});

$(document).on("click", ".deleteBtn", function () {
    onDelete(this);
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
    /*$("#storelist tbody").append(`
        <tr>
            <td>${data.productCode}</td>
            <td>${data.product}</td>
            <td>${data.qty}</td>
            <td>${data.perPrice}</td>
            <td>
                <button class='editBtn'>Edit</button>
                <button class='deleteBtn'>Delete</button>
            </td>
        </tr>
    `);

    table.row.add($(this)).draw();*/
     table.row.add([
        data.productCode,
        data.product,
        data.qty,
        data.perPrice,
        `<button class='editBtn'>Edit</button>
         <button class='deleteBtn'>Delete</button>`
    ]).draw(false);

}

// Edit
function onEdit(button) {
    selectedRow = $(button).closest("tr");

    $("#productCode").val(selectedRow.find("td:eq(0)").text());
    $("#product").val(selectedRow.find("td:eq(1)").text());
    $("#qty").val(selectedRow.find("td:eq(2)").text());
    $("#perPrice").val(selectedRow.find("td:eq(3)").text());
}

// Update record
function updateRecord(formData) {
  /*  selectedRow.find("td:eq(0)").text(formData.productCode);
    selectedRow.find("td:eq(1)").text(formData.product);
    selectedRow.find("td:eq(2)").text(formData.qty);
    selectedRow.find("td:eq(3)").text(formData.perPrice);

    table.row(selectedRow).invalidate().draw(false); 

    selectedRow = null;*/
    var rowNode = selectedRow[0];
    
    // Update using DataTables API
    table.row(rowNode).data([
        formData.productCode,
        formData.product,
        formData.qty,
        formData.perPrice,
        `<button class='editBtn'>Edit</button>
         <button class='deleteBtn'>Delete</button>`
    ]).draw(false);

    selectedRow = null;
}

// Delete row
function onDelete(button) {
    if (confirm("Are you sure to delete this record?")) {
        $(button).closest("tr").remove();
        table.row($(button).closest("tr")).remove().draw();
    }
}

// Reset form
function resetForm() {
    $("#productCode").val("");
    $("#product").val("");
    $("#qty").val("");
    $("#perPrice").val("");

    selectedRow = null;
}
