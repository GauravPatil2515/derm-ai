from datetime import datetime
from extensions import db

class SkinAnalysisResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.String(100), nullable=False, unique=True)  # Added for API compatibility
    user_id = db.Column(db.String(50), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    image_filename = db.Column(db.String(255), nullable=True)  # Added for API compatibility
    analysis_result = db.Column(db.Text, nullable=True)  # Legacy field
    analysis_data = db.Column(db.Text, nullable=True)  # New field for structured data
    predicted_condition = db.Column(db.String(200), nullable=True)  # Added for API compatibility
    confidence_score = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<SkinAnalysisResult {self.analysis_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'user_id': self.user_id,
            'image_path': self.image_path,
            'image_filename': self.image_filename,
            'analysis_result': self.analysis_result,
            'analysis_data': self.analysis_data,
            'predicted_condition': self.predicted_condition,
            'confidence_score': self.confidence_score,
            'timestamp': self.timestamp.isoformat()
        }
