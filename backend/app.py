from flask import Flask, jsonify, request
from dotenv import load_dotenv
import pymysql
import os

load_dotenv()

app = Flask(__name__)


def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )


@app.route("/api/health")
def health():
    try:
        connection = get_db_connection()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "TalentFlow API and database are running"
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": str(error)
        }), 500


@app.route("/api")
def api_home():
    return jsonify({
        "application": "TalentFlow AI",
        "version": "1.0",
        "status": "running"
    })


@app.route("/api/candidates", methods=["GET"])
def get_candidates():

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    name,
                    email,
                    role,
                    experience,
                    score,
                    stage,
                    DATE_FORMAT(applied, '%%Y-%%m-%%d') AS applied,
                    source
                FROM candidates
                ORDER BY id
            """)

            candidates = cursor.fetchall()

        return jsonify(candidates)

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": "Could not load candidates",
            "error": str(error)
        }), 500

    finally:
        if connection:
            connection.close()


@app.route("/api/candidates", methods=["POST"])
def add_candidate():

    candidate = request.get_json()

    if not candidate:
        return jsonify({
            "status": "error",
            "message": "No candidate data received"
        }), 400

    required_fields = ["name", "email", "role", "experience"]

    for field in required_fields:
        if not candidate.get(field):
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:

            sql = """
                INSERT INTO candidates
                (name, email, role, experience, score, stage, applied, source)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(sql, (
                candidate["name"],
                candidate["email"],
                candidate["role"],
                candidate["experience"],
                candidate.get("score", 85),
                "Applied",
                candidate.get("applied", "2026-10-06"),
                candidate.get("source", "Website")
            ))

            new_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate added successfully",
            "candidate": {
                "id": new_id,
                "name": candidate["name"],
                "email": candidate["email"],
                "role": candidate["role"],
                "experience": candidate["experience"],
                "score": candidate.get("score", 85),
                "stage": "Applied",
                "applied": candidate.get("applied", "2026-10-06"),
                "source": candidate.get("source", "Website")
            }
        }), 201

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Could not add candidate",
            "error": str(error)
        }), 500

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
