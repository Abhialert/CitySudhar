const BASE_URL = "https://citysudhar-default-rtdb.asia-southeast1.firebasedatabase.app/"; 
const DB_URL = `${BASE_URL}issues.json`;

function displayIssues() {
    const issueListDiv = document.getElementById("issueList");
    if (!issueListDiv) return;

    fetch(DB_URL)
        .then(response => response.json())
        .then(data => {
            const allIssues = data ? Object.entries(data).map(([id, val]) => ({ ...val, id })) : [];
            const visibleIssues = allIssues.filter(issue => issue.status !== "Deleted").reverse();
            
            updateSummaryBar(visibleIssues);
            
            issueListDiv.innerHTML = "";
            visibleIssues.forEach(issue => {
                const card = document.createElement("div");
                card.className = "issue-card";
                card.innerHTML = `
                    <div class="issue-time">${new Date(issue.createdAt).toLocaleDateString()}</div>
                    <h3>${issue.title}</h3>
                    <p style="font-size: 0.85rem; color: #2563eb; font-weight: 700;">By: ${issue.userName}</p>
                    <p><b>Loc:</b> ${issue.location}</p>
                    <p class="status ${issue.status.replace(/\s/g, '')}">${issue.status}</p>
                `;
                issueListDiv.appendChild(card);
            });
        });
}

function updateSummaryBar(issues) {
    const totalEl = document.getElementById("totalCount");
    if (totalEl) {
        totalEl.innerText = issues.length;
        document.getElementById("pendingCount").innerText = issues.filter(i => i.status === "Pending").length;
        document.getElementById("progressCount").innerText = issues.filter(i => i.status === "In Progress").length;
        document.getElementById("resolvedCount").innerText = issues.filter(i => i.status === "Resolved").length;
    }
}

const form = document.getElementById("issueForm");
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const btn = document.getElementById("submitBtn");
        btn.innerText = "Processing...";
        btn.disabled = true;

        const issueData = {
            userName: document.getElementById("userName").value,
            title: document.getElementById("title").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value,
            description: document.getElementById("description").value,
            status: "Pending",
            createdAt: Date.now()
        };

        fetch(DB_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData) 
        })
        .then(response => {
            if(response.ok) {
                document.getElementById("formContent").style.display = "none";
                document.getElementById("successMessage").style.display = "block";
                
                // REDIRECT AFTER 5 SECONDS
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 5000);
            } else {
                alert("Database Error: Ensure Rules are set to public in Firebase console.");
                btn.innerText = "Submit Report";
                btn.disabled = false;
            }
        })
        .catch(err => {
            alert("Network Error: Could not connect to the cloud.");
            btn.disabled = false;
        });
    });
}

displayIssues();
