from flask import Flask, request, jsonify #type: ignore
from dbml_parser import parse_table_dbml

app = Flask(__name__)

@app.route('/parse_table_dbml', methods=['POST'])
def parse_dbml():
    data = request.get_json()
    result = parse_table_dbml(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=3200)