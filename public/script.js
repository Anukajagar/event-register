const API_URL = '/api/participants';

// DOM Elements
const form = document.getElementById('registration-form');
const formTitle = document.getElementById('form-title');
const participantIdInput = document.getElementById('participant-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const eventNameInput = document.getElementById('eventName');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const participantsList = document.getElementById('participants-list');
const loadingDiv = document.getElementById('loading');
const noParticipantsP = document.getElementById('no-participants');
const notification = document.getElementById('notification');

let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchParticipants();
});

// Form Submit Handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const participantData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        eventName: eventNameInput.value
    };

    try {
        if (isEditing) {
            await updateParticipant(participantIdInput.value, participantData);
            showNotification('Participant updated successfully!', 'success');
        } else {
            await createParticipant(participantData);
            showNotification('Registration successful!', 'success');
        }
        resetForm();
        fetchParticipants();
    } catch (error) {
        showNotification(error.message || 'An error occurred', 'error');
    }
});

// Cancel Edit
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// CREATE - Register new participant
async function createParticipant(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
}

// READ - Fetch all participants
async function fetchParticipants() {
    loadingDiv.style.display = 'block';
    participantsList.innerHTML = '';
    noParticipantsP.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        const participants = await response.json();

        loadingDiv.style.display = 'none';

        if (participants.length === 0) {
            noParticipantsP.style.display = 'block';
            return;
        }

        participants.forEach(participant => {
            const card = createParticipantCard(participant);
            participantsList.appendChild(card);
        });
    } catch (error) {
        loadingDiv.style.display = 'none';
        showNotification('Error fetching participants', 'error');
    }
}

// UPDATE - Update participant
async function updateParticipant(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
}

// DELETE - Delete participant
async function deleteParticipant(id) {
    if (!confirm('Are you sure you want to delete this registration?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        showNotification('Participant deleted successfully!', 'success');
        fetchParticipants();
    } catch (error) {
        showNotification(error.message || 'Error deleting participant', 'error');
    }
}

// Edit Participant
function editParticipant(participant) {
    isEditing = true;
    participantIdInput.value = participant._id;
    nameInput.value = participant.name;
    emailInput.value = participant.email;
    phoneInput.value = participant.phone;
    eventNameInput.value = participant.eventName;

    formTitle.textContent = 'Edit Participant';
    submitBtn.textContent = 'Update';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
}

// Create Participant Card
function createParticipantCard(participant) {
    const card = document.createElement('div');
    card.className = 'participant-card';

    const date = new Date(participant.registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    card.innerHTML = `
    <h3>${participant.name}</h3>
    <p><span>📧 Email:</span> ${participant.email}</p>
    <p><span>📱 Phone:</span> ${participant.phone}</p>
    <p><span>📅 Registered:</span> ${date}</p>
    <div class="event-badge">${participant.eventName}</div>
    <div class="card-actions">
      <button class="btn-edit" onclick='editParticipant(${JSON.stringify(participant).replace(/'/g, "\\'")})'>✏️ Edit</button>
      <button class="btn-delete" onclick="deleteParticipant('${participant._id}')">🗑️ Delete</button>
    </div>
  `;

    return card;
}

// Reset Form
function resetForm() {
    form.reset();
    participantIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Register New Participant';
    submitBtn.textContent = 'Register';
    cancelBtn.style.display = 'none';
}

// Show Notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
