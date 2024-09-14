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

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = firebase.storage();

// Function to fetch and display services
function fetchAndDisplayServices(searchQuery = '') {
    const serviceList = document.getElementById('serviceList');

    // Clear any existing rows
    serviceList.innerHTML = '';

    // Fetch services from Firestore
    db.collection('services').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const service = doc.data();

                // Check if the service name matches the search query (case-insensitive)
                if (service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    // Create table row for each service
                    const row = `
                        <tr>
                            <td><img src="${service.serviceImageURL}" alt="${service.serviceName}" style="width: 100px; height: 100px;"></td>
                            <td>${service.serviceName}</td>
                            <td>${service.gender}</td>
                            <td>${service.servicePrice}</td>
                            <td>${service.estimatedTime}</td>
                            <td>${service.serviceCategories}</td>
                            <td>${service.serviceDetails}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editService('${doc.id}')">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteService('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                    // Append the row to the serviceList table body
                    serviceList.innerHTML += row;
                }
            });
        })
        .catch((error) => {
            console.error('Error fetching services: ', error);
        });
}

// Fetch services when the page loads
window.onload = function() {
    fetchAndDisplayServices();
}

// Function to handle service deletion
function deleteService(serviceId) {
    if (confirm('Are you sure you want to delete this service?')) {
        db.collection('services').doc(serviceId).delete()
            .then(() => {
                alert('Service deleted successfully!');
                fetchAndDisplayServices(); // Refresh the table
            })
            .catch((error) => {
                console.error('Error deleting service: ', error);
            });
    }
}

function editService(serviceId) {
    // Fetch the current service data from Firestore
    db.collection('services').doc(serviceId).get()
        .then((doc) => {
            if (doc.exists) {
                const service = doc.data();
                
                // Set current data into the modal form fields
                document.getElementById('editServiceId').value = serviceId;
                document.getElementById('editServiceName').value = service.serviceName;
                document.getElementById('editGender').value = service.gender;
                document.getElementById('editServicePrice').value = service.servicePrice;
                document.getElementById('editEstimatedTime').value = service.estimatedTime;
                document.getElementById('editServiceCategories').value = service.serviceCategories;
                document.getElementById('editServiceDetails').value = service.serviceDetails;
                
                // Show the modal
                $('#editServiceModal').modal('show');
            }
        })
        .catch((error) => {
            console.error('Error fetching service: ', error);
        });
}

function updateService() {
    // Get the updated values from the modal form
    const serviceId = document.getElementById('editServiceId').value;
    const serviceName = document.getElementById('editServiceName').value.trim();
    const gender = document.getElementById('editGender').value.trim();
    const servicePrice = document.getElementById('editServicePrice').value.trim();
    const estimatedTime = document.getElementById('editEstimatedTime').value.trim();
    const serviceCategories = document.getElementById('editServiceCategories').value.trim();
    const serviceDetails = document.getElementById('editServiceDetails').value.trim();
    const serviceImage = document.getElementById('editServiceImage').files[0];  // Optional new image
    
    let updateData = {
        serviceName: serviceName,
        gender: gender,
        servicePrice: servicePrice,
        estimatedTime: estimatedTime,
        serviceCategories: serviceCategories,
        serviceDetails: serviceDetails
    };

    // If a new image is uploaded, handle image update
    if (serviceImage) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child('service_images/' + serviceImage.name);
        
        imageRef.put(serviceImage)
            .then((snapshot) => {
                return snapshot.ref.getDownloadURL();
            })
            .then((downloadURL) => {
                updateData.serviceImageURL = downloadURL; // Add new image URL to the update data
                return db.collection('services').doc(serviceId).update(updateData);
            })
            .then(() => {
                alert('Service updated successfully!');
                $('#editServiceModal').modal('hide');
                fetchAndDisplayServices(); // Refresh the table
            })
            .catch((error) => {
                console.error('Error updating service: ', error);
            });
    } else {
        // Update without image change
        db.collection('services').doc(serviceId).update(updateData)
            .then(() => {
                alert('Service updated successfully!');
                $('#editServiceModal').modal('hide');
                fetchAndDisplayServices(); // Refresh the table
            })
            .catch((error) => {
                console.error('Error updating service: ', error);
            });
    }
}

// Function to handle form submission
document.getElementById('addServiceForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    
    // Get form values
    const serviceName = document.getElementById('serviceName').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const servicePrice = document.getElementById('servicePrice').value.trim();
    const estimatedTime = document.getElementById('estimatedTime').value.trim();
    const serviceCategories = document.getElementById('serviceCategories').value.trim();
    const serviceDetails = document.getElementById('serviceDetails').value.trim();
    const serviceImage = document.getElementById('serviceImage').files[0];

    // Check if an image is selected
    if (!serviceImage) {
        alert('Please select an image file.');
        return;
    }

    // Upload image to Firebase Storage
    const storageRef = storage.ref();
    const imageRef = storageRef.child('service_images/' + serviceImage.name);
    imageRef.put(serviceImage)
        .then((snapshot) => {
            console.log('Image uploaded successfully');
            // Get the download URL for the image
            return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
            // Save item details and image URL to Firestore
            return db.collection('services').add({
                serviceName: serviceName,
                gender: gender,
                servicePrice: servicePrice,
                estimatedTime: estimatedTime,
                serviceCategories: serviceCategories,
                serviceImageURL: downloadURL,
                serviceDetails: serviceDetails
            });
        })
        .then((docRef) => {
            // Get the auto-generated ID from the added document
            const serviceId = docRef.id;
            // Save the generated ID inside Firestore as a field
            return docRef.update({
                serviceId: serviceId
            });
        })
        .then(() => {
            // Reset form after successful submission
            document.getElementById('addServiceForm').reset();
            alert('Service added successfully!');
        })
        .catch((error) => {
            console.error('Error uploading image:', error);
            alert('Failed to add item. Please try again later.');
        });
});

// Function to search services
function searchService() {
    const searchInput = document.getElementById('searchInput').value.trim();
    fetchAndDisplayServices(searchInput);
}


