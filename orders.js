// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCPKXE6zCr3HyzRDsIxl-ATVPUEh0SAJxA",
    authDomain: "ramadan-5f642.firebaseapp.com",
    projectId: "ramadan-5f642",
    storageBucket: "ramadan-5f642.firebasestorage.app",
    messagingSenderId: "101409594426",
    appId: "1:101409594426:web:9fba27dea7c542056ea903"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
    const ordersList = document.getElementById("orders-list");

    function loadOrders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = firebase.firestore.Timestamp.fromDate(today);

        db.collection("orders")
            .where("timestamp", ">=", startOfDay)
            .orderBy("timestamp", "desc")
            .get()
            .then(snapshot => {
                ordersList.innerHTML = "";

                if (snapshot.empty) {
                    const todayFormatted = today.toLocaleDateString("ar-SA", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    ordersList.innerHTML = `<li>لا يوجد طلبات ليوم ${todayFormatted}.</li>`;
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const orderId = data.id;
                    console.log("📌 بيانات الطلب كاملة:", data);

                    const orderItems = data.items || [];
                    console.log("📌 عناصر الطلب:", orderItems);

                    const orderItem = document.createElement("li");
                    orderItem.classList.add("order-item");

                    orderItem.innerHTML = `
                        <div class="order-header">
                            <strong>طلب #${orderId}</strong>
                            <small>${new Date(data.timestamp.toDate()).toLocaleString()}</small>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>العصير</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>حذف</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${orderItems.map((item, index) => {
                                const juice = item.juice || {};
                                console.log("📌 بيانات العصير:", juice);

                                const name = juice.name || "غير معروف";
                                const quantity = item.quantity !== undefined ? parseInt(item.quantity) : 1;
                                const price = typeof juice.price === "number" ? juice.price : 0;
                                const totalPrice = price * quantity;

                                return `
                                    <tr>
                                        <td>${name}</td>
                                        <td>${quantity}</td>
                                        <td>${totalPrice} ريال</td>
                                        <td>
                                            <button class="delete-item" data-order-id="${orderId}" data-index="${index}">حذف المنتج</button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                            </tbody>
                        </table>
                        <button class="delete-order" data-order-id="${orderId}">🗑️ حذف الطلب</button>
                    `;

                    ordersList.appendChild(orderItem);
                });

                // إضافة الأحداث للأزرار بعد تحميل الطلبات
                document.querySelectorAll(".delete-item").forEach(button => {
                    button.addEventListener("click", deleteOrderItem);
                });

                document.querySelectorAll(".delete-order").forEach(button => {
                    button.addEventListener("click", deleteOrder);
                });
            })
            .catch(error => console.error("Error loading orders:", error));
    }

    loadOrders();
});




function deleteOrderItem(event) {
    const orderId = event.target.getAttribute("data-order-id");
    const itemIndex = parseInt(event.target.getAttribute("data-index"));

    db.collection("orders").doc(orderId).get()
        .then(doc => {
            if (!doc.exists) {
                console.error("❌ الطلب غير موجود!");
                return;
            }

            let orderData = doc.data();
            orderData.items.splice(itemIndex, 1); // حذف المنتج من الطلب

            if (orderData.items.length === 0) {
                console.log(`🗑️ الطلب ${orderId} أصبح فارغًا، سيتم حذفه بالكامل.`);
                return db.collection("orders").doc(orderId).delete();
            } else {
                return db.collection("orders").doc(orderId).set(orderData);
            }
        })
        .then(() => {
            console.log(`✅ تم حذف المنتج من الطلب رقم ${orderId}`);

            // ✅ تحديث الطلبات بعد الحذف
            if (typeof loadOrders === "function") {
                loadOrders();
            } else {
                console.warn("⚠️ `loadOrders()` غير معرف، سيتم تحديث الصفحة بالكامل.");
                window.location.reload();
            }
        })
        .catch(error => console.error("❌ خطأ في حذف المنتج:", error));
}











function deleteOrder(event) {
    const orderId = event.target.getAttribute("data-order-id");

    // ⚠️ تأكيد الحذف قبل تنفيذ العملية
    const confirmDelete = confirm(`⚠️ هل أنت متأكد أنك تريد حذف الطلب رقم ${orderId} بالكامل؟`);
    if (!confirmDelete) {
        console.log("🚫 تم إلغاء حذف الطلب.");
        return;
    }

    db.collection("orders").doc(orderId).delete()
        .then(() => {
            console.log(`✅ تم حذف الطلب رقم ${orderId}`);

            // ✅ تحديث الطلبات بعد الحذف
            if (typeof loadOrders === "function") {
                loadOrders();
            } else {
                console.warn("⚠️ `loadOrders()` غير معرف، سيتم تحديث الصفحة بالكامل.");
                window.location.reload();
            }
        })
        .catch(error => console.error("❌ خطأ في حذف الطلب:", error));
}
