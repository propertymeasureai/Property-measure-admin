document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        firebase.auth().signInWithEmailAndPassword(email, password).then((_data) => {
            console.log(_data)
        }).catch((err) => {
            alert(err.message)
        })
    });
});

// firebase.auth().onAuthStateChanged((user) => {
//     if (user) {

//         window.location.assign("projectselection.html")



//     }
//     else {
//     }
// })



firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("testing user", user);
        try {

            let databaseRef = firebase.database().ref("admins");
            databaseRef.once('value')
                .then(function (snapshot) {
                    const data = snapshot.val();
                    if (!data) {
                        alert("You Are Not Authorized to this page");
                        hideLoader();
                        firebase.auth().signOut();
                        window.location.assign('index.html');
                        return;
                    }
                    const keys = Object.keys(data);
                    const condition = keys.includes(user.uid);
                    console.log(condition)
                    if (condition) {
                        window.location.assign("projectselection.html")
                    } else {
                        alert("Please login via Admin Credentials!");
                        alert("You Are Not Authorized to this page");
                        firebase.auth().signOut();
                        window.location.assign('index.html');
                    }
                })
                .catch(function (error) {
                    if (error && error.code === "PERMISSION_DENIED") {
                        alert("You Are Not Authorized to this page");
                        firebase.auth().signOut();
                        window.location.assign('index.html');
                    } else {
                        console.error("Error fetching admin data:", error);
                        alert("An error occurred or while verifying admin credentials. Please try again.");
                        firebase.auth().signOut();
                    }
                });
        }
        catch (error) {
            console.error("Error fetching admin data:", error);
            alert("An error occurred or while verifying admin credentials. Please try again.");
            hideLoader();
            firebase.auth().signOut();
        }
    } else {
    }
});
