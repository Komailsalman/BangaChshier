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

window.onload = function () {
    const productList = document.getElementById("product-list");
    const orderSummary = document.getElementById("order-items");
    const totalAmount = document.getElementById("total-price");
    const submitOrderButton = document.getElementById("submit-order");
    const orderIdElement = document.getElementById("order-id");

    let order = [];
    let totalPrice = 0;
    generateOrderId().then(orderId => {
        currentOrderId = orderId;
        document.getElementById("order-id").textContent = currentOrderId; // ✅ تحديث رقم الطلب في الصفحة
    });
    
    // قائمة العصائر المتاحة
    const juices = [
        { id: "1", name: "عرايسي", price: 19 },
        { id: "2", name: "عوار قلب", price: 19 },
        { id: "3", name: "منقا أفوكادو", price: 19 },
        { id: "4", name: "فبراير", price: 19 },
        { id: "5", name: "شمندر رمان", price: 19 },
        { id: "6", name: "ليمون نعناع", price: 19 },
        { id: "7", name: "نعنشة", price: 19 },
        { id: "10", name: "رمان ليمون نعناع", price: 19 },
        { id: "8", name: "رمان", price: 19 },
        { id: "9", name: "برتقال", price: 19 },
    ];

    // عرض المنتجات في الصفحة
    function displayProducts() {
        productList.innerHTML = "";
    
        const todayDocId = new Date().getDate().toString().padStart(2, '0');
    
        let stockData = {};
        let salesData = {};
    
        // 📌 1️⃣ جلب بيانات المخزون
        db.collection("stock").doc(todayDocId).get()
            .then(stockDoc => {
                if (stockDoc.exists) {
                    stockData = stockDoc.data().stockData || {};
                    console.log("📦 بيانات المخزون:", stockData);
                } else {
                    console.warn("⚠️ لا يوجد مخزون مسجل لهذا اليوم.");
                }
    
                // 📌 2️⃣ جلب بيانات الطلبات لليوم
                return db.collection("orders")
                    .where("timestamp", ">=", new Date(new Date().setHours(0, 0, 0, 0)))
                    .where("timestamp", "<", new Date(new Date().setHours(23, 59, 59, 999)))
                    .get();
            })
            .then(orderSnapshot => {
                if (orderSnapshot.empty) {
                    console.warn("⚠️ لا يوجد طلبات مسجلة اليوم.");
                }
    
                orderSnapshot.forEach(doc => {
                    const order = doc.data();
                    console.log(`📌 الطلب رقم ${order.id}:`, order);
    
                    order.items.forEach(item => {
                        const juice = item.juice || {}; // تأكد أن juice موجود
                        const juiceId = juice.id || null;
                        const quantity = item.quantity || 0;
    
                        if (!juiceId) {
                            console.warn("⚠️ عنصر غير معرف في الطلب:", item);
                            return;
                        }
    
                        if (!salesData[juiceId]) salesData[juiceId] = 0;
                        salesData[juiceId] += quantity;
                    });
                });
    
                console.log("📌 الكميات المباعة اليوم:", salesData);
    
                // 📌 3️⃣ حساب المخزون المتبقي وعرض المنتجات
                juices.forEach(juice => {
                    const stock = stockData[juice.id] || 0; // المخزون المسجل
                    const sold = salesData[juice.id] || 0; // الكمية المباعة اليوم
                    const remainingStock = stock - sold; // حساب المخزون المتبقي
    
                    const button = document.createElement("button");
                    button.classList.add("product-button");
    
                    // تغيير لون الزر إلى الأحمر إذا كان المخزون المتبقي صفر
                    if (remainingStock <= 0) {
                        button.style.backgroundColor = "red";
                        button.style.color = "white";
                    }
    
                    button.innerHTML = `<span>${juice.name}</span><br><small>${remainingStock}</small>`;
                    button.onclick = () => addToOrder(juice);
    
                    productList.appendChild(button);
                });
            })
            .catch(error => console.error("❌ خطأ في حساب المخزون المتبقي:", error));
    }
    

    // إضافة العصير إلى الطلب
    function addToOrder(juice) {
        const existingItem = order.find(item => item.id === juice.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            order.push({ ...juice, quantity: 1 });
        }
        totalPrice += juice.price;
        updateOrderSummary();
    }

    // تحديث ملخص الطلب
    function updateOrderSummary() {
        orderSummary.innerHTML = "";
        if (order.length === 0) {
            orderSummary.innerHTML = "<tr><td colspan='3'>لا يوجد منتجات في الطلب.</td></tr>";
            totalAmount.textContent = "0";
            return;
        }

        order.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.quantity * item.price} ريال</td>
            `;
            orderSummary.appendChild(row);
        });

        totalAmount.textContent = `${totalPrice}`;
    }

    // توليد رقم الطلب بناءً على تاريخ اليوم
    function generateOrderId() {
        return new Promise((resolve, reject) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dayFormatted = today.getDate().toString().padStart(2, '0');
            const baseOrderId = `${dayFormatted}100`;
    
            const startOfDay = firebase.firestore.Timestamp.fromDate(today);
    
            db.collection("orders")
                .where("timestamp", ">=", startOfDay)
                .orderBy("timestamp", "desc") // ✅ ترتيب حسب التاريخ فقط لتجنب مشاكل الفهرسة
                .limit(10) // ✅ جلب آخر 10 طلبات فقط لتقليل استهلاك Firestore
                .get()
                .then(snapshot => {
                    let highestOrderId = parseInt(baseOrderId, 10);
    
                    snapshot.forEach(doc => {
                        const lastOrderId = parseInt(doc.data().id, 10);
                        if (!isNaN(lastOrderId) && lastOrderId > highestOrderId) {
                            highestOrderId = lastOrderId;
                        }
                    });
    
                    resolve((highestOrderId + 1).toString()); // ✅ زيادة الرقم بواحد
                })
                .catch(error => {
                    console.error("❌ خطأ في جلب رقم الطلب:", error);
                    reject(error);
                });
        });
    }
    
    
    
    // تحديث رقم الطلب الجديد
    function updateOrderId() {
        generateOrderId().then(orderId => {
            currentOrderId = orderId;
            document.getElementById("order-id").textContent = currentOrderId; // ✅ تحديث رقم الطلب في الصفحة
        });
    }
    

    // إتمام الطلب
    submitOrderButton.onclick = () => {
        if (order.length === 0) {
            alert("❌ لا يمكن تسجيل طلب فارغ! الرجاء إضافة منتجات.");
            return;
        }
    
        console.log("📌 البيانات قبل تسجيل الطلب:", order);
    
        const orderData = {
            id: currentOrderId,
            items: order.map(juice => ({
                juice: { 
                    id: juice.id,
                    name: juice.name,
                    price: juice.price
                },
                quantity: juice.quantity // ✅ إخراج `quantity` خارج `juice` كما في التطبيق
            })),
            timestamp: firebase.firestore.Timestamp.now()
        };
    
        // تسجيل الطلب في Firestore
        db.collection("orders").doc(currentOrderId).set(orderData)
            .then(() => {
                console.log("✅ الطلب تم تسجيله في Firestore:", orderData);
    
                // **🔴 تصفير الطلب**
                order = [];
                totalPrice = 0;
                updateOrderSummary();
    
                // **🔴 تحديث رقم الطلب الجديد**
                updateOrderId();
    
                // **✅ تحديث المنتجات بعد تسجيل الطلب**
                displayProducts(); // ⬅️ هذا هو السطر الذي يضمن تحديث المخزون المتبقي فورًا
            })
            .catch(error => console.error("❌ خطأ في تسجيل الطلب:", error));
    };
    
    
    

    displayProducts();
};



function calculateRemaining() {
    const totalAmount = parseFloat(document.getElementById("totalAmount").textContent) || 0;

    document.getElementById("remainingTo50").textContent = Math.max(50 - totalAmount, 0);
    document.getElementById("remainingTo100").textContent = Math.max(100 - totalAmount, 0);
    document.getElementById("remainingTo150").textContent = Math.max(150 - totalAmount, 0);
}

// 🔹 استدعاء الدالة بعد تحديث الإجمالي تلقائيًا
setInterval(calculateRemaining, 500); // تحديث كل نصف ثانية
