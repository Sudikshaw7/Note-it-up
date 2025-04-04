document.addEventListener("DOMContentLoaded", () => {
    loadNotes();
    setupThemeToggle();
    setupTabNavigation();
});

function saveNote() {
    let title = document.getElementById("noteTitle").value.trim();
    let description = document.getElementById("noteDescription").value.trim();
    let category = document.getElementById("noteCategory").value;
    let pinned = document.getElementById("notePinned").checked;
    let editIndex = document.getElementById("editIndex").value;

    if (title === "") {
        alert("Please enter a note title!");
        return;
    }

    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    const noteData = { 
        title, 
        description, 
        category, 
        pinned,
        createdAt: editIndex === "" ? new Date().toISOString() : notes[editIndex].createdAt
    };

    if (editIndex === "") {
        notes.push(noteData);
    } else {
        notes[editIndex] = noteData;
    }

    // Sort notes: pinned notes first, then by most recent
    notes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("editIndex").value = "";
    $("#addModal").modal("hide");
    loadNotes();
}

function loadNotes(filterCategory = 'all') {
    let noteList = document.getElementById("noteList");
    noteList.innerHTML = "";
    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    // Filter notes based on selected tab
    const filteredNotes = filterCategory === 'all' 
        ? notes 
        : notes.filter(note => note.category === filterCategory);

    if (filteredNotes.length === 0) {
        noteList.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No notes ${filterCategory !== 'all' ? `in ${filterCategory} category` : ''}</p>
            </div>
        `;
        return;
    }

    filteredNotes.forEach((note, index) => {
        // Find the original index in the full notes array
        const originalIndex = notes.findIndex(n => 
            n.title === note.title && 
            n.description === note.description && 
            n.category === note.category
        );

        let noteCard = `
        <div class="col-md-4">
            <div class="card ${note.pinned ? 'pinned-note' : ''}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title m-0">${note.title}</h5>
                    ${note.pinned ? '<span class="badge bg-warning">Pinned</span>' : ''}
                </div>
                <div class="card-body">
                    <p class="card-text">${note.description}</p>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <span class="badge bg-info">${note.category}</span>
                    <div>
                        <button class="btn btn-sm btn-warning me-2" onclick="editNote(${originalIndex})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteNote(${originalIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        noteList.innerHTML += noteCard;
    });
}

function editNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes"));
    document.getElementById("noteTitle").value = notes[index].title;
    document.getElementById("noteDescription").value = notes[index].description;
    document.getElementById("noteCategory").value = notes[index].category;
    document.getElementById("notePinned").checked = notes[index].pinned || false;
    document.getElementById("editIndex").value = index;
    $("#addModal").modal("show");
}

function deleteNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes"));
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes(getCurrentTab());
}

function searchNotes() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let currentTab = getCurrentTab();
    
    loadNotes(currentTab);
    
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "block" : "none";
    });
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll("#noteTabs .nav-link");
    
    tabs.forEach(tab => {
        tab.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            this.classList.add("active");
            
            // Load notes for selected category
            const category = this.getAttribute("data-tab");
            loadNotes(category);
            
            // Reset search input
            document.getElementById("searchInput").value = "";
        });
    });
}

function getCurrentTab() {
    const activeTab = document.querySelector("#noteTabs .nav-link.active");
    return activeTab ? activeTab.getAttribute("data-tab") : 'all';
}

function setupThemeToggle() {
    let button = document.getElementById("toggleTheme");
    button.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
}

// Add event listeners
document.getElementById("searchInput").addEventListener("keyup", searchNotes);