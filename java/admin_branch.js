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

// Function to create a new branch
const createBranch = (branchNo, branchName) => {
    db.collection("branch").add({
        branch: branchNo,
        name: branchName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Add timestamp for branch creation
    })
    .then(() => {
        console.log("Branch added successfully!");
        // Optionally, clear the form fields
        document.getElementById('branch-no').value = '';
        document.getElementById('branch-name').value = '';
        // Close the modal
        $('#newBranchModal').modal('hide');
        // Refresh the branch list
        fetchBranchList();
    })
    .catch((error) => {
        console.error("Error adding branch: ", error);
    });
};

// Add event listener for the form submission
document.getElementById('new-branch-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from submitting the default way
    const branchNo = document.getElementById('branch-no').value;
    const branchName = document.getElementById('branch-name').value;
    if (branchNo && branchName) {
        createBranch(branchNo, branchName);
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to fetch and display the branch list
const fetchBranchList = () => {
    const branchList = document.getElementById('branch-list');
    branchList.innerHTML = ''; // Clear the list before adding new data

    db.collection("branch").orderBy('createdAt', 'desc').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const branchData = doc.data();
            const row = `
                <tr>
                    <td>${branchData.branch}</td>
                    <td>${branchData.name}</td>
                    <td>${branchData.createdAt ? branchData.createdAt.toDate().toLocaleString() : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editBranch('${doc.id}', '${branchData.branch}', '${branchData.name}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBranch('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
            branchList.insertAdjacentHTML('beforeend', row);
        });
    }).catch((error) => {
        console.error("Error fetching branches: ", error);
    });
};

// Function to open the Edit Branch Modal with existing data
const editBranch = (branchId, branchNo, branchName) => {
    // Set the current branch data in the form fields
    document.getElementById('edit-branch-id').value = branchId;
    document.getElementById('edit-branch-no').value = branchNo;
    document.getElementById('edit-branch-name').value = branchName;
    
    // Open the Edit Branch Modal
    $('#editBranchModal').modal('show');
};

// Function to update the branch details in Firestore
const updateBranch = (branchId, updatedBranchNo, updatedBranchName) => {
    db.collection("branch").doc(branchId).update({
        branch: updatedBranchNo,
        name: updatedBranchName,
    })
    .then(() => {
        console.log("Branch updated successfully!");
        // Close the modal
        $('#editBranchModal').modal('hide');
        // Refresh the branch list
        fetchBranchList();
    })
    .catch((error) => {
        console.error("Error updating branch: ", error);
    });
};

// Add event listener for the Edit Branch form submission
document.getElementById('edit-branch-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from submitting the default way
    
    // Get the updated values from the form
    const branchId = document.getElementById('edit-branch-id').value;
    const updatedBranchNo = document.getElementById('edit-branch-no').value;
    const updatedBranchName = document.getElementById('edit-branch-name').value;

    // Call the update function if both fields have values
    if (updatedBranchNo && updatedBranchName) {
        updateBranch(branchId, updatedBranchNo, updatedBranchName);
    } else {
        alert("Please fill in all fields.");
    }
});

// Function to delete a branch from Firestore
const deleteBranch = (branchId) => {
    if (confirm("Are you sure you want to delete this branch?")) {
        db.collection("branch").doc(branchId).delete()
        .then(() => {
            console.log("Branch deleted successfully!");
            // Refresh the branch list after deletion
            fetchBranchList();
        })
        .catch((error) => {
            console.error("Error deleting branch: ", error);
        });
    }
};



// Fetch branch list on page load
document.addEventListener('DOMContentLoaded', fetchBranchList);
