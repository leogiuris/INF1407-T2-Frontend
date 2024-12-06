"use strict";
const backendAddress = 'http://127.0.0.1:/api/';
let data = [];
let nextId = 1;
// Simulate API calls
const fetchData = () => Promise.resolve(data);
const createData = (row) => {
    const newRow = { id: nextId++, ...row };
    data.push(newRow);
    return Promise.resolve(newRow);
};
const updateData = (id, updatedRow) => {
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updatedRow };
        return Promise.resolve(data[index]);
    }
    return Promise.resolve(undefined);
};
const deleteData = (id) => {
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
        data.splice(index, 1);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
};
// DOM Elements
const tableBody = document.getElementById("table-body");
const colAInput = document.getElementById("col_A");
const colBInput = document.getElementById("col_B");
const createButton = document.getElementById("create");
// Render the table
const renderTable = () => {
    tableBody.innerHTML = "";
    data.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.col_A}</td>
            <td>${row.col_B}</td>
            <td>
                <button class="update" data-id="${row.id}">Update</button>
                <button class="delete" data-id="${row.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    // Add event listeners for update and delete buttons
    document.querySelectorAll(".update").forEach((button) => {
        button.addEventListener("click", () => {
            var _a, _b;
            const id = parseInt(button.getAttribute("data-id"), 10);
            const updatedColA = prompt("Update Column A", ((_a = data.find((d) => d.id === id)) === null || _a === void 0 ? void 0 : _a.col_A) || "");
            const updatedColB = prompt("Update Column B", ((_b = data.find((d) => d.id === id)) === null || _b === void 0 ? void 0 : _b.col_B) || "");
            if (updatedColA !== null && updatedColB !== null) {
                updateData(id, { col_A: updatedColA, col_B: updatedColB }).then(renderTable);
            }
        });
    });
    document.querySelectorAll(".delete").forEach((button) => {
        button.addEventListener("click", () => {
            const id = parseInt(button.getAttribute("data-id"), 10);
            deleteData(id).then(renderTable);
        });
    });
};
// Add a new row
createButton.addEventListener("click", () => {
    const colA = colAInput.value.trim();
    const colB = colBInput.value.trim();
    if (colA && colB) {
        createData({ col_A: colA, col_B: colB }).then(renderTable);
        colAInput.value = "";
        colBInput.value = "";
    }
    else {
        alert("Both fields are required!");
    }
});
// Initial fetch and render
fetchData().then(renderTable);
