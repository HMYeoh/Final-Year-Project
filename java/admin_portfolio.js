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
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Initialize Firebase Storage

// Load branches dynamically
function loadBranches() {
    const branchDropdown = document.getElementById('branch');
    branchDropdown.innerHTML = '<option value="">Select Branch</option>'; // Clear existing options

    db.collection("branch").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const branchData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id; // Save branch ID
                option.setAttribute('data-name', branchData.name || 'Unnamed Branch');
                option.textContent = branchData.name || 'Unnamed Branch';
                branchDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error loading branches:", error.message);
        });
}

// Open modal and load branches when 'New Portfolio' is clicked
$('#newPortfolioModal').on('shown.bs.modal', loadBranches);

// Handle form submission for creating a new portfolio
document.getElementById('new-portfolio-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const branchDropdown = document.getElementById('branch');
    const branchId = branchDropdown.value;
    const branchName = branchDropdown.options[branchDropdown.selectedIndex].getAttribute('data-name');
    const portfolioName = document.getElementById('branch-name').value;
    const portfolioImage = document.getElementById('portfolioImage').files[0];

    // Validate input
    if (!branchId || !portfolioName || !portfolioImage) {
        alert("Please fill out all fields and select an image.");
        return;
    }

    // Upload image to Firebase Storage
    const storageRef = storage.ref(`portfolio_images/${portfolioImage.name}`);
    storageRef.put(portfolioImage)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then((imageUrl) => {
            // Save portfolio data to Firestore
            return db.collection("portfolio").add({
                branchId: branchId,
                branchName: branchName,
                name: portfolioName,
                imageUrl: imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            $('#newPortfolioModal').modal('hide'); // Close the modal
            document.getElementById('new-portfolio-form').reset(); // Clear form
            alert("Portfolio created successfully!");

            // Refresh portfolio list
            loadPortfolioData();
        })
        .catch((error) => {
            console.error("Error creating portfolio:", error.message);
            alert("Error creating portfolio. Please try again.");
        });
});

// Load portfolio data and display in the table
function loadPortfolioData() {
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = ''; // Clear existing data

    db.collection("portfolio").orderBy("timestamp", "desc").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const portfolioData = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${portfolioData.imageUrl}" alt="Portfolio Image" style="width: 100px; height: 100px;"></td>
                    <td>${portfolioData.branchName}</td>
                    <td>${portfolioData.name}</td>
                    <td>${portfolioData.timestamp ? portfolioData.timestamp.toDate().toLocaleDateString() : ''}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editPortfolio('${doc.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePortfolio('${doc.id}')">Delete</button>
                    </td>
                `;
                portfolioList.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error loading portfolios:", error.message);
        });
}

// Function to delete a portfolio
function deletePortfolio(portfolioId) {
    if (confirm("Are you sure you want to delete this portfolio?")) {
        db.collection("portfolio").doc(portfolioId).delete()
            .then(() => {
                alert("Portfolio deleted successfully!");
                loadPortfolioData(); // Refresh the list
            })
            .catch((error) => {
                console.error("Error deleting portfolio:", error.message);
                alert("Error deleting portfolio. Please try again.");
            });
    }
}

// Function to open the edit modal and populate it with the portfolio data
function editPortfolio(portfolioId) {
    // Open the modal
    $('#editPortfolioModal').modal('show');

    // Load the branches for the edit form dropdown
    loadBranchesIntoEditForm();

    // Fetch the portfolio data from Firestore
    db.collection("portfolio").doc(portfolioId).get()
        .then((doc) => {
            if (doc.exists) {
                const portfolioData = doc.data();

                // Populate the modal fields with the portfolio data
                document.getElementById('edit-branch-id').value = portfolioId; 
                document.getElementById('edit-portfolio-name').value = portfolioData.name;
                document.getElementById('edit-branch').value = portfolioData.branchId; 

                // Optional: You can show the current image preview
                document.getElementById('editPortfolioImagePreview').src = portfolioData.imageUrl || '';

            } else {
                console.error("Portfolio not found!");
            }
        })
        .catch((error) => {
            console.error("Error fetching portfolio:", error.message);
        });
}

// Load branches into the 'edit-branch' dropdown (similar to new portfolio form)
function loadBranchesIntoEditForm() {
    const branchDropdown = document.getElementById('edit-branch');
    branchDropdown.innerHTML = '<option value="">Select Branch</option>'; // Clear existing options

    db.collection("branch").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const branchData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = branchData.name || 'Unnamed Branch';
                branchDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error loading branches:", error.message);
        });
}

// Handle the form submission for editing the portfolio
document.getElementById('edit-portfolio-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const portfolioId = document.getElementById('edit-branch-id').value;
    const branchDropdown = document.getElementById('edit-branch');
    const branchId = branchDropdown.value;
    const branchName = branchDropdown.options[branchDropdown.selectedIndex].text;
    const portfolioName = document.getElementById('edit-portfolio-name').value;
    const portfolioImage = document.getElementById('editPortfolioImage').files[0];

    // Update Firestore document
    const portfolioRef = db.collection("portfolio").doc(portfolioId);

    // If a new image is uploaded, update it in Firebase Storage
    if (portfolioImage) {
        const storageRef = storage.ref(`portfolio_images/${portfolioImage.name}`);
        storageRef.put(portfolioImage)
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((imageUrl) => {
                return portfolioRef.update({
                    branchId: branchId,
                    branchName: branchName,
                    name: portfolioName,
                    imageUrl: imageUrl
                });
            })
            .then(() => {
                alert("Portfolio updated successfully!");
                $('#editPortfolioModal').modal('hide');
                loadPortfolioData(); // Refresh portfolio list
            })
            .catch((error) => {
                console.error("Error updating portfolio with image:", error.message);
            });
    } else {
        // If no new image is uploaded, only update the text fields
        portfolioRef.update({
            branchId: branchId,
            branchName: branchName,
            name: portfolioName
        })
        .then(() => {
            alert("Portfolio updated successfully!");
            $('#editPortfolioModal').modal('hide');
            loadPortfolioData(); // Refresh portfolio list
        })
        .catch((error) => {
            console.error("Error updating portfolio:", error.message);
        });
    }
});


// Initial load of portfolios on page load
loadPortfolioData();

