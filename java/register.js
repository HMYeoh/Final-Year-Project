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

// Initialize Firestore
const db = firebase.firestore();

// Get the form element
const registerForm = document.querySelector('form');

// Add a submit event listener to the form
registerForm.addEventListener('submit', function(event) {
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
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successfully created a user
            const user = userCredential.user;

            // Send verification email
            user.sendEmailVerification()
                .then(() => {
                    // Save additional user data to Firestore
                    db.collection("admins").doc(user.uid).set({
                        username: username,
                        email: email
                    })
                    .then(() => {
                        alert("Registration successful! Please verify your email.");
                        // Optionally, redirect to the login page
                        window.location.href = "../html/login.html";
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error.message);
                        alert("Error registering. Please try again.");
                    });
                })
                .catch((error) => {
                    console.error("Error sending email verification: ", error.message);
                    alert("Error sending verification email. Please try again.");
                });
        })
        .catch((error) => {
            console.error("Error creating user: ", error.message);
            alert("Error registering. Please try again.");
        });
});


// Get the theme toggle element
const themeToggle = document.getElementById('theme-toggle');

// Check if the user has a saved preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList.add(currentTheme);

    // Update the emoji based on the current theme
    if (currentTheme === 'dark-mode') {
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
}

// Add event listener to the theme toggle button
themeToggle.addEventListener('click', function() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', '');
    } else {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark-mode');
    }
});
