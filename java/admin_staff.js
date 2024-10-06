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

// Initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();

// Load Branches Dynamically for the Branch Selection
function loadBranches() {
    const branchDropdown = document.getElementById('branch');
    branchDropdown.innerHTML = `<option value="">Select Branch</option>`; // Clear existing options

    db.collection("branch").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const branchData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id; // Save the branch ID in value
                option.setAttribute('data-name', branchData.name || 'Unnamed Branch'); // Save the branch name
                option.textContent = branchData.name || 'Unnamed Branch';
                branchDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error loading branches:", error.message);
        });
}


// Call the function to load branches when the modal is shown
$('#newStaffModal').on('shown.bs.modal', loadBranches);

// Load Staff Data on Page Load
loadStaffData();

// Handle form submission for creating a new staff
document.getElementById('new-staff-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form values
    const username = document.getElementById('staff-username').value;
    const email = document.getElementById('staff-email').value;
    const password = document.getElementById('staff-password').value;
    const branchDropdown = document.getElementById('branch');
    const branchId = branchDropdown.value; // Get selected branch ID
    const branchName = branchDropdown.options[branchDropdown.selectedIndex].getAttribute('data-name'); // Get the branch name

    // Validate if branch is selected
    if (!branchId) {
        alert("Please select a branch.");
        return;
    }

    // Create a new staff account in Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Save additional staff data to Firestore with branch name
            return db.collection("staffs").doc(user.uid).set({
                username: username,
                email: email,
                branchName: branchName, // Save the branch name in Firestore
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Close the modal
            $('#newStaffModal').modal('hide');

            // Optionally, reset the form fields
            document.getElementById('new-staff-form').reset();

            // Show a success message
            alert("Staff created successfully!");

            // Refresh the staff list
            loadStaffData();
        })
        .catch((error) => {
            console.error("Error creating staff:", error.message);
            alert("Error creating staff. Please try again.");
        });
});


// Open the Edit Modal and Load Staff Data
function editStaff(staffId) {
    // Fetch the staff data
    db.collection("staffs").doc(staffId).get()
        .then((doc) => {
            if (doc.exists) {
                const staffData = doc.data();

                // Set the form values for the staff
                document.getElementById('edit-staff-id').value = staffId;
                document.getElementById('edit-staff-username').value = staffData.username || '';
                document.getElementById('edit-staff-email').value = staffData.email || '';

                // Load branches dynamically for the edit form
                const branchDropdown = document.getElementById('edit-branch');
                branchDropdown.innerHTML = `<option value="">Select Branch</option>`; // Clear existing options

                db.collection("branch").get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((branchDoc) => {
                            const branchData = branchDoc.data();
                            const option = document.createElement('option');
                            option.value = branchData.name; // Use branch name as the value
                            option.textContent = branchData.name || 'Unnamed Branch';

                            // Preselect the staff's current branch
                            if (staffData.branchName === branchData.name) {
                                option.selected = true;
                            }

                            branchDropdown.appendChild(option);
                        });
                    })
                    .catch((error) => {
                        console.error("Error loading branches:", error.message);
                    });

                // Show the edit modal
                $('#editStaffModal').modal('show');
            } else {
                alert("Staff not found!");
            }
        })
        .catch((error) => {
            console.error("Error fetching staff data:", error.message);
            alert("Error fetching staff data. Please try again.");
        });
}



// Function to load staff data from Firestore
function loadStaffData() {
    const staffList = document.getElementById('staff-list');
    staffList.innerHTML = ''; // Clear existing data

    db.collection("staffs").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const staffData = doc.data();
                const timestamp = staffData.timestamp ? staffData.timestamp.toDate() : new Date();
                const row = `<tr>
                    <td>${staffData.username || 'N/A'}</td>
                    <td>${staffData.email || 'N/A'}</td>
                    <td>${timestamp.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editStaff('${doc.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteStaff('${doc.id}')">Delete</button>
                    </td>
                </tr>`;
                staffList.innerHTML += row;
            });
        })
        .catch((error) => {
            console.error("Error fetching staff data:", error.message);
        });
}

// Handle form submission for editing staff
document.getElementById('edit-staff-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form values
    const staffId = document.getElementById('edit-staff-id').value;
    const username = document.getElementById('edit-staff-username').value;
    const email = document.getElementById('edit-staff-email').value;
    const password = document.getElementById('edit-staff-password').value; // Assuming you want to allow password changes
    const branchName = document.getElementById('edit-branch').value; // Get selected branch name

    // Validate if branch is selected
    if (!branchName) {
        alert("Please select a branch.");
        return;
    }

    // Update staff data in Firestore
    db.collection("staffs").doc(staffId).update({
        username: username,
        email: email,
        branchName: branchName, // Update the branch name in Firestore
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Update timestamp
    })
    .then(() => {
        if (password) {
            // Update the staff's password directly
            return auth.currentUser.updatePassword(password)
                .then(() => {
                    alert("Password updated successfully!");
                }).catch(error => {
                    console.error("Error updating password:", error.message);
                    alert("Error updating password. Please try again.");
                });
        }
    })
    .then(() => {
        // Close the modal
        $('#editStaffModal').modal('hide');

        // Show a success message
        alert("Staff updated successfully!");

        // Refresh the staff list
        loadStaffData();
    })
    .catch((error) => {
        console.error("Error updating staff:", error.message);
        alert("Error updating staff. Please try again.");
    });
});



// Function to delete staff
function deleteStaff(staffId) {
    if (confirm("Are you sure you want to delete this staff?")) {
        db.collection("staffs").doc(staffId).delete()
            .then(() => {
                alert("Staff deleted successfully!");
                loadStaffData(); // Refresh the staff list
            })
            .catch((error) => {
                console.error("Error deleting staff:", error.message);
                alert("Error deleting staff. Please try again.");
            });
    }
}


