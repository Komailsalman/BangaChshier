window.onload = () => {
    const editOrder = JSON.parse(localStorage.getItem('editOrder'));
    if (editOrder) {
        // إضافة الطلب المعدل إلى الجدول
        editOrder.orders.forEach(item => {
            // ضمان أن السعر والعدد يتم جلبهما كقيم رقمية
            const price = parseFloat(item.price);
            const count = parseInt(item.count);

            // التأكد من صحة القيم قبل الإضافة
            if (!isNaN(price) && !isNaN(count)) {
                addToTable(item.product, price / count); // تمرير السعر الفردي إلى الدالة
            } else {
                console.error(`القيم غير صالحة للمنتج: ${item.product}`);
            }
        });

        // عرض رقم الطلب المعدل
        document.getElementById("order-number").innerText = editOrder.orderNumber;

        // لا نحذف `editOrder` حتى يتم الحفظ أو الإلغاء
    } else {
        // إذا لم يكن هناك طلب معدل، عرض رقم الطلب الجديد
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const newOrderNumber = orders.length > 0
            ? Math.max(...orders.map(order => order.orderNumber)) + 1
            : 1;
        document.getElementById("order-number").innerText = newOrderNumber;
    }
};




let orderNumber = localStorage.getItem("lastOrderNumber") 
        ? parseInt(localStorage.getItem("lastOrderNumber")) 
        : 1;

document.getElementById("order-number").innerText = orderNumber;

let totalPrice = 0; // الإجمالي

function addToTable(productName, unitPrice) {
    const tableBody = document.getElementById('product-table-body');
    const totalPriceElement = document.getElementById('total-price');

    // قراءة الإجمالي الحالي
    let totalPrice = parseFloat(totalPriceElement.textContent.replace(' ريال', '').trim()) || 0;

    // التحقق مما إذا كان المنتج موجودًا بالفعل
    let existingRow = Array.from(tableBody.rows).find(row => row.cells[1].textContent === productName);

    if (existingRow) {
        // إذا كان المنتج موجودًا، قم بزيادة العدد وتحديث السعر الإجمالي
        const countCell = existingRow.cells[0];
        const priceCell = existingRow.cells[2];

        let count = parseInt(countCell.textContent) + 1; // زيادة العدد
        countCell.textContent = count;

        let totalProductPrice = count * unitPrice; // حساب السعر الإجمالي للمنتج
        priceCell.textContent = `${totalProductPrice} ريال`;

        // تحديث الإجمالي الكلي
        totalPrice += unitPrice;
        totalPriceElement.textContent = `${totalPrice} ريال`;
        return;
    }

    // إنشاء صف جديد إذا كان المنتج غير موجود
    const newRow = document.createElement('tr');

    // إضافة العدد (ابدأ من 1)
    const countCell = document.createElement('td');
    countCell.textContent = 1;

    // إضافة المنتج
    const productCell = document.createElement('td');
    productCell.textContent = productName;

    // إضافة السعر (ابدأ بالسعر الفردي)
    const priceCell = document.createElement('td');
    priceCell.textContent = `${unitPrice} ريال`;

    // إضافة زر الحذف
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'حذف';
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = () => {
        // خصم السعر الإجمالي للمنتج عند الحذف
        const count = parseInt(countCell.textContent);
        totalPrice -= count * unitPrice; 
        totalPriceElement.textContent = `${totalPrice} ريال`;

        // حذف الصف
        tableBody.removeChild(newRow);
    };
    deleteCell.appendChild(deleteButton);

    // إضافة الأعمدة إلى الصف
    newRow.appendChild(countCell);
    newRow.appendChild(productCell);
    newRow.appendChild(priceCell);
    newRow.appendChild(deleteCell);

    // إضافة الصف إلى الجدول
    tableBody.appendChild(newRow);

    // تحديث الإجمالي الكلي
    totalPrice += unitPrice;
    totalPriceElement.textContent = `${totalPrice} ريال`;
}






function clearTable() {
    const tableBody = document.getElementById('product-table-body');
    const totalPriceElement = document.getElementById('total-price');

    // مسح جميع الصفوف من الجدول
    tableBody.innerHTML = '';

    // إعادة تعيين الإجمالي إلى 0
    totalPrice = 0;

    // تحديث عنصر الإجمالي في الصفحة
    totalPriceElement.textContent = `${totalPrice} ريال`;
}





function printDirectly() {
    const table = document.getElementById('order-table');
    if (!table) {
        alert("الجدول غير موجود!");
        return;
    }

    const printTable = table.cloneNode(true);

    // حذف العمود الخاص بالحذف من نسخة الجدول
    const rows = printTable.rows;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].cells.length > 3) {
            rows[i].deleteCell(3); // حذف العمود الرابع (عمود زر الحذف)
        }
    }

    const now = new Date();
    const orderDate = now.toLocaleDateString();
    const orderTime = now.toLocaleTimeString();

    const madaAmount = parseFloat(document.getElementById('mada-amount').value) || 0;
    const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
    const totalAmount = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;

    if (madaAmount === 0 && cashAmount === 0) {
        alert("يجب اختيار طريقة دفع وإدخال المبلغ!");
        return;
    }

    const remaining = (cashAmount > totalAmount) ? (cashAmount - totalAmount) : 0;

    const paymentDetails = `
        <p><strong>طريقة الدفع:</strong></p>
        ${madaAmount > 0 ? `<p>مدى: ${madaAmount} ريال</p>` : ''}
        ${cashAmount > 0 ? `<p>كاش: ${cashAmount} ريال</p>` : ''}
        ${remaining > 0 ? `<p style="color: red;">المتبقي للعميل: ${remaining} ريال</p>` : ''}
    `;

    const logo = new Image();
    logo.src = "https://i.ibb.co/drZnrmK/bangalogo.png";

    logo.onload = function () {
        const printContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; direction: rtl; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin: auto; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div style="text-align: center;">
                    <img src="${logo.src}" alt="شعار" style="width: 100px; margin-bottom: 10px;">
                    <p style="font-size: 12px;">
                        <strong>تاريخ الطلب:</strong> ${orderDate} |
                        <strong>وقت الطلب:</strong> ${orderTime}
                    </p>
                </div>
                ${printTable.outerHTML}
                <div style="text-align: center; margin-top: 20px;">
                    ${paymentDetails}
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p>شكراً لتعاملكم معنا</p>
                    <div style="height: 1000px;"></div>
                </div>
            </body>
            </html>
        `;

        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();

        document.body.innerHTML = originalContent;

        // تحديث رقم الطلب بعد الطباعة
        const currentOrderNumber = parseInt(document.getElementById("order-number").textContent);
        const nextOrderNumber = currentOrderNumber + 1;
        document.getElementById("order-number").textContent = nextOrderNumber;

        // تخزين رقم الطلب الجديد في LocalStorage
        localStorage.setItem("lastOrderNumber", nextOrderNumber);

        // مسح الجدول بعد الطباعة
        clearTable();
    };

    logo.onerror = function () {
        alert("تعذر تحميل الشعار. يرجى التحقق من الرابط.");
    };
}




function updateOrderNumber() {
    const previousOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const nextOrderNumber = previousOrders.length + 1;
    document.getElementById('order-number').textContent = nextOrderNumber;
}





function saveOrdersToLocalStorage() {
    const tableBody = document.getElementById('product-table-body');
    const rows = Array.from(tableBody.rows);

    const orders = rows.map(row => {
        return {
            product: row.cells[1].textContent, // اسم المنتج
            price: parseFloat(row.cells[2].textContent.replace(' ريال', '')) || 0, // السعر
            count: parseInt(row.cells[0].textContent) || 1 // العدد
        };
    });

    const totalPrice = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;

    // الحصول على الطلبات السابقة من localStorage
    const previousOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderNumber = previousOrders.length + 1; // رقم الطلب يعتمد على عدد الطلبات السابقة + 1

    // حفظ الطلب الجديد
    previousOrders.push({
        orderNumber: orderNumber,
        orders: orders,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString() // إضافة الطابع الزمني
    });

    // تحديث Local Storage
    localStorage.setItem('orders', JSON.stringify(previousOrders));

    // تحديث رقم الطلب في الصفحة الرئيسية
    document.getElementById('order-number').textContent = orderNumber;
}







// قراءة الطلبات من localStorage
const orders = JSON.parse(localStorage.getItem("savedOrders")) || [];
const tableBody = document.getElementById("orders-body");

// عرض الطلبات في الجدول
orders.forEach((order, index) => {
    const row = document.createElement("tr");
    const items = order.items.map(item => `${item.product} (${item.price})`).join("<br>");

    row.innerHTML = `
        <td>${order.orderNumber}</td>
        <td>${items}</td>
        <td>${order.total} ريال</td>
        <td>
            <button onclick="deleteOrder(${index})" style="background-color: red; color: white; padding: 5px; border: none; border-radius: 5px; cursor: pointer;">
                حذف
            </button>
        </td>
    `;

    tableBody.appendChild(row);
});

// وظيفة حذف الطلب
function deleteOrder(index) {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟")) {
        // حذف الطلب من المصفوفة
        orders.splice(index, 1);

        // تحديث localStorage
        localStorage.setItem("savedOrders", JSON.stringify(orders));

        // إعادة تحميل الصفحة لتحديث الجدول
        location.reload();
    }
}
function resetOrderNumber() {
    // عرض رسالة تأكيد للمستخدم
    const confirmReset = confirm("هل أنت متأكد أنك تريد تجديد رقم الطلب إلى 1؟");
    if (confirmReset) {
        // إعادة تعيين رقم الطلب في localStorage
        orderNumber = 1;
        localStorage.setItem("lastOrderNumber", orderNumber);

        // تحديث رقم الطلب في الصفحة
        document.getElementById("order-number").innerText = orderNumber;

        // عرض رسالة نجاح
        alert("تم تجديد رقم الطلب بنجاح!");
    }
}
function addCustomPriceProduct() {
    // طلب اسم المنتج من المستخدم
    let productName = prompt("أدخل اسم المنتج:");
    if (!productName || productName.trim() === "") {
        productName = "طلب خاص"; // تعيين الاسم الافتراضي إذا لم يتم إدخال اسم
    }

    // طلب السعر من المستخدم مع التحقق من صحته
    let productPrice;
    while (true) {
        productPrice = parseFloat(prompt(`أدخل سعر ${productName} (ريال):`));
        if (!isNaN(productPrice) && productPrice > 0) {
            break; // الخروج من الحلقة إذا كان السعر صالحًا
        }
        alert("يجب إدخال سعر صالح!"); // عرض رسالة إذا كان السعر غير صالح
    }

    // إضافة المنتج إلى الجدول دائمًا كصف جديد
    addNewRowToTable(productName, productPrice);
}

function addNewRowToTable(productName, productPrice) {
    const tableBody = document.getElementById('product-table-body');

    // إنشاء صف جديد للمنتج
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>1</td> <!-- العدد يكون دائمًا 1 -->
        <td>${productName}</td>
        <td>${productPrice} ريال</td>
        <td>
            <button class="delete-btn" onclick="deleteProductRow(this)">
                حذف
            </button>
        </td>
    `;
    tableBody.appendChild(newRow);
}

function deleteProductRow(button) {
    // حذف الصف الحالي
    const row = button.parentElement.parentElement;
    row.remove();
}





function deleteProductRow(button) {
    // حذف الصف الحالي
    const row = button.parentElement.parentElement;
    row.remove();
}






function updateMadaPayment() {
    const madaAmount = parseFloat(document.getElementById('mada-amount').value) || 0;
    const totalAmount = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;

    if (madaAmount > totalAmount) {
        alert('المبلغ المدخل في مدى لا يمكن أن يكون أكبر من الإجمالي.');
        document.getElementById('mada-amount').value = '';
        document.getElementById('cash-amount').value = '';
    } else {
        document.getElementById('cash-amount').value = (totalAmount - madaAmount);
    }
}




function updateCashPayment() {
    const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
    const totalAmount = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;
    const remainingDiv = document.getElementById('cash-remaining');

    if (cashAmount > totalAmount) {
        const remaining = (cashAmount - totalAmount);
        remainingDiv.textContent = `المتبقي للعميل: ${remaining} ريال`;
        document.getElementById('mada-amount').value = '0';
    } else {
        remainingDiv.textContent = ''; // إخفاء النص إذا كان المبلغ صحيحًا
        document.getElementById('mada-amount').value = (totalAmount - cashAmount);
    }
}








function setFullAmountToMada() {
    const totalAmount = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;

    // تعيين المبلغ الكامل لخانة مدى
    document.getElementById('mada-amount').value = totalAmount;

    // تحديث الدفع مدى
    madaAmount = totalAmount;
    cashAmount = 0; // التأكد من عدم وجود كاش
    document.getElementById('cash-amount').value = 0;

}






function setFullAmountToCash() {
    const totalAmount = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', '')) || 0;

    // تعيين المبلغ الكامل لخانة مدى
    document.getElementById('cash-amount').value = totalAmount;

    // تحديث الدفع مدى
    cashAmount = totalAmount;
    madaAmount = 0; // التأكد من عدم وجود كاش
    document.getElementById('mada-amount').value = 0;

}









window.onload = () => {
    // التحقق من وجود طلب معدل في localStorage
    const editOrder = JSON.parse(localStorage.getItem('editOrder'));

    if (editOrder) {
        // عرض الطلب في الجدول
        const tableBody = document.getElementById("product-table-body");
        clearTable(); // مسح الجدول الحالي إذا كان موجودًا

        let totalPrice = 0; // متغير لتتبع الإجمالي
        editOrder.orders.forEach(item => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${item.count}</td>
                <td>${item.product}</td>
                <td>${item.price} ريال</td>
                <td>
                    <button class="delete-btn" onclick="deleteRow(this)">حذف</button>
                </td>
            `;
            tableBody.appendChild(newRow);

            // حساب الإجمالي
            totalPrice += item.price * item.count;
        });

        // تحديث الإجمالي
        const totalPriceElement = document.getElementById("total-price");
        totalPriceElement.textContent = `${totalPrice} ريال`;

        // تحديث رقم الطلب
        document.getElementById("order-number").textContent = editOrder.orderNumber;

        // مسح الطلب المعدل من localStorage
        localStorage.removeItem('editOrder');
    } else {
        // إذا لم يكن هناك طلب معدل، تحديث رقم الطلب
        const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        document.getElementById("order-number").textContent = savedOrders.length + 1;
    }
};

function clearTable() {
    const tableBody = document.getElementById("product-table-body");
    const totalPriceElement = document.getElementById("total-price");

    tableBody.innerHTML = ""; // مسح الصفوف
    totalPriceElement.textContent = "0 ريال"; // تصفير الإجمالي
}


function deleteRow(button) {
    const row = button.parentNode.parentNode; // الحصول على الصف الخاص بالزر
    const tableBody = document.getElementById("product-table-body");
    const priceCell = row.cells[2].textContent.replace(' ريال', '').trim(); // قراءة السعر
    const countCell = row.cells[0].textContent.trim(); // قراءة العدد
    const totalPriceElement = document.getElementById("total-price");

    // حساب الإجمالي الجديد بعد حذف المنتج
    const totalPrice = parseFloat(totalPriceElement.textContent.replace(' ريال', '').trim());
    const newTotal = totalPrice - (parseFloat(priceCell) * parseInt(countCell));
    totalPriceElement.textContent = `${newTotal} ريال`;

    // حذف الصف
    tableBody.removeChild(row);
}


function saveEditedOrder() {
    const tableBody = document.getElementById('product-table-body');
    const rows = Array.from(tableBody.rows);

    const updatedOrders = rows.map(row => {
        return {
            product: row.cells[1].textContent,
            price: parseFloat(row.cells[2].textContent.replace(' ريال', '')),
            count: parseInt(row.cells[0].textContent)
        };
    });

    const totalPrice = parseFloat(document.getElementById('total-price').textContent.replace(' ريال', ''));
    const orderNumber = parseInt(document.getElementById('order-number').textContent);

    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrderIndex = savedOrders.findIndex(order => order.orderNumber === orderNumber);

    if (updatedOrderIndex !== -1) {
        savedOrders.splice(updatedOrderIndex, 1); // حذف الطلب الأصلي
    }

    savedOrders.push({
        orderNumber: orderNumber,
        orders: updatedOrders,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('orders', JSON.stringify(savedOrders));
}
