"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var backendAddress = 'http://127.0.0.1:/api/';
var data = [];
var nextId = 1;
// Simulate API calls
var fetchData = function () { return Promise.resolve(data); };
var createData = function (row) {
    var newRow = __assign({ id: nextId++ }, row);
    data.push(newRow);
    return Promise.resolve(newRow);
};
var updateData = function (id, updatedRow) {
    var index = data.findIndex(function (item) { return item.id === id; });
    if (index !== -1) {
        data[index] = __assign(__assign({}, data[index]), updatedRow);
        return Promise.resolve(data[index]);
    }
    return Promise.resolve(undefined);
};
var deleteData = function (id) {
    var index = data.findIndex(function (item) { return item.id === id; });
    if (index !== -1) {
        data.splice(index, 1);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
};
// DOM Elements
var tableBody = document.getElementById("table-body");
var colAInput = document.getElementById("col_A");
var colBInput = document.getElementById("col_B");
var createButton = document.getElementById("create");
// Render the table
var renderTable = function () {
    tableBody.innerHTML = "";
    data.forEach(function (row) {
        var tr = document.createElement("tr");
        tr.innerHTML = "\n            <td>".concat(row.col_A, "</td>\n            <td>").concat(row.col_B, "</td>\n            <td>\n                <button class=\"update\" data-id=\"").concat(row.id, "\">Update</button>\n                <button class=\"delete\" data-id=\"").concat(row.id, "\">Delete</button>\n            </td>\n        ");
        tableBody.appendChild(tr);
    });
    // Add event listeners for update and delete buttons
    document.querySelectorAll(".update").forEach(function (button) {
        button.addEventListener("click", function () {
            var _a, _b;
            var id = parseInt(button.getAttribute("data-id"), 10);
            var updatedColA = prompt("Update Column A", ((_a = data.find(function (d) { return d.id === id; })) === null || _a === void 0 ? void 0 : _a.col_A) || "");
            var updatedColB = prompt("Update Column B", ((_b = data.find(function (d) { return d.id === id; })) === null || _b === void 0 ? void 0 : _b.col_B) || "");
            if (updatedColA !== null && updatedColB !== null) {
                updateData(id, { col_A: updatedColA, col_B: updatedColB }).then(renderTable);
            }
        });
    });
    document.querySelectorAll(".delete").forEach(function (button) {
        button.addEventListener("click", function () {
            var id = parseInt(button.getAttribute("data-id"), 10);
            deleteData(id).then(renderTable);
        });
    });
};
// Add a new row
createButton.addEventListener("click", function () {
    var colA = colAInput.value.trim();
    var colB = colBInput.value.trim();
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
