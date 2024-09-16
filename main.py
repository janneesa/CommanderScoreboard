import os
from flask import Flask, render_template, request, jsonify
import mysql.connector
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

tietokanta = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'raise_on_warnings': True,
    'autocommit': True
}


def get_db_connection():
    try:
        conn = mysql.connector.connect(**tietokanta)
        return conn
    except mysql.connector.errors.Error as err:
        print(err)
        return None




@app.route('/')
def test():
    return render_template('index.html')

@app.route('/get_all_players')
def get_all_players():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    myCursor = conn.cursor(dictionary=True)
    myCursor.execute("SELECT name, games, wins, best_deck, (wins / NULLIF(games, 0)) * 100 AS winrate FROM players ORDER BY winrate DESC")
    result = myCursor.fetchall()
    myCursor.close()
    conn.close()
    return jsonify(result)

@app.route('/get_player_history/<player_name>')
def get_player_history(player_name):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    myCursor = conn.cursor(dictionary=True)
    query = """
        SELECT * FROM games
        WHERE winner_name = %s OR loser_1 = %s OR loser_2 = %s
        OR loser_3 = %s OR loser_4 = %s OR loser_5 = %s
        ORDER BY game_id DESC
        LIMIT 25
    """
    myCursor.execute(query, (player_name, player_name, player_name, player_name, player_name, player_name))
    result = myCursor.fetchall()
    myCursor.close()
    conn.close()
    return jsonify(result)

@app.route('/get_match_history')
def get_match_history():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    myCursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM games ORDER BY game_id DESC LIMIT 25"
    myCursor.execute(query)
    result = myCursor.fetchall()
    myCursor.close()
    conn.close()
    return jsonify(result)

@app.route('/get_player_decks/<player_name>')
def get_player_decks(player_name):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    myCursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM decks WHERE player_name = %s"
    myCursor.execute(query, (player_name,))
    result = myCursor.fetchall()
    myCursor.close()
    conn.close()
    return jsonify(result)


@app.route('/get_all_decks')
def get_all_decks():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    myCursor = conn.cursor(dictionary=True)
    query = """
        SELECT deck_name, player_name, deck_games, deck_wins,
        (deck_wins / NULLIF(deck_games, 0)) * 100 AS winrate
        FROM decks
        ORDER BY winrate DESC
    """
    myCursor.execute(query)
    result = myCursor.fetchall()
    myCursor.close()
    conn.close()
    return jsonify(result)


@app.route('/create_player/<name>')
def create_player(name):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500

    myCursor = conn.cursor(dictionary=True)
    query = "INSERT INTO players (name) VALUES (%s)"
    try:
        myCursor.execute(query, (name,))
        conn.commit()  # Commit the transaction
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        myCursor.close()
        conn.close()

    return jsonify({"message": "ok"})

@app.route('/create_deck/<player_name>/<deck_name>')
def create_deck(player_name, deck_name):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500

    myCursor = conn.cursor(dictionary=True)
    query = "INSERT INTO decks (player_name, deck_name) VALUES (%s, %s)"
    try:
        myCursor.execute(query, (player_name, deck_name))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        myCursor.close()
        conn.close()

    return jsonify({"message": "ok"})

@app.route('/create_match/<winner_name>/<winner_deck>/<second_name>/<second_deck>/<third_name>/<third_deck>/<fourth_name>/<fourth_deck>/<fifth_name>/<fifth_deck>/<sixth_name>/<sixth_deck>')
def create_match(winner_name, winner_deck, second_name, second_deck, third_name, third_deck, fourth_name, fourth_deck, fifth_name, fifth_deck, sixth_name, sixth_deck):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500

    current_date = datetime.now().date()

    myCursor = conn.cursor(dictionary=True)
    query = "INSERT INTO games (winner_name, winner_deck, loser_1, deck_1, loser_2, deck_2, loser_3, deck_3, loser_4, deck_4, loser_5, deck_5, date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    try:
        myCursor.execute(query, (winner_name, winner_deck, second_name, second_deck, third_name, third_deck, fourth_name, fourth_deck, fifth_name, fifth_deck, sixth_name, sixth_deck, current_date))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        myCursor.close()
        conn.close()

    return jsonify({"message": "ok"})



@app.route('/update_winner/<winner_name>/<winner_deck>')
def update_winner(winner_name, winner_deck):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    try:
        myCursor = conn.cursor(dictionary=True)
        # Update the players table
        update_players_query = """
            UPDATE players
            SET games = games + 1, wins = wins + 1
            WHERE name = %s
        """
        myCursor.execute(update_players_query, (winner_name,))

        # Update the decks table
        update_decks_query = """
            UPDATE decks
            SET deck_games = deck_games + 1, deck_wins = deck_wins + 1
            WHERE player_name = %s AND deck_name = %s
        """
        myCursor.execute(update_decks_query, (winner_name, winner_deck))

        # Commit the transaction
        conn.commit()

    except Exception as e:
        error_message = f"Unexpected Error: {str(e)}"
        print(error_message)  # Log the error for debugging
        return jsonify({"error": error_message}), 500
    finally:
        myCursor.close()
        conn.close()

    return jsonify({"message": "ok"})

@app.route('/update_loser/<loser_name>/<loser_deck>')
def update_loser(loser_name, loser_deck):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    try:
        myCursor = conn.cursor(dictionary=True)
        # Update the players table
        update_players_query = """
            UPDATE players
            SET games = games + 1
            WHERE name = %s
        """
        myCursor.execute(update_players_query, (loser_name,))

        # Update the decks table
        update_decks_query = """
            UPDATE decks
            SET deck_games = deck_games + 1
            WHERE player_name = %s AND deck_name = %s
        """
        myCursor.execute(update_decks_query, (loser_name, loser_deck))

        # Commit the transaction
        conn.commit()

    except Exception as e:
        error_message = f"Unexpected Error: {str(e)}"
        print(error_message)  # Log the error for debugging
        return jsonify({"error": error_message}), 500
    finally:
        myCursor.close()
        conn.close()

    return jsonify({"message": "ok"})

@app.route('/set_best_decks')
def set_best_decks():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Unable to connect to the database"}), 500
    try:
        myCursor = conn.cursor(dictionary=True)
        get_players_query = """
            SELECT *
            FROM players
        """
        myCursor.execute(get_players_query)
        players = myCursor.fetchall()

        for player in players:
            get_best_deck_query = """
                SELECT deck_name, deck_games, deck_wins,(deck_wins / NULLIF(deck_games, 0)) * 100 AS winrate
                FROM decks
                WHERE player_name = %s
                ORDER BY winrate DESC
                LIMIT 1
            """
            myCursor.execute(get_best_deck_query, (player['name'],))
            best_deck = myCursor.fetchone()

            if best_deck:
                update_player_query = """
                    UPDATE players
                    SET best_deck = %s
                    WHERE name = %s
                """
                myCursor.execute(update_player_query, (best_deck['deck_name'], player['name']))

        conn.commit()

        return jsonify({"message": "ok"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run()
