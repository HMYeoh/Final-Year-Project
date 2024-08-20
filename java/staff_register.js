const { timeStamp } = require("console");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChuDGHhWVN-87V5TSVECaEZH3kFgDfV9U",
    authDomain: "final-year-project-8ee8f.firebaseapp.com",
    projectId: "final-year-project-8ee8f",
    storageBucket: "final-year-project-8ee8f.appspot.com",
    messagingSenderId: "132633010499",
    appId: "1:132633010499:web:6584aa651c311ceb968ff6",
    measurementId: "G-GLCG4PNB72"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Handle form submission
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate that password and confirm password match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Create a new user with Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successfully created a user
            const user = userCredential.user;

            // Save additional user data to Firestore under 'staffs' collection
            return db.collection("staffs").doc(user.uid).set({
                username: username,
                email: email,
                timeStamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("Registration successful!");
            // Optionally, redirect to the login page
            window.location.href = "../html/staff_login.html";
        })
        .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                alert("The email address is already in use. Please try with a different email address.");
            } else {
                console.error("Error during registration:", error.message);
                alert("Error registering. Please try again.");
            }
        });
});
