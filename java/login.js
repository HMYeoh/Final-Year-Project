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

// Get the login form element
const loginForm = document.getElementById('login-form');

// Add a submit event listener to the form
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Call the signIn function
    signIn(email, password);
});

// Sign in with email and password
function signIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                // Proceed with successful sign-in
                alert("Sign-in successful!");
                // Redirect to a protected page
                window.location.href = "../html/admin_dashboard.html";
            } else {
                // Inform user to verify their email
                alert("Please verify your email before signing in.");
                firebase.auth().signOut(); // Optional: sign out the user
            }
        })
        .catch((error) => {
            console.error("Error signing in: ", error.message);
            alert("Error signing in. Please try again.");
        });
}

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
