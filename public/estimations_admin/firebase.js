const firebaseConfig = {
    apiKey: "AIzaSyChv7GrjKKo8Z8qoKySRS-EB5_ewTb0mLg",
    authDomain: "propertymeasure-12320.firebaseapp.com",
    databaseURL: "https://propertymeasure-12320-default-rtdb.firebaseio.com",
    projectId: "propertymeasure-12320",
    storageBucket: "propertymeasure-12320.firebasestorage.app",
    messagingSenderId: "348835277099",
    appId: "1:348835277099:web:96dc4a603e50a6ceabfd6e",
    measurementId: "G-LK15LFXW8C"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
window.apiDb = firebase;