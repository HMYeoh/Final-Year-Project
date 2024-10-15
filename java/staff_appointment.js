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

// Helper function to convert yyyy-mm-dd to dd/mm/yyyy
function convertDateToFirestoreFormat(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`; // Convert to dd/mm/yyyy without leading zeros
}

// Function to fetch current staff details
async function getCurrentStaffName() {
    const user = auth.currentUser;
    if (user) {
        console.log("User is authenticated:", user.uid); // Log user ID
        const staffRef = db.collection("staffs").doc(user.uid);
        const staffDoc = await staffRef.get();
        if (staffDoc.exists) {
            console.log("Staff document found:", staffDoc.data());
            return staffDoc.data().username; // Assumed field 'username' for stylistName
        } else {
            console.log("No staff document found for this user.");
        }
    } else {
        console.log("No authenticated user.");
    }
    return null;
}

async function loadAppointments(date, stylistName) {
    const appointmentsList = document.getElementById("appointments-list");
    appointmentsList.innerHTML = ''; // Clear previous appointments
    const selectedDate = document.getElementById("selected-date");
    selectedDate.textContent = date;

    // Convert the date to Firestore format (dd/mm/yyyy)
    const formattedDate = convertDateToFirestoreFormat(date);
    console.log("Fetching appointments for formatted date:", formattedDate, "and stylistName:", stylistName);

    const appointmentsSnapshot = await db.collection("reservations")
        .where("date", "==", formattedDate)
        .where("stylistName", "==", stylistName)
        .get();

    console.log("Appointments Snapshot:", appointmentsSnapshot);

    let appointments = []; // Array to hold appointment data

    if (!appointmentsSnapshot.empty) {
        appointmentsSnapshot.forEach(doc => {
            const data = doc.data();
            appointments.push(data); // Push appointment data to array
        });

        // Sort appointments based on the timeSlot field (assuming it's in "9:00 AM - 10:00 AM" format)
        appointments.sort((a, b) => {
            const timeA = parseTime(a.timeSlot.split(" - ")[0]); // Parse start time of a
            const timeB = parseTime(b.timeSlot.split(" - ")[0]); // Parse start time of b
            return timeA - timeB; // Sort in ascending order
        });

        // Display sorted appointments
        appointments.forEach(data => {
            console.log("Sorted Appointment:", data);
            
            // Create a list item
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            
            // Create a div to hold the appointment details
            const appointmentDetails = document.createElement("div");
            
            // Create text nodes for each part
            const customerText = document.createTextNode(`Customer: ${data.userName}`);
            const emailText = document.createTextNode(`Email: ${data.userEmail}`);
            const timeText = document.createTextNode(`Time: ${data.timeSlot}`);
            const servicesText = document.createTextNode(`Services: ${data.services.map(s => s.serviceName).join(", ")}`);

            // Append each text node to the appointmentDetails div
            appointmentDetails.appendChild(customerText);
            appointmentDetails.appendChild(document.createElement("br")); // Add a line break
            appointmentDetails.appendChild(emailText);
            appointmentDetails.appendChild(document.createElement("br"));
            appointmentDetails.appendChild(timeText);
            appointmentDetails.appendChild(document.createElement("br")); // Add another line break
            appointmentDetails.appendChild(servicesText);

            // Append the details to the list item
            listItem.appendChild(appointmentDetails);
            
            // Append the list item to the appointments list
            appointmentsList.appendChild(listItem);
        });
    } else {
        console.log("No appointments found for this date.");
        const noAppointmentItem = document.createElement("li");
        noAppointmentItem.classList.add("list-group-item");
        noAppointmentItem.textContent = "No appointments for this date.";
        appointmentsList.appendChild(noAppointmentItem);
    }
}

// Helper function to parse time from "9:00 AM" or "10:00 AM" to a comparable format
function parseTime(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
    } else if (modifier === 'AM' && hours === '12') {
        hours = '00';
    }

    return parseInt(hours + minutes); // Return in 24-hour format as a number (for easy comparison)
}

// Initialize FullCalendar
document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const stylistName = await getCurrentStaffName();
            if (!stylistName) {
                alert("Error loading staff information.");
            } else {
                const calendarEl = document.getElementById('calendar');
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    dateClick: function(info) {
                        loadAppointments(info.dateStr, stylistName);
                    },
                    // Customizing the button text
                    buttonText: {
                        today: 'Today' 
                    }
                });
                calendar.render();
            }
        } else {
            console.log("User is not logged in. Redirecting to login page.");
            window.location.href = "../html/staff_login.html"; // Redirect to login if not authenticated
        }
    });
});
