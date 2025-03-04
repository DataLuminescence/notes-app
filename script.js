// script.js

const addBtn = document.querySelector("#addBtn");
const main = document.querySelector("#main");

// When the "Add Note" button is clicked, create a new note element
addBtn.addEventListener("click", function () {
    addNote();
});

// Save notes by sending new ones to the server
const saveNotes = async () => {
    const notesElements = document.querySelectorAll(".note");
    
    try {
        // Loop through each note element
        for (let noteEl of notesElements) {
            const title = noteEl.querySelector(".title").value;
            const content = noteEl.querySelector(".content").value;
            
            // Skip notes that already have an id (assumed already saved)
            if (noteEl.dataset.id) continue;
            
            // Only save if there is some content
            if (content.trim() !== "") {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                const savedNote = await response.json();
                // Store the note's MongoDB id as a data attribute
                noteEl.dataset.id = savedNote._id;
            }
        }
        console.log('Notes saved to MongoDB.');
    } catch (err) {
        console.error('Error saving notes:', err);
    }
};

// Create a new note element and add it to the DOM
const addNote = (text = "", title = "", id = null) => {
    const note = document.createElement("div");
    note.classList.add("note");
    
    // If an id is provided, attach it to the note element
    if (id) note.dataset.id = id;
    
    note.innerHTML = `
        <div class="icons">
            <i class="save fas fa-save" style="color:red"></i>
            <i class="trash fas fa-trash" style="color:yellow"></i>
        </div>
        <div class="title-div">
            <textarea class="title" placeholder="Write the title ...">${title}</textarea>
        </div>
        <textarea class="content" placeholder="Note down your thoughts ...">${text}</textarea>
    `;
    
    // Delete button event: Remove note from DOM and, if saved, from MongoDB
    const delBtn = note.querySelector(".trash");
    delBtn.addEventListener("click", async () => {
        if (note.dataset.id) {
            try {
                await fetch(`/api/notes/${note.dataset.id}`, { method: 'DELETE' });
                console.log('Note deleted from MongoDB.');
            } catch (err) {
                console.error('Error deleting note:', err);
            }
        }
        note.remove();
    });
    
    // Save button event: Trigger saving of notes
    const saveButton = note.querySelector(".save");
    saveButton.addEventListener("click", saveNotes);
    
    // Append the note to the main container
    main.appendChild(note);
};

// Load saved notes from the server and add them to the UI
async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        const notes = await response.json();
        notes.forEach(note => {
            addNote(note.content, note.title, note._id);
        });
    } catch (err) {
        console.error('Error loading notes:', err);
    }
}

loadNotes();
