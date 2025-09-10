from flask import Flask, render_template, request, redirect, url_for, flash, session
import csv
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'replace_with_a_secure_secret_key'

USER_CSV = 'users.csv'

def initialize_csv():
    if not os.path.exists(USER_CSV):
        with open(USER_CSV, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['user', 'password_plain', 'password_encrypted'])

def load_users():
    users = {}
    if os.path.exists(USER_CSV):
        with open(USER_CSV, newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                users[row['user']] = row['password_encrypted']
    return users

def save_user(username, password_plain):
    initialize_csv()
    password_encrypted = generate_password_hash(password_plain)
    with open(USER_CSV, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([username, password_plain, password_encrypted])

@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Please enter username and password', 'error')
            return redirect(url_for('login'))

        users = load_users()
        if username in users and check_password_hash(users[username], password):
            session['username'] = username
            return redirect(url_for('main_menu'))
        else:
            flash('Invalid username or password', 'error')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()

        if not username or not password or not confirm_password:
            flash('Please fill all fields', 'error')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return redirect(url_for('register'))

        users = load_users()
        if username in users:
            flash('Username already exists', 'error')
            return redirect(url_for('register'))

        save_user(username, password)
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/main_menu')
def main_menu():
    if 'username' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    return render_template('menu.html', username=session['username'])

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Logged out successfully', 'success')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
