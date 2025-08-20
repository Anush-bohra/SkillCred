from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import random
from datetime import datetime, timedelta
from config import Config
from models import Resume, ResumeDatabase
from verification import ResumeParser, VerificationEngine
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import io

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize components
db = ResumeDatabase()
parser = ResumeParser()
verifier = VerificationEngine()

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/')
def index():
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    stats = db.get_stats()
    resumes = db.get_all_resumes()
    
    # Sort resumes by upload date (newest first)
    resumes.sort(key=lambda x: x.uploaded_at, reverse=True)
    
    # Calculate real skills frequency from actual data
    def calculate_skills_frequency():
        skills_count = {}
        all_resumes = db.get_all_resumes()
        
        for resume in all_resumes:
            if resume.parsed_data and resume.parsed_data.get('skills'):
                for skill in resume.parsed_data.get('skills', []):
                    skill = skill.strip()
                    if skill:  # Only count non-empty skills
                        skills_count[skill] = skills_count.get(skill, 0) + 1
        
        # Sort by frequency and get top 10
        sorted_skills = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:10]
        return dict(sorted_skills)
    
    skills_frequency = calculate_skills_frequency()
    
    # If no skills found, use defaults
    if not skills_frequency:
        skills_frequency = {
            'JavaScript': 45,
            'Python': 38,
            'React': 32,
            'Node.js': 28,
            'Java': 25
        }

    # Generate sample chart data
    trust_score_distribution = [25, 45, 20, 10]  # 90-100%, 70-89%, 50-69%, 0-49%
    verification_status = [65, 25, 10]  # Verified, Review, Flagged
    
    # Get recent flags
    recent_flags = []
    for resume in resumes[:5]:  # Last 5 resumes
        recent_flags.extend(resume.flags)
    recent_flags = recent_flags[:10]  # Limit to 10 most recent
    
    return render_template('dashboard.html', 
                         stats=stats,
                         resumes=resumes[:20],  # Limit to 20 most recent
                         trust_score_distribution=trust_score_distribution,
                         verification_status=verification_status,
                         skills_frequency=skills_frequency,
                         recent_flags=recent_flags)

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if files are present
        if 'resume' not in request.files:
            return jsonify({'error': 'Resume file is required'}), 400

        resume_file = request.files['resume']

        # Check if file is selected
        if not resume_file.filename:
            return jsonify({'error': 'No file selected'}), 400

        # Validate file type
        if not allowed_file(resume_file.filename, app.config['ALLOWED_RESUME_EXTENSIONS']):
            return jsonify({'error': 'Unsupported file type. Please upload PDF or DOCX files.'}), 400

        # Secure filename
        filename = secure_filename(resume_file.filename)
        if not filename:
            filename = f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Create file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save file
        resume_file.save(file_path)

        # Create resume record
        resume = Resume(filename, file_path)
        resume_id = db.add_resume(resume)

        # Parse resume
        resume.status = 'processing'
        db.update_resume(resume_id, status='processing')
        
        parsed_data = parser.parse_resume(file_path)
        if parsed_data is None:
            resume.status = 'error'
            db.update_resume(resume_id, status='error')
            return jsonify({'error': 'Failed to parse resume file'}), 400

        # Verify claims
        verification_results, flags, trust_score = verifier.verify_claims(parsed_data)

        # Update resume with results
        resume.parsed_data = parsed_data
        resume.verification_results = verification_results
        resume.trust_score = trust_score
        resume.flags = flags
        resume.status = 'completed'
        
        db.update_resume(resume_id, 
                        parsed_data=parsed_data,
                        verification_results=verification_results,
                        trust_score=trust_score,
                        flags=flags,
                        status='completed')

        return jsonify({
            "message": "Resume processed successfully!",
            "resume_id": resume_id,
            "filename": filename,
            "parsed": parsed_data,
            "verification": verification_results,
            "flags": flags,
            "trust_score": trust_score,
        })
    
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/results/<resume_id>')
def results(resume_id):
    resume = db.get_resume(resume_id)
    if not resume:
        flash('Resume not found.', 'error')
        return redirect(url_for('dashboard'))
    
    # Calculate additional stats for the results page
    verification_results = resume.verification_results
    verified_count = 0
    review_count = 0
    
    for category in ['skills', 'experience', 'education', 'certifications']:
        items = verification_results.get(category, [])
        for item in items:
            if item.get('status') == 'verified':
                verified_count += 1
            elif item.get('status') in ['needs_review', 'unverified']:
                review_count += 1
    
    # Add counts to verification results for display
    resume.verification_results['verified_count'] = verified_count
    resume.verification_results['review_count'] = review_count
    
    return render_template('results.html', resume=resume)

@app.route('/api/dashboard')
def api_dashboard():
    """API endpoint for dashboard data"""
    stats = db.get_stats()
    
    # Calculate real skills frequency
    def calculate_skills_frequency_api():
        skills_count = {}
        all_resumes = db.get_all_resumes()
        
        for resume in all_resumes:
            if resume.parsed_data and resume.parsed_data.get('skills'):
                for skill in resume.parsed_data.get('skills', []):
                    skill = skill.strip()
                    if skill:  # Only count non-empty skills
                        skills_count[skill] = skills_count.get(skill, 0) + 1
        
        # Sort by frequency and get top 10
        sorted_skills = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:10]
        return dict(sorted_skills) if sorted_skills else {
            'JavaScript': 45,
            'Python': 38,
            'React': 32,
            'Node.js': 28,
            'Java': 25
        }
    
    skills_frequency = calculate_skills_frequency_api()
    
    return jsonify({
        'totalResumes': stats['total_resumes'],
        'avgTrustScore': stats['avg_trust_score'],
        'verificationRate': stats['verification_rate'],
        'fraudAlerts': stats['fraud_alerts'],
        'trustScoreDistribution': [25, 45, 20, 10],
        'verificationStatus': [65, 25, 10],
        'skillsFrequency': skills_frequency
    })

def generate_resume_pdf_report(resume):
    """Generate PDF report for a resume"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#2c5530'),
        spaceAfter=30,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c5530'),
        spaceBefore=20,
        spaceAfter=10,
    )
    
    # Title
    story.append(Paragraph("SkillCred Resume Verification Report", title_style))
    story.append(Spacer(1, 20))
    
    # Basic Info
    parsed_data = resume.parsed_data or {}
    story.append(Paragraph("Candidate Information", heading_style))
    
    basic_info = [
        ['Name:', parsed_data.get('name', 'Unknown')],
        ['Email:', parsed_data.get('email', 'No email provided')],
        ['Filename:', resume.filename],
        ['Upload Date:', resume.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')],
    ]
    
    basic_table = Table(basic_info, colWidths=[2*inch, 4*inch])
    basic_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
    ]))
    story.append(basic_table)
    story.append(Spacer(1, 20))
    
    # Verification Results
    story.append(Paragraph("Verification Results", heading_style))
    
    # Trust Score with color coding
    trust_color = colors.green if resume.trust_score >= 80 else colors.orange if resume.trust_score >= 60 else colors.red
    status = 'VERIFIED' if resume.trust_score >= 80 else 'REVIEW REQUIRED' if resume.trust_score >= 60 else 'FLAGGED'
    
    verification_info = [
        ['Trust Score:', f"{resume.trust_score}%"],
        ['Status:', status],
        ['Flags Count:', str(len(resume.flags))],
    ]
    
    verification_table = Table(verification_info, colWidths=[2*inch, 4*inch])
    verification_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
        ('TEXTCOLOR', (1, 1), (1, 1), trust_color),
        ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
    ]))
    story.append(verification_table)
    story.append(Spacer(1, 20))
    
    # Skills
    if parsed_data.get('skills'):
        story.append(Paragraph("Skills", heading_style))
        skills_text = ', '.join(parsed_data.get('skills', []))
        story.append(Paragraph(skills_text, styles['Normal']))
        story.append(Spacer(1, 15))
    
    # Flags (if any)
    if resume.flags:
        story.append(Paragraph("Verification Flags", heading_style))
        for flag in resume.flags:
            story.append(Paragraph(f"• {flag}", styles['Normal']))
        story.append(Spacer(1, 15))
    
    # Experience
    if parsed_data.get('experience'):
        story.append(Paragraph("Work Experience", heading_style))
        for exp in parsed_data.get('experience', []):
            exp_text = f"<b>{exp.get('title', 'Unknown Position')}</b> at {exp.get('company', 'Unknown Company')}"
            if exp.get('duration'):
                exp_text += f" ({exp.get('duration')})"
            story.append(Paragraph(exp_text, styles['Normal']))
            story.append(Spacer(1, 5))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph("This report was generated by SkillCred - AI-Powered Resume Verification System", 
                          ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                          ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route('/api/report/<resume_id>')
def api_report(resume_id):
    """Generate downloadable report"""
    resume = db.get_resume(resume_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    format_type = request.args.get('format', 'pdf')
    
    if format_type == 'json':
        return jsonify(resume.to_dict())
    elif format_type == 'pdf':
        # Generate PDF report
        pdf_buffer = generate_resume_pdf_report(resume)
        
        # Return PDF as download
        from flask import make_response
        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=resume_report_{resume_id}.pdf'
        return response
    else:
        # For other formats, return JSON for now
        return jsonify({
            'message': f'Report generation in {format_type} format coming soon',
            'data': resume.to_dict()
        })

@app.route('/api/export/dashboard')
def api_export_dashboard():
    """Export dashboard data"""
    format_type = request.args.get('format', 'csv')
    stats = db.get_stats()
    resumes = db.get_all_resumes()
    
    return jsonify({
        'message': f'Dashboard export in {format_type} format coming soon',
        'stats': stats,
        'total_resumes': len(resumes)
    })

@app.route('/api/search_resumes')
def api_search_resumes():
    """Search and filter resumes"""
    search_query = request.args.get('search', '').lower()
    trust_score_filter = request.args.get('trustScore', 'all')
    status_filter = request.args.get('status', 'all')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Get all resumes
    all_resumes = db.get_all_resumes()
    filtered_resumes = []
    
    for resume in all_resumes:
        # Skip resumes without parsed data
        # Get parsed data safely
        parsed_data = resume.parsed_data or {}
            
        # Search filter
        if search_query:
            searchable_text = ' '.join([
                (parsed_data.get('name') or '').lower(),
                (parsed_data.get('email') or '').lower(),
                ' '.join(parsed_data.get('skills') or []).lower(),
                ' '.join([exp.get('company', '') for exp in (parsed_data.get('experience') or [])]).lower()
            ])
            
            if search_query not in searchable_text:
                continue
        
        # Trust score filter
        if trust_score_filter != 'all':
            if trust_score_filter == 'high' and resume.trust_score < 90:
                continue
            elif trust_score_filter == 'medium' and (resume.trust_score < 70 or resume.trust_score >= 90):
                continue
            elif trust_score_filter == 'low' and (resume.trust_score < 50 or resume.trust_score >= 70):
                continue
            elif trust_score_filter == 'very-low' and resume.trust_score >= 50:
                continue
        
        # Status filter
        if status_filter != 'all':
            current_status = 'verified' if resume.trust_score >= 80 else 'review' if resume.trust_score >= 60 else 'flagged'
            if status_filter != current_status:
                continue
        
        filtered_resumes.append(resume)
    
    # Sort by upload date (newest first)
    filtered_resumes.sort(key=lambda x: x.uploaded_at, reverse=True)
    
    # Pagination
    total = len(filtered_resumes)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_resumes = filtered_resumes[start:end]
    
    # Convert to dict format for JSON response
    resume_data = []
    for resume in paginated_resumes:
        # Ensure parsed_data exists
        parsed_data = resume.parsed_data or {}
        
        status = 'verified' if resume.trust_score >= 80 else 'review' if resume.trust_score >= 60 else 'flagged'
        resume_data.append({
            'id': resume.id,
            'name': parsed_data.get('name') or 'Unknown',
            'email': parsed_data.get('email') or 'No email',
            'filename': resume.filename,
            'upload_date': resume.uploaded_at.strftime('%Y-%m-%d %H:%M'),
            'trust_score': resume.trust_score,
            'status': status,
            'flags_count': len(resume.flags),
            'skills': parsed_data.get('skills') or []
        })
    
    return jsonify({
        'resumes': resume_data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create some sample data for demonstration
    if db.get_stats()['total_resumes'] == 0:
        print("Creating sample data...")
        
        # Sample resume data
        sample_resumes = [
            {
                'filename': 'john_doe_resume.pdf',
                'parsed_data': {
                    'name': 'John Doe',
                    'email': 'john.doe@email.com',
                    'phone': '+1-555-0123',
                    'skills': ['Python', 'JavaScript', 'React', 'Node.js', 'AWS'],
                    'experience': [
                        {'company': 'Google', 'position': 'Software Engineer', 'years': 3},
                        {'company': 'Microsoft', 'position': 'Full Stack Developer', 'years': 2}
                    ],
                    'education': [
                        {'degree': 'Bachelor of Computer Science', 'institution': 'MIT', 'year': 2018}
                    ],
                    'certifications': [
                        {'name': 'AWS Certified', 'issuer': 'Amazon', 'year': 2023}
                    ]
                },
                'trust_score': 92,
                'flags': []
            },
            {
                'filename': 'jane_smith_resume.docx',
                'parsed_data': {
                    'name': 'Jane Smith',
                    'email': 'jane.smith@email.com', 
                    'phone': '+1-555-0456',
                    'skills': ['Java', 'Spring', 'Docker', 'Kubernetes'],
                    'experience': [
                        {'company': 'Unknown Corp', 'position': 'Senior Developer', 'years': 5}
                    ],
                    'education': [
                        {'degree': 'Master of Science', 'institution': 'Unknown University', 'year': 2020}
                    ],
                    'certifications': []
                },
                'trust_score': 67,
                'flags': [
                    {
                        'type': 'unverified_company',
                        'category': 'experience',
                        'severity': 'medium',
                        'message': 'Could not verify employment at Unknown Corp'
                    }
                ]
            },
            {
                'filename': 'suspicious_resume.pdf',
                'parsed_data': {
                    'name': 'Bob Johnson',
                    'email': 'bob@example.com',
                    'skills': ['Python', 'Java', 'C++', 'JavaScript', 'Go', 'Rust', 'PHP'],
                    'experience': [
                        {'company': 'FakeComp Inc', 'position': 'CEO', 'years': 10},
                        {'company': 'Another Fake Co', 'position': 'CTO', 'years': 8}
                    ],
                    'certifications': [
                        {'name': 'Fake Certificate', 'issuer': 'Unknown Authority', 'year': 2023}
                    ]
                },
                'trust_score': 23,
                'flags': [
                    {
                        'type': 'verification_failed',
                        'category': 'experience',
                        'severity': 'high',
                        'message': 'Could not verify employment claims'
                    },
                    {
                        'type': 'skill_stuffing',
                        'category': 'skills',
                        'severity': 'low',
                        'message': 'Unusually high number of skills listed'
                    }
                ]
            }
        ]
        
        for sample_data in sample_resumes:
            resume = Resume(sample_data['filename'], f"uploads/{sample_data['filename']}")
            resume.parsed_data = sample_data['parsed_data']
            resume.trust_score = sample_data['trust_score']
            resume.flags = sample_data['flags']
            resume.status = 'completed'
            
            # Mock verification results
            resume.verification_results = {
                'skills': [
                    {'skill': skill, 'status': 'verified' if resume.trust_score > 80 else 'needs_review', 'confidence': random.randint(60, 95)}
                    for skill in sample_data['parsed_data'].get('skills', [])
                ],
                'experience': [
                    {'company': exp['company'], 'position': exp['position'], 'years': exp['years'], 
                     'status': 'verified' if resume.trust_score > 80 else 'flagged', 'confidence': random.randint(50, 90)}
                    for exp in sample_data['parsed_data'].get('experience', [])
                ],
                'education': [
                    {'degree': edu['degree'], 'institution': edu['institution'], 'year': edu['year'],
                     'status': 'verified' if resume.trust_score > 70 else 'needs_review', 'confidence': random.randint(70, 95)}
                    for edu in sample_data['parsed_data'].get('education', [])
                ],
                'certifications': [
                    {'name': cert['name'], 'issuer': cert['issuer'], 'year': cert['year'],
                     'status': 'verified' if resume.trust_score > 80 else 'flagged', 'confidence': random.randint(60, 90),
                     'blockchain_hash': f"0x{random.randint(100000, 999999):x}" if resume.trust_score > 80 else None}
                    for cert in sample_data['parsed_data'].get('certifications', [])
                ]
            }
            
            db.add_resume(resume)
        
        print("Sample data created successfully!")
    
    app.run(debug=False, host='127.0.0.1', port=5000)
