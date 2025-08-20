from datetime import datetime
import json
import os

class Resume:
    def __init__(self, filename, file_path, uploaded_at=None):
        self.id = self.generate_id()
        self.filename = filename
        self.file_path = file_path
        self.uploaded_at = uploaded_at or datetime.now()
        self.status = 'pending'  # pending, processing, completed, error
        self.parsed_data = {}
        self.verification_results = {}
        self.trust_score = 0
        self.flags = []
    
    def generate_id(self):
        return str(int(datetime.now().timestamp() * 1000))
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_path': self.file_path,
            'uploaded_at': self.uploaded_at.isoformat(),
            'status': self.status,
            'parsed_data': self.parsed_data,
            'verification_results': self.verification_results,
            'trust_score': self.trust_score,
            'flags': self.flags
        }
    
    @classmethod
    def from_dict(cls, data):
        resume = cls(data['filename'], data['file_path'])
        resume.id = data['id']
        resume.uploaded_at = datetime.fromisoformat(data['uploaded_at'])
        resume.status = data['status']
        resume.parsed_data = data['parsed_data']
        resume.verification_results = data['verification_results']
        resume.trust_score = data['trust_score']
        resume.flags = data['flags']
        return resume

class ResumeDatabase:
    def __init__(self, db_file='resume_data.json'):
        self.db_file = db_file
        self.resumes = self.load_resumes()
    
    def load_resumes(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {r_id: Resume.from_dict(r_data) for r_id, r_data in data.items()}
            except Exception as e:
                print(f"Error loading resume database: {e}")
                return {}
        return {}
    
    def save_resumes(self):
        try:
            data = {r_id: resume.to_dict() for r_id, resume in self.resumes.items()}
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving resume database: {e}")
    
    def add_resume(self, resume):
        self.resumes[resume.id] = resume
        self.save_resumes()
        return resume.id
    
    def get_resume(self, resume_id):
        return self.resumes.get(resume_id)
    
    def get_all_resumes(self):
        return list(self.resumes.values())
    
    def update_resume(self, resume_id, **kwargs):
        if resume_id in self.resumes:
            for key, value in kwargs.items():
                setattr(self.resumes[resume_id], key, value)
            self.save_resumes()
            return True
        return False
    
    def get_stats(self):
        resumes = list(self.resumes.values())
        total = len(resumes)
        
        if total == 0:
            return {
                'total_resumes': 0,
                'completed': 0,
                'pending': 0,
                'avg_trust_score': 0,
                'verification_rate': 0,
                'fraud_alerts': 0
            }
        
        completed = sum(1 for r in resumes if r.status == 'completed')
        pending = sum(1 for r in resumes if r.status in ['pending', 'processing'])
        avg_trust = sum(r.trust_score for r in resumes if r.status == 'completed') / max(completed, 1)
        fraud_alerts = sum(len(r.flags) for r in resumes)
        
        return {
            'total_resumes': total,
            'completed': completed,
            'pending': pending,
            'avg_trust_score': round(avg_trust, 1),
            'verification_rate': round((completed / total) * 100, 1) if total > 0 else 0,
            'fraud_alerts': fraud_alerts
        }
