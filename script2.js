// ✅ إعداد Firebase
const firebaseConfig = {
   apiKey: "AIzaSyAa73jLIP7-QTS0hEKCTf47VhHbaA-8vDk",
  authDomain: "banga-ramadan.firebaseapp.com",
  projectId: "banga-ramadan",
  storageBucket: "banga-ramadan.firebasestorage.app",
  messagingSenderId: "136206548099",
  appId: "1:136206548099:web:5658f81818aad77d996fb6",
  measurementId: "G-B2D83V2T4D"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ إضافة طلب عصير إلى Firestore
function addJuice(juiceName) {
    const todayDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const docRef = db.collection("web_orders").doc(todayDate);

    docRef.get().then((doc) => {
        if (doc.exists) {
            docRef.update({
                [juiceName]: firebase.firestore.FieldValue.increment(1)
            });
        } else {
            let data = {};
            data[juiceName] = 1;
            docRef.set(data);
        }
    });
}

// ✅ تحميل الطلبات من Firestore
function loadJuices() {
    const juiceList = document.getElementById("juice-list");

    db.collection("web_orders").onSnapshot((snapshot) => {
        juiceList.innerHTML = "";
        snapshot.forEach((doc) => {
            const date = doc.id;
            const juices = doc.data();
            let listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${date}:</strong> ${JSON.stringify(juices)}`;
            juiceList.appendChild(listItem);
        });
    });
}

// تحميل البيانات عند فتح الصفحة
window.onload = loadJuices;
