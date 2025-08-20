import re
import json
from docx import Document
import PyPDF2
from datetime import datetime
import random

class ResumeParser:
    def __init__(self):
        self.skills_database = [
            'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'Django', 'Flask',
            'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch',
            'Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'DevOps', 'CI/CD'
        ]
    
    def parse_resume(self, file_path):
        """Parse resume and extract structured data"""
        try:
            if file_path.lower().endswith('.docx'):
                return self.parse_docx(file_path)
            elif file_path.lower().endswith('.pdf'):
                return self.parse_pdf(file_path)
            else:
                return None
        except Exception as e:
            print(f"Error parsing resume: {e}")
            return None
    
    def parse_docx(self, file_path):
        """Parse DOCX file and extract information"""
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return self.extract_information(text)
    
    def parse_pdf(self, file_path):
        """Parse PDF file and extract information"""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return self.extract_information(text)
    
    def extract_information(self, text):
        """Extract structured information from text"""
        data = {
            'raw_text': text,
            'name': self.extract_name(text),
            'email': self.extract_email(text),
            'phone': self.extract_phone(text),
            'skills': self.extract_skills(text),
            'experience': self.extract_experience(text),
            'education': self.extract_education(text),
            'certifications': self.extract_certifications(text),
            'parsed_at': datetime.now().isoformat()
        }
        return data
    
    def extract_name(self, text):
        """Extract candidate name from text"""
        lines = text.split('\n')
        # Assume name is in the first few lines
        for line in lines[:5]:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['email', 'phone', '@', 'tel:', 'mobile']):
                # Simple heuristic: if line has 2-4 words and proper case, likely a name
                words = line.split()
                if 2 <= len(words) <= 4 and all(word.istitle() or word.isupper() for word in words):
                    return line
        return "Name Not Found"
    
    def extract_email(self, text):
        """Extract email address from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else None
    
    def extract_phone(self, text):
        """Extract phone number from text"""
        phone_pattern = r'[\+]?[1-9]?[0-9]{7,12}'
        matches = re.findall(phone_pattern, text)
        return matches[0] if matches else None
    
    def extract_skills(self, text):
        """Extract skills from text"""
        found_skills = []
        text_lower = text.lower()
        for skill in self.skills_database:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        return found_skills
    
    def extract_experience(self, text):
        """Extract work experience from text"""
        experience = []
        # Look for company patterns and years
        company_patterns = [
            r'(\w+\s+(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited|Technologies|Tech|Solutions|Systems|Group))',
            r'at\s+([A-Z][a-zA-Z\s&]+)',
            r'worked\s+at\s+([A-Z][a-zA-Z\s&]+)'
        ]
        
        year_pattern = r'(20\d{2}|19\d{2})'
        years = re.findall(year_pattern, text)
        
        for pattern in company_patterns:
            companies = re.findall(pattern, text, re.IGNORECASE)
            for company in companies[:3]:  # Limit to first 3 matches
                experience.append({
                    'company': company.strip(),
                    'years': len([y for y in years if int(y) >= 2015]),  # Estimate years
                    'position': 'Software Developer'  # Default position
                })
        
        return experience
    
    def extract_education(self, text):
        """Extract education information from text"""
        education = []
        degree_patterns = [
            r'(Bachelor[\'s]*\s+(?:of\s+)?(?:Science|Arts|Engineering|Technology|Computer Science))',
            r'(Master[\'s]*\s+(?:of\s+)?(?:Science|Arts|Engineering|Technology|Computer Science))',
            r'(PhD|Ph\.D\.?|Doctorate)',
            r'(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|B\.?Tech|M\.?Tech)',
        ]
        
        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                education.append({
                    'degree': match.strip(),
                    'year': 2020,  # Default year
                    'institution': 'University Name'  # Default institution
                })
        
        return education
    
    def extract_certifications(self, text):
        """Extract certifications from text"""
        cert_keywords = [
            'AWS Certified', 'Azure Certified', 'Google Cloud', 'Certified',
            'Certificate', 'Certification', 'CompTIA', 'Cisco', 'Microsoft',
            'Oracle Certified', 'PMP', 'Scrum Master', 'Kubernetes'
        ]
        
        certifications = []
        for keyword in cert_keywords:
            if keyword.lower() in text.lower():
                certifications.append({
                    'name': keyword,
                    'year': 2023,  # Default year
                    'issuer': 'Certification Body'
                })
        
        return certifications

class VerificationEngine:
    def __init__(self):
        # Mock verification databases
        self.verified_skills = {
            'python': {'github_repos': 45, 'leetcode_solved': 120},
            'javascript': {'github_repos': 32, 'leetcode_solved': 85},
            'react': {'github_repos': 28, 'projects': 15},
            'node.js': {'github_repos': 22, 'npm_packages': 3},
            'machine learning': {'kaggle_competitions': 5, 'papers': 2}
        }
        
        self.verified_companies = {
            'google': True, 'microsoft': True, 'amazon': True, 'apple': True,
            'meta': True, 'netflix': True, 'uber': True, 'airbnb': True
        }
        
        self.verified_institutions = {
            'mit': True, 'stanford': True, 'harvard': True, 'berkeley': True,
            'carnegie mellon': True, 'caltech': True, 'georgia tech': True
        }
    
    def verify_claims(self, parsed_data):
        """Verify all claims in the parsed resume data"""
        results = {
            'skills': self.verify_skills(parsed_data.get('skills', [])),
            'experience': self.verify_experience(parsed_data.get('experience', [])),
            'education': self.verify_education(parsed_data.get('education', [])),
            'certifications': self.verify_certifications(parsed_data.get('certifications', []))
        }
        
        # Calculate overall trust score
        trust_score = self.calculate_trust_score(results)
        
        # Generate flags for suspicious claims
        flags = self.generate_flags(results, parsed_data)
        
        return results, flags, trust_score
    
    def verify_skills(self, skills):
        """Verify technical skills against external data sources"""
        verified_skills = []
        for skill in skills:
            skill_lower = skill.lower()
            verification_status = 'verified' if skill_lower in self.verified_skills else 'unverified'
            
            # Add some randomness for demo purposes
            if verification_status == 'unverified':
                verification_status = random.choice(['unverified', 'needs_review']) if random.random() > 0.7 else 'unverified'
            
            verified_skills.append({
                'skill': skill,
                'status': verification_status,
                'evidence': self.verified_skills.get(skill_lower, {}),
                'confidence': random.randint(60, 95) if verification_status == 'verified' else random.randint(20, 60)
            })
        
        return verified_skills
    
    def verify_experience(self, experience):
        """Verify work experience against company records"""
        verified_experience = []
        for exp in experience:
            company_lower = exp.get('company', '').lower()
            is_verified = any(verified_company in company_lower for verified_company in self.verified_companies.keys())
            
            status = 'verified' if is_verified else 'needs_review'
            if not is_verified and random.random() > 0.8:
                status = 'flagged'
            
            verified_experience.append({
                'company': exp.get('company'),
                'position': exp.get('position'),
                'years': exp.get('years'),
                'status': status,
                'confidence': random.randint(70, 95) if status == 'verified' else random.randint(30, 70)
            })
        
        return verified_experience
    
    def verify_education(self, education):
        """Verify educational credentials"""
        verified_education = []
        for edu in education:
            institution_lower = edu.get('institution', '').lower()
            is_verified = any(verified_inst in institution_lower for verified_inst in self.verified_institutions.keys())
            
            status = 'verified' if is_verified else 'needs_review'
            if not is_verified and random.random() > 0.9:
                status = 'flagged'
            
            verified_education.append({
                'degree': edu.get('degree'),
                'institution': edu.get('institution'),
                'year': edu.get('year'),
                'status': status,
                'confidence': random.randint(75, 98) if status == 'verified' else random.randint(40, 75)
            })
        
        return verified_education
    
    def verify_certifications(self, certifications):
        """Verify professional certifications"""
        verified_certs = []
        for cert in certifications:
            # Simulate blockchain verification
            rand_val = random.random()
            if rand_val < 0.6:
                status = 'verified'
            elif rand_val < 0.9:
                status = 'needs_review'
            else:
                status = 'flagged'
            
            verified_certs.append({
                'name': cert.get('name'),
                'issuer': cert.get('issuer'),
                'year': cert.get('year'),
                'status': status,
                'blockchain_hash': f"0x{random.randint(100000, 999999):x}" if status == 'verified' else None,
                'confidence': random.randint(80, 99) if status == 'verified' else random.randint(25, 80)
            })
        
        return verified_certs
    
    def calculate_trust_score(self, verification_results):
        """Calculate overall trust score based on verification results"""
        total_items = 0
        verified_items = 0
        
        for category, items in verification_results.items():
            for item in items:
                total_items += 1
                if item.get('status') == 'verified':
                    verified_items += 1
        
        if total_items == 0:
            return 0
        
        base_score = (verified_items / total_items) * 100
        
        # Apply penalties for flagged items
        flagged_penalty = sum(1 for category in verification_results.values() 
                             for item in category if item.get('status') == 'flagged') * 10
        
        final_score = max(0, base_score - flagged_penalty)
        return round(final_score, 1)
    
    def generate_flags(self, verification_results, parsed_data):
        """Generate flags for suspicious or inconsistent claims"""
        flags = []
        
        # Check for flagged items
        for category, items in verification_results.items():
            for item in items:
                if item.get('status') == 'flagged':
                    flags.append({
                        'type': 'verification_failed',
                        'category': category,
                        'item': item.get('skill') or item.get('company') or item.get('name'),
                        'severity': 'high',
                        'message': f"Could not verify {category} claim"
                    })
        
        # Check for inconsistencies
        experience = parsed_data.get('experience', [])
        if len(experience) > 5:
            flags.append({
                'type': 'excessive_experience',
                'category': 'experience',
                'severity': 'medium',
                'message': f"Unusually high number of work experiences ({len(experience)})"
            })
        
        skills = parsed_data.get('skills', [])
        if len(skills) > 20:
            flags.append({
                'type': 'skill_stuffing',
                'category': 'skills',
                'severity': 'low',
                'message': f"Possible skill stuffing detected ({len(skills)} skills listed)"
            })
        
        return flags
