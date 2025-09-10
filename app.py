from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import pandas as pd
from text_exact import recommend_jobs, extract_skills, ROLE_SKILLS

# Load dataset once
df = pd.read_csv("data/merged_data.csv")

# Pre-compute extracted skills
df["Extracted Skills"] = df.apply(
    lambda row: extract_skills(row["Job Description"], row["source"]), axis=1
)

app = Flask(__name__)
app.secret_key = "supersecret"  # needed for session

@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/get_skills")
def get_skills():
    return jsonify(ROLE_SKILLS)



@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    if (username == "admin" or username == "loga") and password == "123":
        session["user"] = username  # store user in session
        return redirect(url_for("dashboard"))
    return "Invalid credentials. <a href='/'>Try again</a>"

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("dashboard.html", user=session["user"])

@app.route('/skills')
def skills():
    return render_template('skills.html')

@app.route("/profile", methods=["GET", "POST"])
def profile():
    if "user" not in session:
        return redirect(url_for("login_page"))

    if request.method == "POST":
        # Collect form data
        name = request.form.get("name")
        email = request.form.get("email")
        experience = request.form.get("experience")
        role = request.form.get("role")
        hard_skills = request.form.getlist("hard_skills")
        domain_skills = request.form.getlist("domain_skills")
        soft_skills = request.form.getlist("soft_skills")

        print("=== PROFILE DATA ===")
        print("Name:", name)
        print("Email:", email)
        print("Experience:", experience)
        print("Role:", role)
        print("Hard Skills:", hard_skills)
        print("Domain Skills:", domain_skills)
        print("Soft Skills:", soft_skills)

        return redirect(url_for("dashboard"))

    return render_template("profile.html", user=session["user"])



# NEW: Logout Route
@app.route("/logout")
def logout():
    session.clear()  # clears all session data
    return redirect(url_for("login_page"))

if __name__ == "__main__":
    app.run(debug=True)
