from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import csv
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your_secret_key"  # Change this in production

USERS_FILE = "users.csv"
EXPENSES_FILE = "expenses.csv"

# Ensure users.csv exists
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["username", "password"])  # header

# Ensure expenses.csv exists
if not os.path.exists(EXPENSES_FILE):
    with open(EXPENSES_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["username", "date", "category", "amount", "description"]) # header

@app.route("/")
def home():
    if "username" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Check if user already exists
        with open(USERS_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["username"] == username:
                    return "User already exists! Try logging in."

        # Save new user
        with open(USERS_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([username, password])

        return redirect(url_for("login"))

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        with open(USERS_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["username"] == username and row["password"] == password:
                    session["username"] = username
                    return redirect(url_for("dashboard"))

        return "Invalid username or password!"

    return render_template("login.html")

@app.route("/dashboard", methods=["GET", "POST"])
def dashboard():
    if "username" not in session:
        return redirect(url_for("login"))

    username = session["username"]
    user_expenses = []

    # Load expenses for the logged-in user
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if "username" in row and row["username"] == username:
                    user_expenses.append([row["date"], row["category"], row["amount"], row["description"]])

    # Add expense
    if request.method == "POST" and "amount" in request.form:
        amount = request.form["amount"]
        category = request.form["category"]
        description = request.form["description"]
        date = datetime.now().strftime("%Y-%m-%d")

        with open(EXPENSES_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([username, date, category, amount, description])

        return redirect(url_for("dashboard"))

    return render_template("dashboard.html", username=username, expenses=user_expenses)

@app.route("/delete_expense", methods=["POST"])
def delete_expense():
    if "username" not in session:
        return redirect(url_for("login"))

    username = session["username"]
    date = request.form["date"]
    category = request.form["category"]
    amount = request.form["amount"]
    description = request.form["description"]

    expenses = []
    # Read all expenses except the one to delete
    with open(EXPENSES_FILE, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not (
                row["username"] == username and
                row["date"] == date and
                row["category"] == category and
                row["amount"] == amount and
                row["description"] == description
            ):
                expenses.append(row)

    # Write back the filtered expenses
    with open(EXPENSES_FILE, "w", newline="") as f:
        fieldnames = ["username", "date", "category", "amount", "description"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(expenses)

    return redirect(url_for("dashboard"))

@app.route("/view_expenses")
def view_expenses():
    if "username" not in session:
        return redirect(url_for("login"))

    username = session["username"]
    user_expenses = []

    # Load expenses for the logged-in user
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if "username" in row and row["username"] == username:
                    user_expenses.append(row)

    return render_template("view_expenses.html", username=username, expenses=user_expenses)

@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)