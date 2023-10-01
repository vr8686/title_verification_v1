const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3001;
const fs = require("fs");
const path = require("path");

app.use(bodyParser.json());
app.use(cors());

// Here we check if the title is good or not: 
// 1) check by keywords in the title code
// 2) comoare to title data base if title code does not contain certain keywords
// Convert the title code to lowercase for case-insensitive comparison
function isTitleGood(titleCode) {
    const lowercaseTitleCode = titleCode.toLowerCase();
    // Check if the title contains the words "certificate," and "title"
    if (
        lowercaseTitleCode.includes("certificate") &&
        lowercaseTitleCode.includes("title")
    ) {
        return true;
    }
    return titleDatabase[lowercaseTitleCode] || false;
}

// Sample data for title verification (replace with your own data)
const titleDatabase = {
    "al - certificate of title": true,
    "fl - certificate of title": true,
    "de - parts only": false,
    "in - bill of sale - parts only": false,
    "md - parts only - no title letter": false,
    "mi - scrap - bill of sale": false,
    "mi - tr-52": false,
    "mi - bill of sale": false,
    "mi - bill of sale / parts only": false,
    "mt - bill of sale - parts only": false,
    "ny - bill of sale": false,
    "ny - mv907a - open lien": false,
    "ny - mv907a- parts only w/lien holder": false,
    "ny - mv907a- dismantlers": false,
    "ny - mv-37 - dismantle or scrap": false,
    "fl - cash for clunkers": false,
    "ca - acquisition bill of sale": false,
    "ca - salvage acquisition bill of sale": false,
    "ga - unrecovered theft": false,
    "ia - junking certificate": false,
    "nc - junk receipt": false,
    "la - permit to sell": false,
    // Add more title codes and their verification status here
};

// Function to save request history to a file
function saveRequestHistory(requestItem) {
    const filePath = path.join(__dirname, "data", "request-history.txt");
    const requestData = `${requestItem.date}, ${requestItem.time}, ${requestItem.titleCode}, ${requestItem.result}\n`;

    fs.appendFile(filePath, requestData, (err) => {
        if (err) {
            console.error("Error saving request history:", err);
        } else {
            console.log("Request history saved successfully.");
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