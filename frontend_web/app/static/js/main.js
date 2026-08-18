// Expert Decision Replay Platform - Core JS Engine

const API_BASE = window.BACKEND_API_URL || "http://localhost:8000/api/v1";

// Auth helper routines
const Auth = {
    getToken() {
        return localStorage.getItem("token");
    },
    setToken(token) {
        localStorage.setItem("token", token);
    },
    clearToken() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
    setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    },
    getHeaders() {
        const token = this.getToken();
        return {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };
    },
    async checkAuth() {
        const token = this.getToken();
        const path = window.location.pathname;
        
        if (!token && path !== "/login" && path !== "/register" && path !== "/") {
            window.location.href = "/login";
            return false;
        }
        
        if (token && (path === "/login" || path === "/register" || path === "/")) {
            window.location.href = "/dashboard";
            return true;
        }

        if (token) {
            // Verify token validity by calling /users/me
            try {
                const res = await fetch(`${API_BASE}/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.status === 401) {
                    this.clearToken();
                    window.location.href = "/login";
                    return false;
                }
                const userData = await res.json();
                this.setUser(userData);
                this.updateSidebarUser(userData);
            } catch (err) {
                console.error("Auth verification failed", err);
            }
        }
        return true;
    },
    updateSidebarUser(user) {
        const nameEl = document.getElementById("sidebar-user-name");
        const roleEl = document.getElementById("sidebar-user-role");
        if (nameEl) nameEl.textContent = user.full_name;
        if (roleEl) roleEl.textContent = user.role;

        // Customise sidebar menus based on Role
        const auditMenu = document.getElementById("menu-audit-logs");
        if (auditMenu) {
            if (user.role === "Administrator" || user.role === "Manager") {
                auditMenu.style.display = "block";
            } else {
                auditMenu.style.display = "none";
            }
        }
    },
    logout() {
        this.clearToken();
        window.location.href = "/login";
    }
};

// Auto run auth check on load
document.addEventListener("DOMContentLoaded", () => {
    Auth.checkAuth();
    
    // Set up logout button
    const logoutBtn = document.getElementById("sidebar-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => Auth.logout());
    }

    // Set active link in sidebar
    const path = window.location.pathname;
    const links = document.querySelectorAll(".menu-item");
    links.forEach(item => {
        const a = item.querySelector("a");
        if (a && a.getAttribute("href") === path) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
});

// Helper: Format Dates
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper: Status badge helper
function getStatusBadge(status) {
    let badgeClass = "badge-draft";
    if (status === "Under Review") badgeClass = "badge-review";
    else if (status === "Approved") badgeClass = "badge-approved";
    else if (status === "Rejected") badgeClass = "badge-rejected";
    else if (status === "Archived") badgeClass = "badge-archived";
    
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

// Helper: Format File Size
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

