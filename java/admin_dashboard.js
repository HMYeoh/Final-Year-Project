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

// Filter the data based on the selected month and year
async function filterByMonth() {
    const year = document.getElementById('year-select').value;
    const month = parseInt(document.getElementById('month-select').value);

    await fetchServicesByMonth(year, month);
}

// Function to export data to CSV
function exportCSV() {
    const year = document.getElementById('year-select').value;
    const month = document.getElementById('month-select').value;

    fetchServicesByMonth(year, month).then(({ serviceNames, serviceFrequencies }) => {
        const csvData = [];
        csvData.push(['Service Name', 'Frequency']);
        serviceNames.forEach((name, index) => {
            csvData.push([name, serviceFrequencies[index]]);
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + csvData.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "service_frequency_report.csv");
        document.body.appendChild(link);
        link.click();
    });
}

// Initial fetch of data for the current month and year
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('year-select').value = currentYear;
    document.getElementById('month-select').value = currentMonth;

    await fetchServicesByMonth(currentYear, currentMonth);
});
