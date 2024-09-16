'use strict';

// Elements
const elements = {
    mainMenu: document.getElementById('main-menu'),
    playerAmount: document.getElementById('player-amount'),
    notMainMenu: document.getElementsByClassName('not-main'),
    playerData: document.getElementById('player-data'),
    playerHistory: document.getElementById('player-history'),
    deckData: document.getElementById('deck-data'),
    matchHistory: document.getElementById('match-history'),
    nameModal: document.getElementById('name-modal'),
    connection: document.getElementById('connection'),
    playerSelectors: Array.from({ length: 6 }, (_, i) => document.getElementById(`player-select-${i + 1}`)),
    deckSelectors: Array.from({ length: 6 }, (_, i) => document.getElementById(`deck-select-${i + 1}`))
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`http://localhost:5000/get_all_players`);
        const result = await response.json();
        playerNames = result.map(player => player.name);

        const playerSelectDropdown = document.getElementById('player-select');
        playerNames.forEach(name => {
            const option = new Option(name, name);
            playerSelectDropdown.appendChild(option);
            elements.playerSelectors.forEach(selector => selector.appendChild(option.cloneNode(true)));
        });

        elements.connection.innerText = "Connected to database!";
        elements.connection.style.color = "green";
    } catch (error) {
        console.error("Error fetching data: ", error);
        elements.connection.innerText = "Disconnected from database!";
        elements.connection.style.color = "red";
    }
});

const WINNER_COLOR = 'rgba(50, 205, 50, 0.5)'; // limegreen with 50% opacity
const LOSER_COLOR = 'rgba(255, 0, 0, 0.5)'; // red with 50% opacity
let playerNames = [];

function hideAllMenus() {
    elements.mainMenu.style.display = "none";
    Array.from(elements.notMainMenu).forEach(el => el.style.display = "none");
}

function showCreateNewGame() {
    hideAllMenus();
    elements.playerAmount.style.display = "flex";
    elements.playerAmount.style.flexDirection = "column";
}

async function showViewGameData() {
    hideAllMenus();
    elements.playerData.style.display = 'flex';
    elements.playerData.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_all_players`);
        const result = await response.json();
        const tableBody = document.querySelector('#player-table tbody');
        tableBody.innerHTML = '';

        result.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="#" onclick="getPlayerHistory('${player.name}')">${player.name}</a></td>
                <td>${player.games}</td>
                <td>${player.wins}</td>
                <td>${calculateWinRate(player.games, player.wins)}</td>
                <td>${player.best_deck}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function getPlayerHistory(playerName) {
    hideAllMenus();
    elements.playerHistory.style.display = 'flex';
    elements.playerHistory.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_player_history/${playerName}`);
        const result = await response.json();
        const historyTableBody = document.querySelector('#history-table tbody');
        historyTableBody.innerHTML = '';

        result.forEach(match => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${match.winner_name}<br><small>${match.winner_deck}</small></td>
                ${Array.from({ length: 5 }, (_, i) => `<td>${match[`loser_${i + 1}`] || ''}<br><small>${match[`deck_${i + 1}`] || ''}</small></td>`).join('')}
                <td>${match.date}</td>
            `;
            row.style.backgroundColor = (match.winner_name === playerName) ? WINNER_COLOR : LOSER_COLOR;
            historyTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching player history: ", error);
    }
}

async function showHistory() {
    hideAllMenus();
    elements.matchHistory.style.display = 'flex';
    elements.matchHistory.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_match_history`);
        const result = await response.json();
        const matchHistoryTableBody = document.querySelector('#match-table tbody');
        matchHistoryTableBody.innerHTML = '';

        result.forEach(match => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${match.winner_name}<br><small>${match.winner_deck}</small></td>
                ${Array.from({ length: 5 }, (_, i) => `<td>${match[`loser_${i + 1}`] || ''}<br><small>${match[`deck_${i + 1}`] || ''}</small></td>`).join('')}
                <td>${match.date}</td>
            `;
            matchHistoryTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching player history: ", error);
    }
}

async function showDeckData() {
    hideAllMenus();
    elements.deckData.style.display = 'flex';
    elements.deckData.scrollTo({ top: 0, behavior: 'smooth' });
    await fetchAndDisplayDecks();
}

async function fetchAndDisplayDecks(playerName = 'all') {
    try {
        const response = await fetch(`http://localhost:5000/get_all_decks`);
        const result = await response.json();
        const tableBody = document.querySelector('#deck-table tbody');
        tableBody.innerHTML = '';

        result.forEach(deck => {
            if (playerName === 'all' || deck.player_name === playerName) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${deck.deck_name}</td>
                    <td>${deck.player_name}</td>
                    <td>${deck.deck_games}</td>
                    <td>${deck.deck_wins}</td>
                    <td>${calculateWinRate(deck.deck_games, deck.deck_wins)}</td>
                `;
                tableBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Error fetching decks: ", error);
    }
}

function filterDecksByPlayer() {
    const selectedPlayer = document.getElementById('player-select').value;
    fetchAndDisplayDecks(selectedPlayer);
}

function createNewPlayer() {
    elements.nameModal.style.display = 'block';
}

function closeModal() {
    elements.nameModal.style.display = 'none';
}

async function submitName() {
    const playerName = document.getElementById('player-name-modal').value;
    if (playerName && !playerNames.includes(playerName)) {
        try {
            const response = await fetch(`http://localhost:5000/create_player/${playerName}`);
            const result = await response.json();
            if (result.message === "ok") {
                console.log('Created player successfully');
                playerNames.push(playerName);
                const option = new Option(playerName, playerName);
                elements.playerSelectors.forEach(selector => selector.appendChild(option.cloneNode(true)));
            } else {
                alert('Error creating new player');
            }
            closeModal();
        } catch (error) {
            alert('Error creating new player');
            console.error("Error:", error);
        }
    } else {
        alert('Please enter valid player name.');
    }
    document.getElementById('player-name-modal').value = "";
}

function createNewDeck() {
    const playerSelect = document.getElementById('player-select-modal');
    playerSelect.innerHTML = '';
    playerNames.forEach(name => playerSelect.appendChild(new Option(name, name)));
    document.getElementById('deck-modal').style.display = 'block';
}

function closeDeckModal() {
    document.getElementById('deck-modal').style.display = 'none';
}

async function submitDeck() {
    const deckName = document.getElementById('deck-name-modal').value;
    const playerName = document.getElementById('player-select-modal').value;

    if (deckName && playerName) {
        try {
            const response = await fetch(`http://localhost:5000/create_deck/${playerName}/${deckName}`);
            const result = await response.json();
            if (result.message === "ok") {
                console.log('Deck created successfully');
            } else {
                alert('Error creating deck');
            }
            closeDeckModal();
        } catch (error) {
            alert('Error creating deck');
            console.error("Error:", error);
        }
    } else {
        alert('Please enter a deck name and select a player.');
    }
    document.getElementById('deck-name-modal').value = "";
}

async function getPlayerDecks(playerIndex) {
    const playerName = elements.playerSelectors[playerIndex].value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${playerName}`);
        const result = await response.json();
        const deckSelector = elements.deckSelectors[playerIndex];
        deckSelector.innerHTML = '<option value="-"></option>';
        result.forEach(deck => deckSelector.appendChild(new Option(deck.deck_name, deck.deck_name)));
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function submitNewGame() {
    document.getElementById('loading').style.display = 'block';

    const winnerName = elements.playerSelectors[0].value;
    const winnerDeck = elements.deckSelectors[0].value;
    const losers = elements.playerSelectors.slice(1).map((selector, i) => ({
        name: selector.value,
        deck: elements.deckSelectors[i + 1].value
    }));

    try {
        const response = await fetch(`http://localhost:5000/create_match/${winnerName}/${winnerDeck}/${losers.map(l => `${l.name}/${l.deck}`).join('/')}`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log('Match created successfully');
            resetSelectFields();
        } else {
            alert('Error creating match');
            console.log(result);
        }
    } catch (error) {
        alert('Error creating match');
        console.error("Error:", error);
    }

    try {
        const response = await fetch(`http://localhost:5000/update_winner/${winnerName}/${winnerDeck}`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log('Winner updated successfully');
        } else {
            alert('Error updating winner');
            console.log(result);
        }
    } catch (error) {
        alert('Error updating winner');
        console.error("Error:", error);
    }

    for (let loser of losers) {
        if (loser.name !== "-") {
            try {
                const response = await fetch(`http://localhost:5000/update_loser/${loser.name}/${loser.deck}`);
                const result = await response.json();
                if (result.message === "ok") {
                    console.log('Loser updated successfully');
                } else {
                    alert('Error updating loser');
                    console.log(result);
                }
            } catch (error) {
                alert('Error updating loser');
                console.error("Error:", error);
            }
        }
    }
    await setBestDecks();
    toMenu();
    document.getElementById('loading').style.display = 'none';
}

async function setBestDecks() {
    try {
        const response = await fetch(`http://localhost:5000/set_best_decks`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log("Best decks updated");
        } else {
            alert('Error updating best decks');
            console.log(result);
        }
    } catch (error) {
        alert('Error updating best decks');
        console.error("Error:", error);
    }
}

function resetSelectFields() {
    elements.playerSelectors.concat(elements.deckSelectors).forEach(selector => selector.value = '-');
}

function toMenu() {
    hideAllMenus();
    elements.mainMenu.style.display = "flex";
}

function calculateWinRate(games, wins) {
    return games === 0 ? "0.00%" : ((wins / games) * 100).toFixed(2) + "%";
}