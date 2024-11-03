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

// Function to fetch and display contact list
function displayContactList() {
    const contactList = document.getElementById("contact-list");

    db.collection("contact").orderBy("createdAt", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const contact = doc.data();
            const createdAt = contact.createdAt ? contact.createdAt.toDate().toLocaleString() : "N/A";
            const status = contact.replyMessage ? "Replied" : "Awaiting"; // Determine status

            const row = 
                `<tr>
                    <td>${contact.Username}</td>
                    <td>${contact.Subject}</td>
                    <td>${contact.userId}</td>
                    <td>${createdAt}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-info view-btn" data-id="${doc.id}">View</button>
                    </td>
                </tr>`;
            contactList.innerHTML += row;
        });

        // Add event listeners to "View" buttons
        const viewButtons = document.querySelectorAll(".view-btn");
        viewButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const contactId = this.getAttribute("data-id");
                viewContactDetails(contactId);
            });
        });
    }).catch((error) => {
        console.error("Error fetching contacts: ", error);
    });
}

// Function to display contact details in the modal
function viewContactDetails(contactId) {
    db.collection("contact").doc(contactId).get().then((doc) => {
        if (doc.exists) {
            const contact = doc.data();
            const createdAt = contact.createdAt ? contact.createdAt.toDate().toLocaleString() : "N/A";

            // Populate the modal with contact details
            document.getElementById("modal-username").innerText = contact.Username;
            document.getElementById("modal-userId").innerText = contact.userId;
            document.getElementById("modal-subject").innerText = contact.Subject;
            document.getElementById("modal-message").innerText = contact.Message;
            document.getElementById("modal-createdAt").innerText = createdAt;

            // Set the reply textarea value to the existing reply (if any)
            const replyMessageTextarea = document.getElementById("replyMessage");
            replyMessageTextarea.value = contact.replyMessage || ""; // Keep the reply if exists

            // Set the reply button to save the reply
            const replyButton = document.getElementById("replyButton");
            replyButton.onclick = function () {
                const replyMessage = replyMessageTextarea.value;
                const userId = contact.userId; 
                const username = contact.Username; 
                const subject = contact.Subject; 
                const originalMessage = contact.Message; 
                const replyCreatedAt = new Date(); 
            
                // Save the reply along with the original message to Firestore inbox collection
                db.collection("inbox").add({
                    userId: userId,
                    Username: username,
                    Subject: `Re: ${subject}`,
                    originalMessage: originalMessage, 
                    Message: replyMessage,
                    createdAt: replyCreatedAt
                }).then(() => {
                    // Update the original contact status to "Replied"
                    return db.collection("contact").doc(contactId).update({
                        replyMessage: replyMessage, 
                        status: "Replied" 
                    });
                }).then(() => {
                    alert("Reply sent successfully!");
                    $('#viewMessageModal').modal('hide'); 
                    replyMessageTextarea.value = ""; 
                    location.reload();
                }).catch((error) => {
                    console.error("Error sending reply: ", error);
                });
            };

            // Set the delete button functionality
            const deleteButton = document.getElementById("deleteButton");
            deleteButton.onclick = function () {
                if (confirm("Are you sure you want to delete this message?")) {
                    db.collection("contact").doc(contactId).delete().then(() => {
                        alert("Message deleted successfully!");
                        $('#viewMessageModal').modal('hide'); 
                        location.reload(); 
                    }).catch((error) => {
                        console.error("Error deleting message: ", error);
                    });
                }
            };

            // Show the modal
            $('#viewMessageModal').modal('show');
        } else {
            console.log("No such contact!");
        }
    }).catch((error) => {
        console.error("Error fetching contact details: ", error);
    });
}


// Fetch contact list on page load
document.addEventListener("DOMContentLoaded", displayContactList);
