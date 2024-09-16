'use strict';

// Elements
const main_menu = document.getElementById('main-menu');
const player_amount = document.getElementById('player-amount');
const not_main_menu = document.getElementsByClassName('not-main');
const player_data = document.getElementById('player-data');
const player_history = document.getElementById('player-history');
const deck_data = document.getElementById('deck-data');
const match_history = document.getElementById('match-history');
const name_modal = document.getElementById('name-modal');
const player_selector_1 = document.getElementById('player-select-1');
const deck_selector_1 = document.getElementById('deck-select-1');
const player_selector_2 = document.getElementById('player-select-2');
const deck_selector_2 = document.getElementById('deck-select-2');
const player_selector_3 = document.getElementById('player-select-3');
const deck_selector_3 = document.getElementById('deck-select-3');
const player_selector_4 = document.getElementById('player-select-4');
const deck_selector_4 = document.getElementById('deck-select-4');
const player_selector_5 = document.getElementById('player-select-5');
const deck_selector_5 = document.getElementById('deck-select-5');
const player_selector_6 = document.getElementById('player-select-6');
const deck_selector_6 = document.getElementById('deck-select-6');
const connection = document.getElementById('connection');

const WINNER_COLOR = 'limegreen';
const LOSER_COLOR = 'red';
let player_names = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`http://localhost:5000/get_all_players`);
        const result = await response.json();
        for (let i of result) {
            player_names.push(i.name);
        }

        const player_select_dropdown = document.getElementById('player-select');
        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_select_dropdown.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_1.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_2.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_3.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_4.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_5.appendChild(option);
        });

        player_names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            player_selector_6.appendChild(option);
        });

        connection.innerText = "Connected"
        connection.style.color = "green"

    } catch (error) {
        console.error("Error fetching data: ", error);
        connection.innerText = "Disconnected"
        connection.style.color = "red"
    }
});

function show_create_new_game() {
    hide_main_menu();
    player_amount.style.display = "flex";
    player_amount.style.flexDirection = "column";
}

async function show_view_game_data() {
    hide_main_menu();
    player_data.style.display = 'flex';

    player_data.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_all_players`);
        const result = await response.json();

        const table_body = document.querySelector('#player-table tbody');
        table_body.innerHTML = ''; // Clear existing table data

        result.forEach(player => {
            const row = document.createElement('tr');

            const name_cell = document.createElement('td');
            const name_link = document.createElement('a');
            name_link.href = "#";
            name_link.textContent = player.name;
            name_link.onclick = () => get_player_history(player.name);
            name_cell.appendChild(name_link);
            row.appendChild(name_cell);

            const games_cell = document.createElement('td');
            games_cell.textContent = player.games;
            row.appendChild(games_cell);

            const wins_cell = document.createElement('td');
            wins_cell.textContent = player.wins;
            row.appendChild(wins_cell);

            const winrate_cell = document.createElement('td');
            winrate_cell.textContent = calculate_win_rate(player.games, player.wins);
            row.appendChild(winrate_cell);

            const deck_cell = document.createElement('td');
            deck_cell.textContent = player.best_deck;
            row.appendChild(deck_cell);

            table_body.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function get_player_history(player_name) {
    to_menu();
    hide_main_menu();
    player_history.style.display = 'flex';

    player_history.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_player_history/${player_name}`);
        const result = await response.json();

        const history_table_body = document.querySelector('#history-table tbody');
        history_table_body.innerHTML = '';

        result.forEach(match => {
            const row = document.createElement('tr');

            const create_player_deck_cell = (name, deck) => {
                const cell = document.createElement('td');
                cell.innerHTML = `${name}<br><small>${deck}</small>`;
                return cell;
            };

            row.appendChild(create_player_deck_cell(match.winner_name, match.winner_deck));

            for (let i = 1; i <= 5; i++) {
                row.appendChild(create_player_deck_cell(match[`loser_${i}`] || '', match[`deck_${i}`] || ''));
            }

            const date_cell = document.createElement('td');
            date_cell.textContent = match.date;
            row.appendChild(date_cell);

            row.style.backgroundColor = (match.winner_name === player_name) ? WINNER_COLOR : LOSER_COLOR;

            history_table_body.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching player history: ", error);
    }
}

async function show_history() {
    hide_main_menu();
    match_history.style.display = 'flex';

    match_history.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`http://localhost:5000/get_match_history`);
        const result = await response.json();

        const match_history_table_body = document.querySelector('#match-table tbody');
        match_history_table_body.innerHTML = '';

        result.forEach(match => {
            const row = document.createElement('tr');

            const create_player_deck_cell = (name, deck) => {
                const cell = document.createElement('td');
                cell.innerHTML = `${name}<br><small>${deck}</small>`;
                return cell;
            };

            row.appendChild(create_player_deck_cell(match.winner_name, match.winner_deck));

            for (let i = 1; i <= 5; i++) {
                row.appendChild(create_player_deck_cell(match[`loser_${i}`] || '', match[`deck_${i}`] || ''));
            }

            const date_cell = document.createElement('td');
            date_cell.textContent = match.date;
            row.appendChild(date_cell);

            match_history_table_body.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching player history: ", error);
    }
}

async function show_deck_data() {
    hide_main_menu();
    deck_data.style.display = 'flex';
    deck_data.scrollTo({ top: 0, behavior: 'smooth' });
    await fetch_and_display_decks();
}

async function fetch_and_display_decks(player_name = 'all') {
    try {
        const response = await fetch(`http://localhost:5000/get_all_decks`);
        const result = await response.json();

        const table_body = document.querySelector('#deck-table tbody');
        table_body.innerHTML = '';

        result.forEach(deck => {
            if (player_name === 'all' || deck.player_name === player_name) {
                const row = document.createElement('tr');

                const deck_cell = document.createElement('td');
                deck_cell.textContent = deck.deck_name;
                row.appendChild(deck_cell);

                const creator_cell = document.createElement('td');
                creator_cell.textContent = deck.player_name;
                row.appendChild(creator_cell);

                const games_cell = document.createElement('td');
                games_cell.textContent = deck.deck_games;
                row.appendChild(games_cell);

                const wins_cell = document.createElement('td');
                wins_cell.textContent = deck.deck_wins;
                row.appendChild(wins_cell);

                const winrate_cell = document.createElement('td');
                winrate_cell.textContent = calculate_win_rate(deck.deck_games, deck.deck_wins);
                row.appendChild(winrate_cell);

                table_body.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Error fetching decks: ", error);
    }
}

function filter_decks_by_player() {
    const player_select = document.getElementById('player-select');
    const selected_player = player_select.value;
    fetch_and_display_decks(selected_player);
}

function create_new_player() {
    name_modal.style.display = 'block';
}

function close_modal() {
    name_modal.style.display = 'none';
}

async function submit_name() {
    const player_name = document.getElementById('player-name-modal').value;
    if (player_name && !player_names.includes(player_name)) {
        const response = await fetch(`http://localhost:5000/create_player/${player_name}`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log('Created player successfully');
            player_names.push(player_name);
            const option = document.createElement('option');
            option.value = player_name;
            option.textContent = player_name;
            player_selector_1.appendChild(option.cloneNode(true));
            player_selector_2.appendChild(option.cloneNode(true));
            player_selector_3.appendChild(option.cloneNode(true));
            player_selector_4.appendChild(option.cloneNode(true));
            player_selector_5.appendChild(option.cloneNode(true));
            player_selector_6.appendChild(option.cloneNode(true));
        } else {
            alert('Error creating new player');
        }
        close_modal();
    } else {
        alert('Please enter valid player name.');
    }
    document.getElementById('player-name-modal').value = ""
}

function create_new_deck() {
    const playerSelect = document.getElementById('player-select-modal');
    playerSelect.innerHTML = '';

    player_names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        playerSelect.appendChild(option);
    });

    document.getElementById('deck-modal').style.display = 'block';
}

function close_deck_modal() {
    document.getElementById('deck-modal').style.display = 'none';
}

async function submit_deck() {
    const deck_name = document.getElementById('deck-name-modal').value;
    const player_name = document.getElementById('player-select-modal').value;

    if (deck_name && player_name) {
        try {
            const response = await fetch(`http://localhost:5000/create_deck/${player_name}/${deck_name}`);
            const result = await response.json();
            if (result.message === "ok") {
                console.log('Deck created successfully');
            } else {
                alert('Error creating deck');
            }
            close_deck_modal();
        } catch (error) {
            alert('Error creating deck');
            console.error("Error:", error);
        }
    } else {
        alert('Please enter a deck name and select a player.');
    }
    document.getElementById('deck-name-modal').value = ""
}

async function get_player1_decks() {
    const player_name = player_selector_1.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_1.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_1.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_1.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function get_player2_decks() {
    const player_name = player_selector_2.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_2.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_2.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_2.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function get_player3_decks() {
    const player_name = player_selector_3.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_3.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_3.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_3.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function get_player4_decks() {
    const player_name = player_selector_4.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_4.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_4.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_4.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function get_player5_decks() {
    const player_name = player_selector_5.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_5.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_5.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_5.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function get_player6_decks() {
    const player_name = player_selector_6.value;
    try {
        const response = await fetch(`http://localhost:5000/get_player_decks/${player_name}`);
        const result = await response.json();

        deck_selector_6.innerHTML = '';
        const empty_option = document.createElement('option');
        empty_option.value = "-";
        empty_option.textContent = "";
        deck_selector_6.appendChild(empty_option);

        result.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.deck_name;
            option.textContent = deck.deck_name;
            deck_selector_6.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching deck data: ", error);
    }
}

async function submit_new_game() {
    document.getElementById('loading').style.display = 'block';

    const winner_name = player_selector_1.value;
    const winner_deck = deck_selector_1.value;
    const second_name = player_selector_2.value;
    const second_deck = deck_selector_2.value;
    const third_name = player_selector_3.value;
    const third_deck = deck_selector_3.value;
    const fourth_name = player_selector_4.value;
    const fourth_deck = deck_selector_4.value;
    const fifth_name = player_selector_5.value;
    const fifth_deck = deck_selector_5.value;
    const sixth_name = player_selector_6.value;
    const sixth_deck = deck_selector_6.value;

    const losers = [
        {name: second_name, deck: second_deck},
        {name: third_name, deck: third_deck},
        {name: fourth_name, deck: fourth_deck},
        {name: fifth_name, deck: fifth_deck},
        {name: sixth_name, deck: sixth_deck}
    ];

    try {
        const response = await fetch(`http://localhost:5000/create_match/${winner_name}/${winner_deck}/${second_name}/${second_deck}/${third_name}/${third_deck}/${fourth_name}/${fourth_deck}/${fifth_name}/${fifth_deck}/${sixth_name}/${sixth_deck}`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log('match created successfully');
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
        const response = await fetch(`http://localhost:5000/update_winner/${winner_name}/${winner_deck}`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log('winner updated successfully');
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
                    console.log('loser updated successfully');
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
    await set_best_decks()
    to_menu();
    document.getElementById('loading').style.display = 'none';
}

async function set_best_decks() {
    try {
        const response = await fetch(`http://localhost:5000/set_best_decks`);
        const result = await response.json();
        if (result.message === "ok") {
            console.log("best decks updated");
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
    const selectors = [
        player_selector_1, deck_selector_1,
        player_selector_2, deck_selector_2,
        player_selector_3, deck_selector_3,
        player_selector_4, deck_selector_4,
        player_selector_5, deck_selector_5,
        player_selector_6, deck_selector_6
    ];
    selectors.forEach(selector => {
        selector.value = '-';
    });
}

function hide_main_menu() {
    main_menu.style.display = "none";
}

function to_menu() {
    main_menu.style.display = "flex";
    for (let i of not_main_menu) {
        i.style.display = "none";
    }
}

function calculate_win_rate(games, wins) {
    if (games === 0) {
        return "0.00%";
    }
    const win_rate = (wins / games) * 100;
    return win_rate.toFixed(2) + "%";
}
