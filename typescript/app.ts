
interface Review { 
    id: number;
    product: string;
    content: string;
    brand: string;
    date_posted: string;
    author: string;
    product_url: string;
    score: number;
}

const API_URL = 'http://127.0.0.1:8000/api/resenhas/'; // Replace with your backend URL
const LOGIN_URL = 'http://127.0.0.1:8000/api/accounts/token-auth/'; // Replace with your login endpoint

let reviews: Review[] = [];
let currentUser: string | null = null;
let authToken: string | null = null;

// DOM Elements
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const logoutButton = document.getElementById('logout') as HTMLButtonElement;
const reviewTableBody = document.getElementById('reviews-body') as HTMLTableSectionElement;
const addReviewForm = document.getElementById('add-review-form') as HTMLFormElement;
const authSection = document.getElementById('auth-section') as HTMLElement;
const contentSection = document.getElementById('content-section') as HTMLElement;
const userInfo = document.getElementById('user-info') as HTMLElement;

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
        (document.getElementById('auth-section') as HTMLElement).style.display = 'none';
        (document.getElementById('content-section') as HTMLElement).style.display = 'block';
        (document.getElementById('user-info') as HTMLElement).textContent = `Logged in as ${currentUser}`;
    } else {
        (document.getElementById('auth-section') as HTMLElement).style.display = 'block';
        (document.getElementById('content-section') as HTMLElement).style.display = 'none';
    }
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            currentUser = username;
            if (authToken) {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', currentUser);
            } else {
                console.error('Received null authToken from backend.');
            }
            loadAuth();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

// Handle Logout
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    loadAuth();
});

// Fetch Reviews from Backend
async function fetchReviews() {
    try {
        const headers: HeadersInit = {};
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        const response = await fetch(API_URL, {
            headers: headers
        });

        if (response.ok) {
            reviews = await response.json();
            displayReviews();
        } else {
            console.error('Failed to fetch reviews');
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
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
function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Handle Add Review
addReviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authToken) {
        alert('You must be logged in to add a review.');
        return;
    }

    const product = (document.getElementById('product') as HTMLInputElement).value;
    const brand = (document.getElementById('brand') as HTMLInputElement).value;
    const content = (document.getElementById('content') as HTMLInputElement).value;
    const author = currentUser as string;
    const score = parseInt((document.getElementById('score') as HTMLInputElement).value);
    const product_url = (document.getElementById('product_url') as HTMLInputElement).value;

    const newReview = { product, brand, content,author, score, product_url };

    try {
        console.log(newReview);
        const response = await fetch(API_URL+"post/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            },
            body: JSON.stringify(newReview)
        });

        if (response.ok) {
            const createdReview = await response.json();
            reviews.push(createdReview);
            displayReviews();
            addReviewForm.reset();
        } else {
            alert('Failed to add review');
        }
    } catch (error) {
        console.error('Error adding review:', error);
    }
});

// Edit Review Function
async function editReview(id: number) {
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    const newContent = prompt('Enter new content:', review.content);
    if (newContent === null) return;

    const trimmedContent = newContent.trim();
    if (trimmedContent === '') {
        alert('Content cannot be empty.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}update/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`
            },
            body: JSON.stringify({ ...review, content: trimmedContent })
        });

        if (response.ok) {
            const updatedReview = await response.json();
            const index = reviews.findIndex(r => r.id === id);
            reviews[index] = updatedReview;
            displayReviews();
        } else {
            alert('Failed to update review');
        }
    } catch (error) {
        console.error('Error updating review:', error);
    }
}

// Delete Review Function
async function deleteReview(id: number) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const response = await fetch(`${API_URL}delete/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${authToken}`
            }
        });

        if (response.ok) {
            reviews = reviews.filter(r => r.id !== id);
            displayReviews();
        } else {
            alert('Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
    }
}

// Expose Functions Globally Using Type Assertions
(window as any).editReview = editReview;
(window as any).deleteReview = deleteReview;
