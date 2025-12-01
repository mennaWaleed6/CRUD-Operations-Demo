const translations = {
    en: {
        code: "Product Code",
        name: "Product Name",
        qty: "Qty",
        price: "Price",
        actions: "Actions",
        header: "Product Management System",
        new: "New Product",
        form: "Product Form",
        submit: "Submit",
        close: "Close",
        labelCode: "Code",
        labelName: "Name",
        labelQty: "Qty",
        labelPrice: "Price",
        codeRequired: "Product Code is required.",
        nameRequired: "Product Name is required.",

        deleteConfirmTitle: "Are you sure?",
        deleteConfirmText: "You won't be able to revert this!",
        deleteConfirmButtonText: "Yes, delete it!",
        deleteCancelButtonText: "Cancel",
        deleteConfirmTitleMsg: "Deleted!",
        deleteConfirmTextMsg: "Product has been deleted.",
        deleteConfirmButton: "OK",

        addedSuccessfully: "Product added successfully!",
        updatedSuccessfully: "Product updated successfully!"
    },
    ar: {
        code: "كود المنتج",
        actions: "الإجراءات",
        name: "اسم المنتج",
        qty: "الكمية",
        price: "السعر",
        header: "نظام إدارة المنتجات",
        new: "منتج جديد",
        form: "نموذج المنتج",
        submit: "إرسال",
        close: "إغلاق",
        labelCode: "كود المنتج",
        labelName: "الاسم",
        labelQty: "الكمية",
        labelPrice: "السعر",
        codeRequired: "كود المنتج مطلوب.",
        nameRequired: "اسم المنتج مطلوب.",

        deleteConfirmTitle: "هل أنت متأكد؟",
        deleteConfirmText: "لن تتمكن من التراجع عن هذا!",
        deleteConfirmButtonText: "نعم، احذفه!",
        deleteCancelButtonText: "إلغاء",
        deleteConfirmTitleMsg: "تم الحذف!",
        deleteConfirmTextMsg: "تم حذف المنتج.",
        deleteConfirmButton: "حسناً",

        addedSuccessfully: "تم إضافة المنتج بنجاح!",
        updatedSuccessfully: "تم تحديث المنتج بنجاح!"

    }
};

const dataTablesLanguage = {
    en: {
        "emptyTable": "No data available in table",
        "info": "Showing _START_ to _END_ of _TOTAL_ entries",
        "infoEmpty": "Showing 0 to 0 of 0 entries",
        "infoFiltered": "(filtered from _MAX_ total entries)",
        "infoPostFix": "",
        "lengthMenu": "Show _MENU_ entries",
        "loadingRecords": "Loading...",
        "processing": "Processing...",
        "search": "Search:",
        "zeroRecords": "No matching records found",
        "paginate": {
           // "first": "First",
            //"last": "Last",
            "next": "Next",
            "previous": "Previous"
        },
        "aria": {
            "orderable": "Sort this column",
            "orderableRemove": "Remove sorting"
        }
    },
    ar: {
        "emptyTable": "لا يوجد بيانات متاحة في الجدول",
        "info": "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
        "infoEmpty": "يعرض 0 إلى 0 من أصل 0 مُدخل",
        "infoFiltered": "(مرشحة من مجموع _MAX_ مُدخل)",
        "infoPostFix": "",
        "lengthMenu": "أظهر _MENU_ مدخلات",
        "loadingRecords": "جارٍ التحميل...",
        "processing": "جارٍ المعالجة...",
        "search": "ابحث:",
        "zeroRecords": "لم يعثر على أية سجلات",
        "paginate": {
           // "first": "الأول",
           // "last": "الأخير",
            "next": "التالي",
            "previous": "السابق"
        },
        "aria": {
            "orderable": "تفعيل الترتيب",
            "orderableRemove": "تفعيل إلغاء الترتيب"
        }
    }
};

export default translations;
export { dataTablesLanguage };