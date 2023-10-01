document.addEventListener("DOMContentLoaded", function () {
    const verificationForm = document.getElementById("verificationForm");
    const titleCodeInput = document.getElementById("titleCodeInput");
    const verificationResult = document.getElementById("verificationResult");
    const requestHistoryTable = document.getElementById("requestHistoryTable");

    // Function to fetch and display request history from the file
    function loadRequestHistoryFromFile() {
        fetch("http://localhost:3001/api/request-history")
            .then(response => response.json())
            .then(data => {
                const requestHistoryFromFile = document.getElementById("requestHistoryFromFile");
                requestHistoryFromFile.innerHTML = ""; // Clear existing data

                if (data.length === 0) {
                    requestHistoryFromFile.innerHTML = "<tr><td colspan='4'>No request history available.</td></tr>";
                } else {
                    // Show only the last 10 results
                    const lastTenResults = data.slice(0, 10);

                    lastTenResults.forEach(item => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${item.date}</td>
                            <td>${item.time}</td>
                            <td>${item.titleCode}</td>
                            <td>${item.result}</td>
                        `;
                        requestHistoryFromFile.appendChild(row);
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Load request history from the file when the page loads
    loadRequestHistoryFromFile();

    verificationForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the default form submission

        let titleCode = titleCodeInput.value.trim();
        titleCode = titleCode.toUpperCase(); // Convert to uppercase

        if (titleCode === "") {
            verificationResult.innerText = "Please enter a Title Code.";
            return;
        }

        fetch("http://localhost:3001/api/verify-title", {
            method: "POST",
            body: JSON.stringify({ titleCode }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.isGood) {
                    verificationResult.innerText = `${titleCode} is good for export.`;
                    verificationResult.classList.remove("not-good"); // Remove not-good class
                    verificationResult.classList.add("good"); // Add good class
                } else {
                    verificationResult.innerText = `${titleCode} is not good for export.`;
                    verificationResult.classList.remove("good"); // Remove good class
                    verificationResult.classList.add("not-good"); // Add not-good class
                }

                // Clear the input field after displaying the result
                titleCodeInput.value = "";

                // Update the request history table with the current request
                const currentDate = new Date();
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${currentDate.toLocaleDateString()}</td>
                    <td>${currentDate.toLocaleTimeString()}</td>
                    <td>${titleCode}</td>
                    <td>${data.isGood ? "Title is good for export." : "Title is not good for export."}</td>
                `;

                // Insert the new row at the top of the table
                requestHistoryTable.querySelector("tbody").prepend(row);

                // Limit the request history table to show only the last 10 results
                const historyRows = requestHistoryTable.querySelectorAll("tbody tr");
                if (historyRows.length > 10) {
                    historyRows[historyRows.length - 1].remove();
                }
            })
            .catch(error => {
                console.error("Error:", error);
                verificationResult.innerText = "An error occurred.";
            });
    });
    
});
