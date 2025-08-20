# SkillCred - Resume Verification Engine

SkillCred is a Flask-powered web application that serves as a decentralized resume verification engine. It allows organizations to instantly validate resume claims using credential APIs, blockchain hashes, skill-matching intelligence, and NLP/OCR for resume parsing.

## Features

- 📁 **Bulk Resume Upload**: Drag-and-drop interface for PDF/DOCX files
- 🔍 **Claims Parsing**: Extract education, work experience, skills, and certificates
- ✅ **Verification Engine**: Match against verifiable data sources
- 📊 **Scoring System**: Credit-score-like credibility ranking
- 🎯 **Recruiter Dashboard**: Filters, search, fraud alerts, and KPIs
- 📱 **Responsive Design**: Desktop-first, mobile-ready interface

## Tech Stack

- **Backend**: Flask, Python
- **Frontend**: Jinja2 Templates, Bootstrap 5, Chart.js
- **File Processing**: python-docx, PyPDF2
- **Database**: SQLite (development), PostgreSQL (production)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skillcred
```

2. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser to `http://localhost:5000`

## Project Structure

```
skillcred/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── config.py             # Configuration settings
├── models.py             # Database models
├── verification.py       # Verification logic
├── static/               # Static assets
│   ├── css/
│   ├── js/
│   └── uploads/
├── templates/            # Jinja2 templates
│   ├── base.html
│   ├── dashboard.html
│   ├── upload.html
│   └── results.html
└── README.md
```

## Usage

1. **Upload Resumes**: Use the drag-and-drop interface to upload PDF/DOCX files
2. **View Dashboard**: Monitor verification statistics and fraud alerts
3. **Filter & Search**: Find resumes by trust score, skills, or verification status
4. **Review Results**: Examine detailed verification reports with color-coded claims

## Color Coding

- 🟢 **Green**: Verified claims
- 🟡 **Yellow**: Claims needing review
- 🔴 **Red**: Fraudulent or inconsistent claims

## License

MIT License
