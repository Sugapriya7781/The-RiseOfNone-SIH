from flask import Flask, render_template, request
import pandas as pd
from text_exact import recommend_jobs, extract_skills, ROLE_SKILLS

# Load dataset once
df = pd.read_csv(r"D:\Projects\Smart India Hackathon\static\merged_data.csv")

# Pre-compute extracted skills
df["Extracted Skills"] = df.apply(
    lambda row: extract_skills(row["Job Description"], row["source"]), axis=1
)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/recommend", methods=["POST"])
def recommend():
    name = request.form["name"]
    skills = request.form["skills"].lower().split(",")
    domain = request.form["domain"].lower().split(",")
    soft = request.form["soft"].lower().split(",")
    location = request.form["location"]
    role_interest = request.form["role_interest"].lower().split(",")

    candidate = {
        "name": name,
        "skills": skills,
        "domain": domain,
        "soft": soft,
        "location": location,
        "role_interest": role_interest
    }

    results = recommend_jobs(candidate, top_k=5)
    return render_template("results.html", name=name, results=results)

if __name__ == "__main__":
    app.run(debug=True)
