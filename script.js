let dictionary = {};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let audioElement = new Audio();
let usageAudioElement = new Audio();

async function loadDictionary() {
    const storedData = localStorage.getItem("dictionary");
    if (storedData) {
        dictionary = JSON.parse(storedData);
    } else {
        fetch("dictionary.json")
            .then(response => response.json())
            .then(data => {
                dictionary = data;
                localStorage.setItem("dictionary", JSON.stringify(data));
            })
            .catch(error => console.error("Error loading dictionary:", error));
    }
}

const searchBox = document.getElementById("searchBox");
const resultDiv = document.getElementById("result");
const playAudioButton = document.getElementById("playAudio");
const playUsageAudioButton = document.getElementById("playUsageAudio");
const addFavoriteButton = document.getElementById("addFavorite");
const suggestionsDiv = document.getElementById("suggestions");
const favoritesListDiv = document.getElementById("favoritesList");

function searchWord() {
    const word = searchBox.value.trim().toLowerCase();
    if (!word) {
        resultDiv.textContent = "";
        playAudioButton.style.display = "none";
        playUsageAudioButton.style.display = "none";
        addFavoriteButton.style.display = "none";
        return;
    }

    const entry = dictionary[word];
    if (entry) {
        resultDiv.innerHTML = `
            <strong>Ngas:</strong> ${entry.ngas} <br>
            <i>Phonetic:</i> ${entry.phonetic} <br>
            <strong>Usage:</strong> "${entry.usage.sentence}" → <i>${entry.usage.translation}</i>
        `;

        playAudioButton.style.display = "inline";
        playUsageAudioButton.style.display = "inline";
        addFavoriteButton.style.display = "inline";

        playAudioButton.onclick = () => {
            audioElement.src = `audio/${entry.audio}`;
            audioElement.load();
            audioElement.play();
        };

        playUsageAudioButton.onclick = () => {
            usageAudioElement.src = `audio/${entry.usage.audio}`;
            usageAudioElement.load();
            usageAudioElement.play();
        };

        addFavoriteButton.onclick = () => {
            if (!favorites.includes(word)) {
                favorites.push(word);
                localStorage.setItem("favorites", JSON.stringify(favorites));
                displayFavorites();
            }
        };
    } else {
        resultDiv.textContent = "Word not found.";
        playAudioButton.style.display = "none";
        playUsageAudioButton.style.display = "none";
        addFavoriteButton.style.display = "none";
    }
}

function displayFavorites() {
    favoritesListDiv.innerHTML = "";
    favorites.forEach(word => {
        const favoriteItem = document.createElement("div");
        favoriteItem.classList.add("favorite-item");
        favoriteItem.innerHTML = `${word} <span class="remove-favorite">❌</span>`;

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

function showSuggestions() {
    const query = searchBox.value.toLowerCase();
    suggestionsDiv.innerHTML = "";
    if (!query) {
        suggestionsDiv.style.display = "none";
        return;
    }

    const matches = Object.keys(dictionary).filter(word => word.startsWith(query));
    if (matches.length) {
        matches.forEach(word => {
            const suggestionItem = document.createElement("div");
            suggestionItem.textContent = word;
            suggestionItem.classList.add("suggestion-item");
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

searchBox.addEventListener("input", () => {
    searchWord();
    showSuggestions();
});

document.getElementById("homeBtn").addEventListener("click", () => alert("Home clicked!"));
document.getElementById("favoritesBtn").addEventListener("click", () => alert("Favorites clicked!"));
document.getElementById("contactBtn").addEventListener("click", () => alert("Contact clicked!"));

loadDictionary();
displayFavorites();
