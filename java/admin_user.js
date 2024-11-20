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
const storage = firebase.storage(); // Initialize Firebase Storage

// Handle form submission
document.getElementById('new-user-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting in the traditional way

    // Get input values
    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const userPhone = document.getElementById('user-phone').value;
    const userPassword = document.getElementById('user-password').value;

    // Create new user in Firebase Authentication
    auth.createUserWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
            const userId = userCredential.user.uid;

            // Save user details in Firestore
            db.collection('users').doc(userId).set({
                name: userName,
                email: userEmail,
                phone: userPhone
            })
            .then(() => {
                // Show a success message
                console.log('User added to Firestore');
                // Clear the form
                document.getElementById('new-user-form').reset();
                // Close the modal
                $('#newUserModal').modal('hide');
                alert("User created successfully!");
            })
            .catch((error) => {
                console.error('Error adding user to Firestore: ', error);
            });
        })
        .catch((error) => {
            console.error('Error creating user in Firebase Auth: ', error);
        });
});

// Fetch and display users in the table
function loadUsers() {
    db.collection('users').onSnapshot((snapshot) => {
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear the existing user list

        snapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;

            // Create a new row for each user
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${userData.name}</td>
                <td>${userData.email}</td>
                <td>${userData.phone}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-user" data-id="${userId}" data-toggle="modal" data-target="#editUserModal">Edit</button>
                    <button class="btn btn-danger btn-sm delete-user" data-id="${userId}">Delete</button>
                </td>
            `;

            // Append the new row to the user list
            userList.appendChild(tr);

            // Add event listeners for edit and delete buttons
            tr.querySelector('.edit-user').addEventListener('click', () => editUser(userId));
            tr.querySelector('.delete-user').addEventListener('click', () => deleteUser(userId));
        });
    }, (error) => {
        console.error('Error fetching users:', error);
    });
}

// Edit user function (opens the modal and populates the form with user data)
function editUser(userId) {
    db.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('edit-user-id').value = userId;
            document.getElementById('edit-user-name').value = userData.name;
            document.getElementById('edit-user-email').value = userData.email;
            document.getElementById('edit-user-phone').value = userData.phone;
            // Leave password blank unless the user wants to update it
        }
    }).catch((error) => {
        console.error('Error fetching user for edit:', error);
    });
}

// Handle form submission for editing user
document.getElementById('edit-user-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('edit-user-id').value;
    const userName = document.getElementById('edit-user-name').value;
    const userEmail = document.getElementById('edit-user-email').value;
    const userPhone = document.getElementById('edit-user-phone').value;
    const userPassword = document.getElementById('edit-user-password').value;

    const userData = {
        name: userName,
        email: userEmail,
        phone: userPhone
    };

    if (userPassword !== '') {
        auth.currentUser.updatePassword(userPassword).catch((error) => {
            console.error('Error updating password:', error);
        });
    }

    db.collection('users').doc(userId).update(userData).then(() => {
        alert('User updated successfully!');
        $('#editUserModal').modal('hide');
    }).catch((error) => {
        console.error('Error updating user:', error);
    });
});

// Delete user function
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        db.collection('users').doc(userId).delete().then(() => {
            alert('User deleted successfully!');
        }).catch((error) => {
            console.error('Error deleting user:', error);
        });
    }
}

// Load users when the page loads
window.onload = function() {
    loadUsers();
};
