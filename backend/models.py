from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class VaultEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site = db.Column(db.String(200), nullable=False)
    username = db.Column(db.String(200))
    encrypted_password = db.Column(db.Text, nullable=False)