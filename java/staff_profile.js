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
const db = firebase.firestore();

// Fetch and display staff profile information
function loadStaffProfile() {
    const user = auth.currentUser;

    if (user) {
        const staffId = user.uid;
        
        db.collection('staffs').doc(staffId).get().then((doc) => {
            if (doc.exists) {
                const staffData = doc.data();
                document.getElementById('staffName').value = staffData.username || '';
                document.getElementById('staffEmail').value = staffData.email || '';
                document.getElementById('staffPhone').value = staffData.phone || ''; // Load the phone number
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.error("Error fetching document:", error);
        });
    } else {
        console.error("No user is currently logged in.");
        window.location.href = "../html/staff_login.html";
    }
}

// Save the updated profile information
document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const user = auth.currentUser;

    if (user) {
        const staffId = user.uid;
        const staffName = document.getElementById('staffName').value;
        const staffEmail = document.getElementById('staffEmail').value;
        const staffPhone = document.getElementById('staffPhone').value; // Get the phone number

        // Update the staff document in Firestore
        db.collection('staffs').doc(staffId).update({
            username: staffName,
            email: staffEmail,
            phone: staffPhone // Update the phone number
        })
        .then(() => {
            alert("Profile updated successfully!");
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
        });
    } else {
        console.error("No user is currently logged in.");
        window.location.href = "../html/staff_login.html";
    }
});

// Wait for the Firebase auth state to be ready
auth.onAuthStateChanged((user) => {
    if (user) {
        loadStaffProfile();
    } else {
        console.error("No user is currently logged in.");
        window.location.href = "../html/staff_login.html";
    }
});
