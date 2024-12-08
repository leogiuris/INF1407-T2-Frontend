"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = 'http://127.0.0.1:8000/api/resenhas'; // Replace with your backend URL
const LOGIN_URL = 'http://127.0.0.1:8000/api/accounts/token-auth/'; // Replace with your login endpoint
let reviews = [];
let currentUser = null;
let authToken = null;
// DOM Elements
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout');
const reviewTableBody = document.getElementById('reviews-body');
const addReviewForm = document.getElementById('add-review-form');
const authSection = document.getElementById('auth-section');
const contentSection = document.getElementById('content-section');
const userInfo = document.getElementById('user-info');
// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadAuth();
    fetchReviews();
});
// Load Authentication from localStorage
function loadAuth() {
    authToken = localStorage.getItem('authToken');
    currentUser = localStorage.getItem('currentUser');
    if (authToken) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('content-section').style.display = 'block';
        document.getElementById('user-info').textContent = `Logged in as ${currentUser}`;
    }
    else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('content-section').style.display = 'none';
    }
}
// Handle Login
loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = yield fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = yield response.json();
            authToken = data.token;
            currentUser = username;
            if (authToken) {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', currentUser);
            }
            else {
                console.error('Received null authToken from backend.');
            }
            loadAuth();
        }
        else {
            alert('Login failed');
        }
    }
    catch (error) {
        console.error('Error during login:', error);
    }
}));
// Handle Logout
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    loadAuth();
});
// Fetch Reviews from Backend
function fetchReviews() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const headers = {};
            if (authToken) {
                headers['Authorization'] = `Token ${authToken}`;
            }
            const response = yield fetch(API_URL + "/", {
                headers: headers
            });
            if (response.ok) {
                reviews = yield response.json();
                displayReviews();
            }
            else {
                console.error('Failed to fetch reviews');
            }
        }
        catch (error) {
            console.error('Error fetching reviews:', error);
        }
    });
}
// Display Reviews in Table
function displayReviews() {
    reviewTableBody.innerHTML = '';
    reviews.forEach(review => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${review.product}</td>
            <td>${review.brand}</td>
            <td>${review.content}</td>
            <td>${review.score}</td>
            <td>${review.date_posted}</td>
            <td>${review.author}</td>
            <td><a href="${review.product_url}" target="_blank">Link</a></td>
            <td>
                ${currentUser === review.author ? `
                    <button class="edit-button" data-id="${review.id}">Edit</button>
                    <button class="delete-button" data-id="${review.id}">Delete</button>
                ` : ''}
            </td>
        `;
        reviewTableBody.appendChild(row);
    });
    // Attach Event Listeners to Newly Added Buttons
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id') || '0');
            editReview(id);
        });
    });
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id') || '0');
            deleteReview(id);
        });
    });
}
// Escape HTML to Prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
// Handle Add Review
addReviewForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    if (!authToken) {
        alert('You must be logged in to add a review.');
        return;
    }
    const product = document.getElementById('product').value;
    const brand = document.getElementById('brand').value;
    const content = document.getElementById('content').value;
    const author = currentUser;
    const score = parseInt(document.getElementById('score').value);
    const product_url = document.getElementById('product_url').value;
    const newReview = { product, brand, content, author, score, product_url };
    try {
        console.log(newReview);
        const response = yield fetch(API_URL + "/post/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            },
            body: JSON.stringify(newReview)
        });
        if (response.ok) {
            const createdReview = yield response.json();
            reviews.push(createdReview);
            displayReviews();
            addReviewForm.reset();
        }
        else {
            alert('Failed to add review');
        }
    }
    catch (error) {
        console.error('Error adding review:', error);
    }
}));
// Edit Review Function
function editReview(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const review = reviews.find(r => r.id === id);
        if (!review)
            return;
        const newContent = prompt('Enter new content:', review.content);
        if (newContent === null)
            return;
        const trimmedContent = newContent.trim();
        if (trimmedContent === '') {
            alert('Content cannot be empty.');
            return;
        }
        try {
            const response = yield fetch(`${API_URL}/update/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`
                },
                body: JSON.stringify(Object.assign(Object.assign({}, review), { content: trimmedContent }))
            });
            if (response.ok) {
                const updatedReview = yield response.json();
                const index = reviews.findIndex(r => r.id === id);
                reviews[index] = updatedReview;
                displayReviews();
            }
            else {
                alert('Failed to update review');
            }
        }
        catch (error) {
            console.error('Error updating review:', error);
        }
    });
}
// Delete Review Function
function deleteReview(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Are you sure you want to delete this review?'))
            return;
        try {
            const response = yield fetch(`${API_URL}/delete/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${authToken}`
                }
            });
            if (response.ok) {
                reviews = reviews.filter(r => r.id !== id);
                displayReviews();
            }
            else {
                alert('Failed to delete review');
            }
        }
        catch (error) {
            console.error('Error deleting review:', error);
        }
    });
}
// Expose Functions Globally Using Type Assertions
window.editReview = editReview;
window.deleteReview = deleteReview;
