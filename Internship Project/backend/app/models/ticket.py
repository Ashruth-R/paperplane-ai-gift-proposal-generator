from app.extensions import db
from datetime import datetime
import json

class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False) # e.g. TKT-001
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(150), nullable=False)
    company_name = db.Column(db.String(150), nullable=True)
    subject = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Open')
    priority = db.Column(db.String(50), nullable=False, default='Medium')
    assigned_to = db.Column(db.String(100), nullable=True)
    
    # Store chat history as JSON string for simplicity instead of a separate table for now
    chat_history_json = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        history = []
        if self.chat_history_json:
            try:
                history = json.loads(self.chat_history_json)
            except:
                history = []
                
        return {
            'id': self.public_id,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'companyName': self.company_name,
            'subject': self.subject,
            'status': self.status,
            'priority': self.priority,
            'assignedTo': self.assigned_to,
            'chatHistory': history,
            'created': self.created_at.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'updated': self.updated_at.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
