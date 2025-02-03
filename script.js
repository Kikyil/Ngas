let dictionary = {};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let audioElement = new Audio();

// Debounce function to limit frequent calls
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Load dictionary from GitHub JSON
async function loadDictionary() {
    try {
        const response = await fetch("https://kikyil.github.io/Ngas/dictionary.json");
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        dictionary = await response.json();
        console.log("Dictionary loaded successfully.");
    } catch (error) {
        console.error("Error loading dictionary:", error);
    }
}

// Helper function to toggle button visibility
function toggleButtons(show) {
    playAudioButton.style.display = show ? "inline" : "none";
    addFavoriteButton.style.display = show ? "inline" : "none";
}

// Search Word
function searchWord() {
    const word = searchBox.value.trim().toLowerCase();
    if (!word) {
        resultDiv.innerHTML = "";
        toggleButtons(false);
        return;
    }

    if (!dictionary.words || Object.keys(dictionary.words).length === 0) {
        console.error("Dictionary is empty or not loaded.");
        return;
    }

    const entry = dictionary.words[word];
    if (entry) {
        resultDiv.innerHTML = `
            <strong>Ngas:</strong> ${entry.ngas} <br>
            <i>Phonetic:</i> ${entry.phonetic} <br>
            <strong>Category:</strong> ${entry.category} <br>
            <strong>Usage Examples:</strong> <ul>
                ${entry.usage.map((usage, index) => `
                    <li>
                        "${usage.sentence}" → <i>${usage.translation}</i>
                        <button onclick="playUsageAudio('${usage.audio}')">Play Audio ${index + 1}</button>
                    </li>
                `).join("")}
            </ul>
        `;

        toggleButtons(true);

        // Preload main audio file
        audioElement.src = `audio/${entry.audio}`;
        audioElement.load().catch(() => console.error("Error loading main audio file."));

        playAudioButton.onclick = () => audioElement.play();

        addFavoriteButton.onclick = () => {
            if (!favorites.includes(word)) {
                favorites.push(word);
                localStorage.setItem("favorites", JSON.stringify(favorites));
                displayFavorites();
            }
        };
    } else {
        resultDiv.textContent = "Word not found.";
        toggleButtons(false);
    }
}

// Play Audio for Usage Examples
function playUsageAudio(audioFile) {
    const audio = new Audio(`audio/${audioFile}`);
    audio.play().catch(() => console.error("Error playing usage audio."));
}

// Display Favorite Words
function displayFavorites() {
    favoritesListDiv.innerHTML = "";
    favorites.forEach(word => {
        const favoriteItem = document.createElement("div");
        favoriteItem.classList.add("favorite-item");
        favoriteItem.innerHTML = `${word} <span class="remove-favorite" aria-label="Remove from favorites">❌</span>`;

        favoriteItem.onclick = () => {
            searchBox.value = word;
            searchWord();
        };

        favoriteItem.querySelector(".remove-favorite").onclick = (e) => {
            e.stopPropagation();
            favorites = favorites.filter(fav => fav !== word);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            displayFavorites();
        };

        favoritesListDiv.appendChild(favoriteItem);
    });
}

// Auto-Suggest Words While Typing
function showSuggestions() {
    const query = searchBox.value.toLowerCase();
    suggestionsDiv.innerHTML = "";

    if (!query) {
        suggestionsDiv.style.display = "none";
        return;
    }

    const matches = Object.keys(dictionary.words).filter(word => word.startsWith(query));

    if (matches.length > 0) {
        matches.forEach(word => {
            const suggestionItem = document.createElement("div");
            suggestionItem.textContent = word;
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.setAttribute("role", "button");
            suggestionItem.setAttribute("aria-label", `Select ${word}`);
            suggestionItem.onclick = () => {
                searchBox.value = word;
                searchWord();
                suggestionsDiv.style.display = "none";
            };
            suggestionsDiv.appendChild(suggestionItem);
        });

        suggestionsDiv.style.display = "block";
    } else {
        suggestionsDiv.style.display = "none";
    }
}

// UI Elements
const searchBox = document.getElementById("searchBox");
const resultDiv = document.getElementById("result");
const playAudioButton = document.getElementById("playAudio");
const addFavoriteButton = document.getElementById("addFavorite");
const suggestionsDiv = document.getElementById("suggestions");
const favoritesListDiv = document.getElementById("favoritesList");

// Attach Event Listeners
searchBox.addEventListener("input", debounce(() => {
    searchWord();
    showSuggestions();
}, 300));

// Footer Navigation
document.getElementById("homeBtn").addEventListener("click", () => window.location.href = "/");
document.getElementById("favoritesBtn").addEventListener("click", () => window.location.href = "/favorites");
document.getElementById("contactBtn").addEventListener("click", () => window.location.href = "/contact");

// Initialize
loadDictionary();
displayFavorites();
