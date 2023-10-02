const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3001;
const fs = require("fs");
const path = require("path");

app.use(bodyParser.json());
app.use(cors());

// Here we check if the title is good or not: check by keywords in the title code

// Convert the title code to lowercase for case-insensitive comparison
function isTitleGood(titleCode) {
    const lowercaseTitleCode = titleCode.toLowerCase();
    // Define arrays of keywords for "certificate" and "title"
    const certificateKeywords = ["certificate", "cert"];
    const titleKeywords = ["title", "ttl", "salvage"];
    
    // Check if the title contains any of the certificate or title keywords
    const containsCertificate = certificateKeywords.some(keyword =>
        lowercaseTitleCode.includes(keyword)
    );
    const containsTitle = titleKeywords.some(keyword =>
        lowercaseTitleCode.includes(keyword)
    );

    // Return true if either certificate or title keywords are found
    return containsCertificate && containsTitle;
}

// Function to save request history to a file
function saveRequestHistory(requestItem) {
    const filePath = path.join(__dirname, "data", "request-history.txt");
    const requestData = `${requestItem.date}, ${requestItem.time}, ${requestItem.titleCode}, ${requestItem.result}\n`;

    fs.appendFile(filePath, requestData, (err) => {
        if (err) {
            console.error("Error saving request history:", err);
        } else {
            console.log("New request saved successfully.");
        }
    });
}

// Function to read request history from the file
function readRequestHistoryFromFile() {
    const filePath = path.join(__dirname, "data", "request-history.txt");
    const requestData = fs.readFileSync(filePath, "utf8");
    const lines = requestData.split("\n");

    const history = [];
    lines.forEach(line => {
        const [date, time, titleCode, result] = line.split(",");
        if (date && time && titleCode && result) {
            history.push({
                date,
                time,
                titleCode: titleCode,
                result: result + " " + lines[lines.length - 1],
            });
        }
    });
    return history.reverse();
}

app.get("/api/request-history", (req, res) => {
    const history = readRequestHistoryFromFile();
    res.json(history);
});

app.post("/api/verify-title", (req, res) => {
    const { titleCode } = req.body;
    const isGood = isTitleGood(titleCode);

    // Save request history
    const currentDate = new Date();
    const requestItem = {
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        titleCode: titleCode,
        result: isGood ? "Title is good for export." : "Title is not good for export.",
    };
    // Save request history to file
    saveRequestHistory(requestItem);

    res.json({ isGood });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});