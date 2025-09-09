# text_exact.py
# Clean Flask-ready module for Internship Recommendation

import pandas as pd
import re

# =====================
# Load Dataset
# =====================
file_path = r"D:\Projects\Smart India Hackathon\static\merged_data.csv"

try:
    df = pd.read_csv(file_path)
    print(f"✅ DataFrame loaded successfully with {len(df)} rows.")
except FileNotFoundError:
    print(f"❌ Error: The file '{file_path}' was not found.")
    df = pd.DataFrame()
except Exception as e:
    print(f"❌ An error occurred while loading dataset: {e}")
    df = pd.DataFrame()

# =====================
# Skills Dictionary
# =====================
ROLE_SKILLS = {
    "business_analyst": {
        "hard": ["excel", "sql", "tableau", "power bi", "sas", "r",
                 "statistics", "financial modeling", "data visualization", "reporting"],
        "domain": ["finance", "banking", "insurance", "healthcare",
                   "supply chain", "marketing", "operations"],
        "soft": ["communication", "stakeholder management", "problem solving",
                 "analytical thinking", "documentation"]
    },
    "data_analyst": {
        "hard": ["sql", "python", "pandas", "numpy", "excel", "tableau", "power bi",
                 "looker", "r", "statistics", "data cleaning", "etl"],
        "domain": ["retail", "e-commerce", "marketing", "healthcare", "operations"],
        "soft": ["attention to detail", "visualization storytelling",
                 "collaboration", "critical thinking"]
    },
    "data_engineer": {
        "hard": ["python", "sql", "java", "scala", "spark", "hadoop", "kafka",
                 "airflow", "dbt", "snowflake", "redshift", "bigquery",
                 "aws", "azure", "gcp", "docker", "kubernetes", "etl",
                 "data warehouse", "pipelines"],
        "domain": ["cloud", "streaming", "data pipelines", "big data",
                   "healthcare", "finance"],
        "soft": ["problem solving", "teamwork", "ownership", "documentation"]
    },
    "data_scientist": {
        "hard": ["python", "r", "sql", "machine learning", "deep learning",
                 "nlp", "tensorflow", "pytorch", "scikit-learn",
                 "statistics", "probability", "optimization", "time series",
                 "computer vision"],
        "domain": ["ai", "healthcare", "finance", "retail",
                   "predictive analytics", "genai"],
        "soft": ["critical thinking", "research mindset",
                 "communication", "problem solving"]
    }
}

# =====================
# Skill Extraction
# =====================
def extract_skills(job_desc, role):
    job_desc_lower = str(job_desc).lower()
    found_skills = {"hard": [], "domain": [], "soft": []}

    if role not in ROLE_SKILLS:
        return found_skills

    for category, skills in ROLE_SKILLS[role].items():
        for skill in skills:
            if re.search(r"\b" + re.escape(skill.lower()) + r"\b", job_desc_lower):
                found_skills[category].append(skill)

    return found_skills


if not df.empty:
    df["Extracted Skills"] = df.apply(
        lambda row: extract_skills(row["Job Description"], str(row["source"])), axis=1
    )

# =====================
# Matching Function
# =====================
def calculate_match_score(job_row, candidate, extracted_skills):
    score = 0

    # Skills overlap
    hard_overlap = set(candidate.get("skills", [])) & set(extracted_skills["hard"])
    domain_overlap = set(candidate.get("domain", [])) & set(extracted_skills["domain"])
    soft_overlap = set(candidate.get("soft", [])) & set(extracted_skills["soft"])

    score += 3 * len(hard_overlap)
    score += 2 * len(domain_overlap)
    score += 1 * len(soft_overlap)

    # Location match
    job_location = str(job_row.get("Location", "")).lower()
    cand_location = candidate.get("location", "").lower()
    if cand_location and cand_location in job_location:
        score += 2
    elif "remote" in job_location:
        score += 0.5

    # Role interest match
    job_title = str(job_row.get("Job Title", "")).lower()
    for role in candidate.get("role_interest", []):
        if role.lower() in job_title:
            score += 3

    # Company rating bonus
    try:
        if float(job_row.get("Rating", 0)) >= 4.0:
            score += 1
    except:
        pass

    return score

# =====================
# Recommendation API
# =====================
def recommend_jobs(candidate, top_k=5):
    """Return top-k job recommendations for a candidate dict"""
    if df.empty:
        return []

    df["Match Score"] = df.apply(
        lambda row: calculate_match_score(row, candidate, row["Extracted Skills"]), axis=1
    )

    top_matches = df.sort_values("Match Score", ascending=False).head(top_k)
    return top_matches[["Job Title", "Company Name", "Location", "Match Score"]].to_dict(orient="records")
