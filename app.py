from flask import Flask, render_template, request, redirect
import csv
from datetime import datetime

app = Flask(__name__)  # Flask instance must be named 'app'

# Home Page - Add & View Expenses
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        amount = request.form["amount"]
        category = request.form["category"]
        description = request.form["description"]
        date = datetime.now().strftime("%Y-%m-%d")

        # Save to CSV
        with open("expenses.csv", mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([date, category, amount, description])

        return redirect("/")

    # Load expenses
    expenses = []
    try:
        with open("expenses.csv", mode="r") as file:
            reader = csv.reader(file)
            expenses = list(reader)
    except FileNotFoundError:
        pass

    return render_template("index.html", expenses=expenses)

if __name__ == "__main__":
    app.run(debug=True)
