from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/')
def index():
    try:
        with open('/Users/martinisusiseff/Repos/etl_epic_board/data/players.json', 'r') as f:
            players_data = json.load(f)
    except FileNotFoundError:
        players_data = [] # Default to an empty list if file not found
    except json.JSONDecodeError:
        players_data = [] # Default to an empty list if JSON is invalid
    return render_template('index.html', players=players_data)

if __name__ == '__main__':
    app.run(debug=True, port=8080)