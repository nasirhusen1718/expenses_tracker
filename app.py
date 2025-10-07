from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file, flash
import io
import csv
import os
from datetime import datetime

def get_expenses_for_user(username):
    """Helper function to get expenses for a specific user"""
    expenses = []
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, 'r') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            for row in reader:
                if row and row[0] == username:
                    expenses.append(row[1:])  # Exclude username from the returned data
    return expenses

def save_expenses(username, expenses):
    """Helper function to save expenses for a specific user"""
    # Get all expenses for other users
    other_expenses = []
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, 'r') as f:
            reader = csv.reader(f)
            header = next(reader)  # Save header
            other_expenses = [row for row in reader if row and row[0] != username]
    
    # Combine other users' expenses with current user's expenses
    all_expenses = other_expenses + [[username] + exp for exp in expenses]
    
    # Write back to file
    with open(EXPENSES_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["username", "date", "category", "amount", "description"])
        writer.writerows(all_expenses)

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

@app.route("/logout")
def logout():
    session.pop("username", None)
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

@app.route("/set_budget", methods=["POST"])
def set_budget():
    if "username" not in session:
        return redirect(url_for("login"))
    
    budget = request.form.get("monthly_budget")
    if budget and budget.replace('.', '', 1).isdigit():
        session["monthly_budget"] = float(budget)
    
    return redirect(url_for("dashboard"))

@app.route("/dashboard", methods=["GET", "POST"])
def dashboard():
    if "username" not in session:
        return redirect(url_for("login"))

    username = session["username"]
    
    # Get date range from query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Initialize summary variables
    total_expenses = 0
    total_amount = 0.0
    category_totals = {}
    user_expenses = []
    
    # Add expense
    if request.method == "POST" and "amount" in request.form:
        amount = request.form["amount"]
        category = request.form["category"]
        description = request.form["description"]
        date = datetime.now().strftime("%Y-%m-%d")

        with open(EXPENSES_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([username, date, category, amount, description])

        # Preserve date filter when adding a new expense
        params = []
        if start_date:
            params.append(f'start_date={start_date}')
        if end_date:
            params.append(f'end_date={end_date}')
        redirect_url = url_for("dashboard")
        if params:
            redirect_url += '?' + '&'.join(params)
            
        return redirect(redirect_url)
    
    # Load expenses for the logged-in user
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if "username" in row and row["username"] == username:
                    expense_date = row["date"]
                    # Apply date filter if dates are provided
                    if start_date and expense_date < start_date:
                        continue
                    if end_date and expense_date > end_date:
                        continue
                            
                    # Add to expenses list
                    try:
                        amount = float(row["amount"])
                        category = row["category"]
                        description = row.get("description", "")
                        user_expenses.append([expense_date, category, amount, description])
                        
                        # Update summary stats
                        total_expenses += 1
                        total_amount += amount
                        
                        # Update category totals
                        if category in category_totals:
                            category_totals[category] += amount
                        else:
                            category_totals[category] = amount
                    except (ValueError, KeyError) as e:
                        print(f"Error processing expense row: {e}")
                        continue

    # For regular page load, render the full dashboard
    return render_template("dashboard.html", 
                         username=username, 
                         expenses=user_expenses,
                         total_expenses=total_expenses,
                         total_amount=total_amount,
                         category_totals=category_totals,
                         monthly_budget=session.get('monthly_budget'),
                         now=datetime.now())

@app.route("/edit/<int:expense_id>", methods=["GET", "POST"])
def edit_expense(expense_id):
    if "username" not in session:
        return redirect(url_for("login"))
        
    username = session["username"]
    expenses = get_expenses_for_user(username)
    
    if request.method == "POST":
        # Update the expense
        date = request.form["date"]
        category = request.form["category"]
        amount = request.form["amount"]
        description = request.form["description"]
        
        if 0 <= expense_id < len(expenses):
            expenses[expense_id] = [date, category, amount, description]
            save_expenses(username, expenses)
            
        return redirect(url_for("dashboard"))
    
    # GET request - return the expense data as JSON
    if 0 <= expense_id < len(expenses):
        expense = expenses[expense_id]
        return jsonify({
            'date': expense[0],
            'category': expense[1],
            'amount': expense[2],
            'description': expense[3] if len(expense) > 3 else ''
        })
    
    return jsonify({"error": "Expense not found"}), 404

@app.route("/delete/<int:expense_id>", methods=["POST"])
def delete_expense(expense_id):
    if "username" not in session:
        return redirect(url_for("login"))
        
    username = session["username"]
    expenses = get_expenses_for_user(username)
    
    if 0 <= expense_id < len(expenses):
        # Remove the expense
        expenses.pop(expense_id)
        save_expenses(username, expenses)
    
    return redirect(url_for("dashboard"))

@app.route('/download')
def download_expenses():
    if "username" not in session:
        return redirect(url_for("login"))
    
    username = session["username"]
    
    # Create a file-like buffer to receive CSV data
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write the header
    writer.writerow(["Date", "Category", "Amount", "Description"])
    
    # Write the data
    if os.path.exists(EXPENSES_FILE):
        with open(EXPENSES_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["username"] == username:
                    writer.writerow([
                        row["date"],
                        row["category"],
                        row["amount"],
                        row.get("description", "")
                    ])
    
    # Prepare the response with the CSV data
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f"expenses_{datetime.now().strftime('%Y%m%d')}.csv"
    )

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
                    user_expenses.append({
                        "date": row["date"],
                        "category": row["category"],
                        "amount": row["amount"],
                        "description": row.get("description", "")
                    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)