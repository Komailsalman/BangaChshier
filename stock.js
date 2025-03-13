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
    const stockList = document.getElementById("stock-list");

    // قائمة العصيرات المتاحة
    const juices = {
        "1": "عرايسي",
        "2": "عوار قلب",
        "3": "منقا أفوكادو",
        "4": "فبراير",
        "5": "شمندر رمان",
        "6": "ليمون نعناع",
        "7": "نعنشة",
        "8": "رمان",
        "9": "برتقال",
        "10": "رمان ليمون نعناع"
    };

    // الحصول على تاريخ اليوم
    const today = new Date().getDate().toString().padStart(2, '0'); // استخراج رقم اليوم

    function loadStock() {
        db.collection("stock").doc(today).get().then(doc => {
            let stockData = {}; // تعريف المخزون ككائن فارغ

            if (doc.exists) {
                stockData = doc.data().stockData || {}; // جلب البيانات إذا كانت موجودة
            }

            stockList.innerHTML = ""; // تفريغ الجدول قبل التحديث

            // عرض جميع العصائر حتى لو لا يوجد لها مخزون
            Object.keys(juices).forEach(productId => {
                const productName = juices[productId];
                const quantity = stockData[productId] !== undefined ? stockData[productId] : 0; // تعيين المخزون إلى 0 إذا لم يكن مسجلاً

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${productName}</td>
                    <td><input type="number" id="stock-${productId}" value="${quantity}" min="0"></td>
                    <td><button onclick="updateStock('${productId}')">تحديث</button></td>
                `;
                stockList.appendChild(row);
            });
        }).catch(error => {
            console.error("Error loading stock:", error);
        });
    }

    window.updateStock = function (productId) {
        const newQuantity = document.getElementById(`stock-${productId}`).value;
        
        db.collection("stock").doc(today).set({
            stockData: {
                [productId]: parseInt(newQuantity)
            }
        }, { merge: true }) // دمج التحديث مع البيانات السابقة دون مسحها
        .then(() => alert("تم تحديث المخزون بنجاح!"))
        .catch(error => console.error("Error updating stock:", error));
    };

    loadStock();
});
