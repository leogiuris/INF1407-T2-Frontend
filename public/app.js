"use strict";
const API_URL = "http://127.0.0.1:8000"; // Replace with your Django REST API URL
// Fetch data from API
const fetchData = async () => {
    const response = await fetch(`${API_URL}/items/`);
    if (!response.ok)
        throw new Error("Failed to fetch data");
    return response.json();
};
// Create new item in API
const createData = async (row) => {
    const token = document.getElementById("token").value;
    const response = await fetch(`${API_URL}/items/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(row),
    });
    if (!response.ok)
        throw new Error("Failed to create data");
    return response.json();
};
// DOM Elements
const tableBody = document.getElementById("table-body");
const productInput = document.getElementById("product");
const contentInput = document.getElementById("content");
const brandInput = document.getElementById("brand");
const productUrlInput = document.getElementById("product_url");
const scoreInput = document.getElementById("score");
const createButton = document.getElementById("create");
const loginButton = document.getElementById("login");
const tokenInput = document.getElementById("token");
// Render the table
const renderTable = (rows) => {
    tableBody.innerHTML = "";
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.product}</td>
            <td>${row.content}</td>
            <td>${row.brand}</td>
            <td>${row.date_posted}</td>
            <td>${row.author}</td>
            <td><a href="${row.product_url}" target="_blank">${row.product_url}</a></td>
            <td>${row.score}</td>
        `;
        tableBody.appendChild(tr);
    });
};
// Add a new row
createButton.addEventListener("click", async () => {
    const product = productInput.value.trim();
    const content = contentInput.value.trim();
    const brand = brandInput.value.trim();
    const product_url = productUrlInput.value.trim();
    const score = parseFloat(scoreInput.value.trim());
    if (!product || !content || !brand || !product_url || isNaN(score)) {
        alert("All fields are required!");
        return;
    }
    try {
        await createData({ product, content, brand, product_url, score });
        productInput.value = "";
        contentInput.value = "";
        brandInput.value = "";
        productUrlInput.value = "";
        scoreInput.value = "";
        const updatedRows = await fetchData();
        renderTable(updatedRows);
    }
    catch (error) {
        alert("Failed to create item. Make sure you are logged in.");
        console.error(error);
    }
});
// Login functionality
loginButton.addEventListener("click", async () => {
    const username = prompt("Username:") || "";
    const password = prompt("Password:") || "";
    try {
        const response = await fetch(`${API_URL}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok)
            throw new Error("Login failed");
        const data = await response.json();
        tokenInput.value = data.access; // Store JWT token
        alert("Login successful!");
    }
    catch (error) {
        alert("Login failed. Please check your credentials.");
        console.error(error);
    }
});
// Fetch data on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const rows = await fetchData();
        renderTable(rows);
    }
    catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please try again later.");
    }
});
