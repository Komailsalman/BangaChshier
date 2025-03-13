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
    const reportList = document.getElementById("report-list");

    // تحديد تاريخ اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ضبط الساعة إلى بداية اليوم
    const startOfToday = firebase.firestore.Timestamp.fromDate(today);
    const stockDocId = today.getDate().toString().padStart(2, '0'); // ✅ تصحيح المشكلة

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

    function generateReport() {
        let salesData = {};
    
        // تجهيز بيانات جميع العصائر مسبقًا
        Object.keys(juices).forEach(id => {
            salesData[id] = { name: juices[id], sold: 0, stock: 0, remainingStock: 0 };
        });

        // جلب بيانات المبيعات من الطلبات
        db.collection("orders").where("timestamp", ">=", startOfToday).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log("📌 طلب موجود في Firestore:", doc.data());
        
                doc.data().items.forEach(item => {
                    console.log("📌 المنتج في الطلب:", item);
                
                    const juiceData = item.juice;
                    if (juiceData && juiceData.id) {
                        const id = juiceData.id;
                
                        if (!salesData[id]) {
                            salesData[id] = { name: juiceData.name, sold: 0, stock: 0, remainingStock: 0 };
                        }
                
                        // ✅ التحقق من مكان `quantity`
                        let quantity = item.quantity || juiceData.quantity || 0;
                        salesData[id].sold += parseInt(quantity, 10);
                    }
                });
                
            });

            return db.collection("stock").doc(stockDocId).get();
        })
        .then(stockDoc => {
            if (stockDoc.exists) {
                console.log("📌 بيانات المخزون اليومي:", stockDoc.data());

                const stockData = stockDoc.data().stockData || {};
                console.log("📌 بيانات التقرير المخزنة في Firestore:", salesData);

                Object.keys(salesData).forEach(id => {
                    salesData[id].stock = stockData[id] || 0; // ✅ إذا لم يكن هناك مخزون، الافتراضي 0
                    salesData[id].remainingStock = salesData[id].stock - salesData[id].sold; // ✅ حساب المخزون المتبقي
                });
            } else {
                console.warn("⚠️ لا يوجد بيانات مخزون لهذا اليوم.");
            }

            updateReportTable(salesData);
        })
        .catch(error => {
            console.error("❌ خطأ في جلب البيانات:", error);
        });
    }

    // ✅ تحديث جدول التقرير
    function updateReportTable(salesData) {
        let totalSold = 0;
        let totalRemaining = 0;

        reportList.innerHTML = Object.values(salesData).map(data => {
            totalSold += data.sold;
            totalRemaining += data.remainingStock;

            return `
                <tr>
                    <td>${data.name}</td>
                    <td>${data.sold}</td>
                    <td class="${data.remainingStock === 0 ? 'low-stock' : ''}">${data.remainingStock}</td>
                </tr>
            `;
        }).join("");

        document.getElementById("total-sold").textContent = totalSold;
        document.getElementById("total-remaining").textContent = totalRemaining;
    }

    generateReport();
});
