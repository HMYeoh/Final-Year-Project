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

// Function to get the start and end dates for a specific month and year
function getMonthRange(year, month) {
    const startDate = new Date(year, month, 1); // First day of the month
    const endDate = new Date(year, month + 1, 0); // Last day of the month
    endDate.setHours(23, 59, 59, 999); // Set the end date to the very end of the day
    return { startDate, endDate };
}

// Function to fetch and filter services based on the month
async function fetchServicesByMonth(year, month) {
    const { startDate, endDate } = getMonthRange(year, month);

    try {
        const reservationsSnapshot = await db.collection('reservations')
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(startDate)) // Start of month
            .where('createdAt', '<=', firebase.firestore.Timestamp.fromDate(endDate))   // End of month
            .get();

        const serviceCount = {};

        reservationsSnapshot.forEach(doc => {
            const reservation = doc.data();
            const services = reservation.services;

            services.forEach(service => {
                const serviceName = service.serviceName;
                if (serviceCount[serviceName]) {
                    serviceCount[serviceName]++;
                } else {
                    serviceCount[serviceName] = 1;
                }
            });
        });

        const serviceNames = Object.keys(serviceCount);
        const serviceFrequencies = Object.values(serviceCount);

        renderBarChart(serviceNames, serviceFrequencies);

        return { serviceNames, serviceFrequencies };
    } catch (error) {
        console.error("Error fetching reservations: ", error);
    }
}

// Render the bar chart using Chart.js
function renderBarChart(serviceNames, serviceFrequencies) {
    const ctx = document.getElementById('serviceChart').getContext('2d');
    
    // Destroy the existing chart if it exists to avoid duplicate charts
    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: serviceNames,
            datasets: [{
                label: 'Frequency of Booked Services',
                data: serviceFrequencies,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Filter by month function to get user input
function filterByMonth() {
    const year = parseInt(document.getElementById('year-select').value);
    const month = parseInt(document.getElementById('month-select').value);

    // Fetch and display data for the selected month
    fetchServicesByMonth(year, month);
}

// Convert the data into CSV format
function convertToCSV(serviceNames, serviceFrequencies) {
    let csvContent = "Service Name,Frequency\n"; // CSV header

    serviceNames.forEach((serviceName, index) => {
        const frequency = serviceFrequencies[index];
        csvContent += `${serviceName},${frequency}\n`;
    });

    return csvContent;
}

// Function to trigger CSV download
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Append the link to the document and click to download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Main function to export data to CSV
async function exportCSV() {
    const year = parseInt(document.getElementById('year-select').value);
    const month = parseInt(document.getElementById('month-select').value);

    try {
        const { serviceNames, serviceFrequencies } = await fetchServicesByMonth(year, month);
        const csvContent = convertToCSV(serviceNames, serviceFrequencies);
        const filename = `service_report_${year}_${month + 1}.csv`; // Format filename
        downloadCSV(csvContent, filename);
    } catch (error) {
        console.error("Error exporting CSV: ", error);
    }
}