from flask import Flask, jsonify
from flask_cors import CORS
from models import db

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///vault.db"
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/api/ping")
def ping():
    return jsonify({"status": "ok", "message": "Flask is working!"})

from flask import request
from models import db, VaultEntry

@app.route("/api/vault/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    entry = VaultEntry.query.get(entry_id)

    if not entry:
        return jsonify({"error": "Senha não encontrada"}), 404

    db.session.delete(entry)
    db.session.commit()

    return jsonify({"message": "Senha deletada com sucesso"}), 200

@app.route("/api/vault", methods=["GET"])
def list_entries():
    entries = VaultEntry.query.all()
    result = [
    {
        "id": e.id,
        "site": e.site,
        "username": e.username,
        "encrypted_password": e.encrypted_password
    } 
    for e in entries
]
    return jsonify(result)

@app.route("/api/vault", methods=["POST"])
def add_entry():
    data = request.get_json()

    if not data.get("site") or not data.get("encrypted_password"):
        return jsonify({"error": "site and encrypted password are required"}), 400

    entry = VaultEntry(
        site=data["site"],
        username=data.get("username", ""),
        encrypted_password=data["encrypted_password"],
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"id": entry.id}), 201

if __name__ == "__main__":
    app.run(debug=True, port=5000)

