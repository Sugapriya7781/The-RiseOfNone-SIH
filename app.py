
from flask import Flask, render_template, request, redirect, url_for
import pandas as pd
from text_exact import recommend_jobs, extract_skills, ROLE_SKILLS

# Load dataset once
df = pd.read_csv("data/merged_data.csv")

# Pre-compute extracted skills
df["Extracted Skills"] = df.apply(
    lambda row: extract_skills(row["Job Description"], row["source"]), axis=1
)


app = Flask(__name__)

@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    # Dummy check: you can replace with DB/auth logic
    if username == "admin" and password == "123":
        return redirect(url_for("dashboard"))
    return "Invalid credentials. <a href='/'>Try again</a>"

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/profile", methods=["GET", "POST"])
def profile():
    if request.method == "POST":
        # Collect form data
        name = request.form.get("name")
        email = request.form.get("email")
        experience = request.form.get("experience")
        role = request.form.get("role")
        hard_skills = request.form.getlist("hard_skills")
        domain_skills = request.form.getlist("domain_skills")
        soft_skills = request.form.getlist("soft_skills")

        # For now, just print (later you can call your function here)
        print("=== PROFILE DATA ===")
        print("Name:", name)
        print("Email:", email)
        print("Experience:", experience)
        print("Role:", role)
        print("Hard Skills:", hard_skills)
        print("Domain Skills:", domain_skills)
        print("Soft Skills:", soft_skills)

        # Redirect back or to dashboard after saving
        return redirect(url_for("dashboard"))  # change if you have a dashboard route

    return render_template("profile.html")

if __name__ == "__main__":
    app.run(debug=True)
