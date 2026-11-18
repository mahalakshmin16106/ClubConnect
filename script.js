// ==========================================
// CLUBCONNECT - COMPLETE JAVASCRIPT
// ==========================================


// ==========================================
// STORAGE HELPERS
// ==========================================

function getData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
    return getData("currentUser", null);
}

function getUserKey(type) {
    const user = getCurrentUser();

    if (!user) return null;

    return `${type}_${user.email}`;
}

function getUserRecords(type) {
    const key = getUserKey(type);

    return key ? getData(key, []) : [];
}

function saveUserRecords(type, records) {
    const key = getUserKey(type);

    if (key) {
        saveData(key, records);
    }
}


// ==========================================
// 1. NOTIFICATION SYSTEM
// ==========================================

function addNotification(message) {

    const notifications = getData("notifications", []);

    notifications.unshift({
        message: message,
        time: new Date().toLocaleString(),
        read: false
    });

    saveData("notifications", notifications);

    displayNotifications();
    updateNotificationCount();
}


function displayNotifications() {

    const notifications = getData("notifications", []);

    const list = document.getElementById("notificationList");

    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = "<p>No new notifications.</p>";
        updateNotificationCount();
        return;
    }

    list.innerHTML = notifications.map((item, index) => {

        const message = typeof item === "string"
            ? item
            : item.message;

        const unread = typeof item === "string"
            ? true
            : !item.read;

        const time = typeof item === "string"
            ? ""
            : item.time;

        return `
            <div class="notification-item">

                🔔 ${escapeHTML(message)}

                <br>

                <small>${escapeHTML(time || "")}</small>

                ${unread ? `
                    <button onclick="markAsRead(${index})">
                        Mark as read
                    </button>
                ` : ""}

            </div>
        `;

    }).join("");

    updateNotificationCount();
}


function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


function markAsRead(index) {

    const notifications = getData("notifications", []);

    if (!notifications[index]) return;

    if (typeof notifications[index] === "string") {

        notifications[index] = {
            message: notifications[index],
            time: new Date().toLocaleString(),
            read: true
        };

    } else {

        notifications[index].read = true;

    }

    saveData("notifications", notifications);

    displayNotifications();
}


function clearNotifications() {

    if (!confirm("Clear all notifications?")) return;

    saveData("notifications", []);

    displayNotifications();
    updateNotificationCount();
}


function updateNotificationCount() {

    const notifications = getData("notifications", []);

    const unreadCount = notifications.filter(item => {
        return typeof item === "string" || !item.read;
    }).length;

    const count = document.getElementById("notificationCount");

    if (count) {
        count.innerText = unreadCount;
    }
}


function toggleNotifications() {

    const panel = document.getElementById("notifications");

    if (!panel) return;

    const isVisible = panel.style.display === "block";

    panel.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
        displayNotifications();
    }
}


// Close notification panel when clicking outside.
document.addEventListener("click", function(event) {

    const panel = document.getElementById("notifications");
    const button = document.querySelector(".notify-btn");

    if (!panel || !button) return;

    if (!panel.contains(event.target) && !button.contains(event.target)) {
        panel.style.display = "none";
    }

});


// ==========================================
// 2. LOGIN MODAL
// ==========================================

function openLogin() {

    const modal = document.getElementById("loginModal");

    if (!modal) return;

    modal.style.display = "flex";

    changeLoginMode();
}


function closeLogin() {

    const modal = document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "none";
    }
}


function changeLoginMode() {

    const role = document.getElementById("loginRole").value;

    const nameInput = document.getElementById("studentName");
    const submitButton = document.getElementById("loginSubmitButton");
    const message = document.getElementById("loginMessage");

    if (!nameInput || !submitButton) return;

    message.innerText = "";

    if (role === "student") {

        nameInput.style.display = "block";
        nameInput.placeholder = "Enter your name";

        submitButton.innerText = "Get Started";

    } else if (role === "admin") {

        nameInput.style.display = "none";

        submitButton.innerText = "Admin Login";

    } else {

        nameInput.style.display = "none";

        submitButton.innerText = "Coordinator Login";

    }

}


// ==========================================
// 3. AUTHENTICATION
// ==========================================

// Demo credentials.
// These are for frontend demonstration only.
// Real authentication will be implemented using Django.

const demoAccounts = {

    admin: {
        email: "admin@rit.edu",
        password: "Admin@123",
        name: "Admin"
    },

    coordinator: {
        email: "coordinator@rit.edu",
        password: "Coord@123",
        name: "Coordinator"
    }

};


function handleLogin() {

    const role = document.getElementById("loginRole").value;

    const name = document.getElementById("studentName").value.trim();

    const email = document.getElementById("studentEmail").value.trim().toLowerCase();

    const password = document.getElementById("studentPassword").value;

    const message = document.getElementById("loginMessage");

    if (role === "student") {

        studentLogin(name, email, password);

    } else {

        staffLogin(role, email, password);

    }

}


function studentLogin(name, email, password) {

    const message = document.getElementById("loginMessage");

    if (!name || !email || !password) {

        message.innerText = "Please enter all details.";
        return;

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        message.innerText = "Please enter a valid email address.";
        return;

    }

    const students = getData("students", []);

    let student = students.find(item => item.email === email);

    if (student) {

        if (student.password !== password) {

            message.innerText = "Incorrect password.";
            return;

        }

        student.name = name;

    } else {

        student = {
            name: name,
            email: email,
            password: password,
            role: "student"
        };

        students.push(student);

    }

    saveData("students", students);

    setCurrentUser(student);

    closeLogin();

    alert("Welcome to ClubConnect, " + student.name + "!");

}


function staffLogin(role, email, password) {

    const message = document.getElementById("loginMessage");

    const account = demoAccounts[role];

    if (!email || !password) {

        message.innerText = "Please enter email and password.";
        return;

    }

    if (!account || email !== account.email || password !== account.password) {

        message.innerText = "Invalid login credentials.";
        return;

    }

    const user = {
        name: account.name,
        email: account.email,
        role: role
    };

    setCurrentUser(user);

    closeLogin();

    alert("Welcome, " + account.name + "!");

}


function setCurrentUser(user) {

    saveData("currentUser", user);

    updateAuthButton();
    loadDashboard();
    loadProfile();
    updateAdminStats();

    addNotification("Welcome to ClubConnect, " + user.name + "!");

}


// ==========================================
// 4. LOGOUT
// ==========================================

function logout() {

    const user = getCurrentUser();

    if (!user) return;

    if (!confirm("Are you sure you want to logout?")) return;

    localStorage.removeItem("currentUser");

    updateAuthButton();
    loadDashboard();
    loadProfile();
    updateAdminStats();

    alert("You have logged out successfully!");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// 5. AUTH BUTTON
// ==========================================

function updateAuthButton() {

    const user = getCurrentUser();

    const loginButton = document.getElementById("authButton");
    const logoutButton = document.getElementById("logoutButton");

    if (!loginButton || !logoutButton) return;

    if (user) {

        loginButton.innerText = "Hi, " + user.name + " 👋";

        loginButton.onclick = showProfile;

        logoutButton.style.display = "inline-block";

    } else {

        loginButton.innerText = "Login / Signup";

        loginButton.onclick = openLogin;

        logoutButton.style.display = "none";

    }

}


function showProfile() {

    const profile = document.getElementById("profile");

    if (profile) {
        profile.scrollIntoView({
            behavior: "smooth"
        });
    }

}


// ==========================================
// 6. ROLE PERMISSIONS
// ==========================================

function isLoggedIn() {
    return !!getCurrentUser();
}


function isAdmin() {

    const user = getCurrentUser();

    return user && user.role === "admin";

}


function requireStudent() {

    const user = getCurrentUser();

    if (!user) {

        alert("Please login first.");

        openLogin();

        return false;

    }

    if (user.role !== "student") {

        alert("Only student accounts can perform this action.");

        return false;

    }

    return true;

}


function requireAdmin() {

    if (!isAdmin()) {

        alert("Only Admin can perform this action.");

        return false;

    }

    return true;

}


// ==========================================
// 7. JOIN CLUB
// ==========================================

function joinClub(clubName) {

    if (!requireStudent()) return;

    const joinedClubs = getUserRecords("joinedClubs");

    if (joinedClubs.includes(clubName)) {

        alert("You have already joined " + clubName + "!");

        return;

    }

    joinedClubs.push(clubName);

    saveUserRecords("joinedClubs", joinedClubs);

    alert("Congratulations! You joined " + clubName + " successfully!");

    addNotification("You successfully joined " + clubName + "!");

    loadDashboard();
    loadProfile();
    updateAdminStats();

}


// ==========================================
// 8. REGISTER EVENT
// ==========================================

function registerEvent(eventName) {

    if (!requireStudent()) return;

    const registeredEvents = getUserRecords("registeredEvents");

    if (registeredEvents.includes(eventName)) {

        alert("You have already registered for this event!");

        return;

    }

    registeredEvents.push(eventName);

    saveUserRecords("registeredEvents", registeredEvents);

    alert("Successfully registered for " + eventName + "!");

    addNotification("You successfully registered for " + eventName + "!");

    loadDashboard();
    loadProfile();
    updateAdminStats();

}


// ==========================================
// 9. STUDENT DASHBOARD
// ==========================================

function loadDashboard() {

    const user = getCurrentUser();

    const myClubs = document.getElementById("myClubs");
    const myEvents = document.getElementById("myEvents");

    if (!myClubs || !myEvents) return;

    if (!user || user.role !== "student") {

        myClubs.innerHTML = "Login as a student to view your clubs.";
        myEvents.innerHTML = "Login as a student to view your events.";

        return;

    }

    const clubs = getUserRecords("joinedClubs");
    const events = getUserRecords("registeredEvents");

    myClubs.innerHTML = clubs.length
        ? clubs.map(club => "✓ " + escapeHTML(club)).join("<br>")
        : "No clubs joined yet.";

    myEvents.innerHTML = events.length
        ? events.map(event => "✓ " + escapeHTML(event)).join("<br>")
        : "No events registered yet.";

}


// ==========================================
// 10. PROFILE
// ==========================================

function loadProfile() {

    const user = getCurrentUser();

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileRole = document.getElementById("profileRole");

    const clubCount = document.getElementById("clubCount");
    const eventCount = document.getElementById("eventCount");

    if (!profileName) return;

    if (!user) {

        profileName.innerText = "Guest Student";
        profileEmail.innerText = "Please login to view your details.";
        profileRole.innerText = "Guest";

        clubCount.innerText = "0";
        eventCount.innerText = "0";

        return;

    }

    profileName.innerText = user.name;
    profileEmail.innerText = user.email;
    profileRole.innerText = user.role.toUpperCase();

    if (user.role === "student") {

        clubCount.innerText = getUserRecords("joinedClubs").length;
        eventCount.innerText = getUserRecords("registeredEvents").length;

    } else {

        clubCount.innerText = "—";
        eventCount.innerText = "—";

    }

}


// ==========================================
// 11. ADMIN PANEL
// ==========================================

function showAdmin() {

    if (!requireAdmin()) return;

    const panel = document.getElementById("adminPanel");

    if (!panel) return;

    panel.style.display = "block";

    updateAdminStats();

    panel.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// 12. ADD NEW EVENT
// ==========================================

function addNewEvent() {

    if (!requireAdmin()) return;

    const eventInput = document.getElementById("newEvent");
    const dateInput = document.getElementById("eventDate");

    const eventName = eventInput.value.trim();
    const eventDate = dateInput.value;

    if (!eventName || !eventDate) {

        alert("Please enter event name and date!");

        return;

    }

    const events = getData("customEvents", []);

    events.push({
        name: eventName,
        date: eventDate
    });

    saveData("customEvents", events);

    document.getElementById("adminMessage").innerText =
        "Event added successfully!";

    addNotification("New campus event announced: " + eventName + "!");

    eventInput.value = "";
    dateInput.value = "";

    displayCustomEvents();
    updateAdminStats();

}


// ==========================================
// 13. DISPLAY CUSTOM EVENTS
// ==========================================

function displayCustomEvents() {

    const events = getData("customEvents", []);

    const container = document.getElementById("customEventList");

    if (!container) return;

    container.innerHTML = "";

    if (events.length === 0) {

        container.innerHTML = "<p>No additional events have been added yet.</p>";

        return;

    }

    events.forEach(event => {

        const card = document.createElement("div");
        card.className = "event-card";

        const date = document.createElement("div");
        date.className = "event-date";
        date.innerText = formatDate(event.date);

        const title = document.createElement("h3");
        title.innerText = event.name;

        const description = document.createElement("p");
        description.innerText = "New campus event. Join us!";

        const button = document.createElement("button");
        button.innerText = "Register Now →";

        button.onclick = function() {
            registerEvent(event.name);
        };

        card.appendChild(date);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(button);

        if (isAdmin()) {

            const deleteButton = document.createElement("button");

            deleteButton.innerText = "Delete Event";

            deleteButton.onclick = function() {
                deleteCustomEvent(event.name);
            };

            card.appendChild(deleteButton);

        }

        container.appendChild(card);

    });

}


function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


function deleteCustomEvent(eventName) {

    if (!requireAdmin()) return;

    if (!confirm("Delete " + eventName + "?")) return;

    const events = getData("customEvents", []);

    const updatedEvents = events.filter(event => event.name !== eventName);

    saveData("customEvents", updatedEvents);

    displayCustomEvents();
    updateAdminStats();

    addNotification(eventName + " has been removed.");

}


// ==========================================
// 14. SEARCH CLUBS
// ==========================================

function searchClubs() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const searchText = input.value.toLowerCase();

    const cards = document.querySelectorAll(".club-card");

    cards.forEach(card => {

        const heading = card.querySelector("h3");

        if (!heading) return;

        const clubName = heading.innerText.toLowerCase();

        card.style.display = clubName.includes(searchText)
            ? ""
            : "none";

    });

}


// ==========================================
// 15. ADMIN STATISTICS
// ==========================================

function updateAdminStats() {

    const students = getData("students", []);

    const customEvents = getData("customEvents", []);

    const totalRegistrations = students.reduce((total, student) => {

        const key = "registeredEvents_" + student.email;

        return total + getData(key, []).length;

    }, 0);

    const totalStudents = document.getElementById("totalStudents");
    const totalClubs = document.getElementById("totalClubs");
    const totalEvents = document.getElementById("totalEvents");
    const registrations = document.getElementById("totalRegistrations");

    if (totalStudents) {
        totalStudents.innerText = students.length;
    }

    if (totalClubs) {
        totalClubs.innerText = 4;
    }

    if (totalEvents) {
        totalEvents.innerText = 3 + customEvents.length;
    }

    if (registrations) {
        registrations.innerText = totalRegistrations;
    }

}


// ==========================================
// 16. CLUB DETAILS
// ==========================================

function showClubDetails(clubName) {

    const clubInfo = {

        "Tech Club": {
            icon: "💻",
            description: "Explore coding, artificial intelligence, robotics and innovative technologies.",
            activities: "Coding competitions, hackathons, workshops and technical events.",
            skills: "Programming, problem solving, AI and teamwork."
        },

        "Creative Club": {
            icon: "🎨",
            description: "Showcase your creativity through art, design and photography.",
            activities: "Art competitions, photography, graphic design and creative workshops.",
            skills: "Creativity, design and visual communication."
        },

        "Cultural Club": {
            icon: "🎭",
            description: "Celebrate culture, music, dance and unforgettable moments.",
            activities: "Dance, music, cultural festivals and stage performances.",
            skills: "Performance, confidence and teamwork."
        },

        "Sports Club": {
            icon: "🏆",
            description: "Stay active, build teamwork and showcase your sporting talent.",
            activities: "Sports competitions, tournaments and fitness activities.",
            skills: "Leadership, fitness and sportsmanship."
        }

    };

    const club = clubInfo[clubName];

    if (!club) return;

    document.getElementById("clubDetailsContent").innerHTML = `

        <h2>${club.icon} ${clubName}</h2>

        <p>${club.description}</p>

        <h3>Activities</h3>
        <p>${club.activities}</p>

        <h3>Skills You Can Develop</h3>
        <p>${club.skills}</p>

        <button onclick="joinClub('${clubName}')">
            Join ${clubName}
        </button>

    `;

    document.getElementById("clubDetailsModal").style.display = "flex";

}


function closeClubDetails() {

    document.getElementById("clubDetailsModal").style.display = "none";

}


// ==========================================
// 17. EVENT DETAILS
// ==========================================

function showEventDetails(eventName) {

    const eventInfo = {

        "Hackathon 2026": {
            date: "25 November 2026",
            description: "Build innovative solutions and showcase your coding skills."
        },

        "Tech Symposium": {
            date: "28 November 2026",
            description: "Explore emerging technologies and meet tech enthusiasts."
        },

        "Cultural Fest": {
            date: "2 December 2026",
            description: "Experience music, dance, art and campus celebrations."
        }

    };

    const customEvents = getData("customEvents", []);

    const customEvent = customEvents.find(event => event.name === eventName);

    let event = eventInfo[eventName];

    if (!event && customEvent) {

        event = {
            date: formatDate(customEvent.date),
            description: "Join us for this exciting new campus event."
        };

    }

    if (!event) return;

    document.getElementById("eventDetailsContent").innerHTML = `

        <h2>${escapeHTML(eventName)}</h2>

        <h3>Event Date</h3>
        <p>${escapeHTML(event.date)}</p>

        <h3>About the Event</h3>
        <p>${escapeHTML(event.description)}</p>

        <button onclick="registerEvent('${escapeHTML(eventName)}')">
            Register Now →
        </button>

    `;

    document.getElementById("eventDetailsModal").style.display = "flex";

}


function closeEventDetails() {

    document.getElementById("eventDetailsModal").style.display = "none";

}


// ==========================================
// 18. INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    updateAuthButton();

    loadDashboard();

    loadProfile();

    updateAdminStats();

    displayCustomEvents();

    displayNotifications();

    updateNotificationCount();

});
