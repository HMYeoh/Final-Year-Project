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

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle form submission for login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Sign in the user with Firebase Authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successfully signed in
            const user = userCredential.user;

            // Redirect to the staff dashboard
            window.location.href = "../html/staff_dashboard.html";
        })
        .catch((error) => {
            // Handle errors here
            console.error("Error during login:", error.message);
            if (error.code === 'auth/wrong-password') {
                alert("Incorrect password. Please try again.");
            } else if (error.code === 'auth/user-not-found') {
                alert("No user found with this email. Please check your email or sign up.");
            } else {
                alert("Error logging in. Please try again.");
            }
        });
});
