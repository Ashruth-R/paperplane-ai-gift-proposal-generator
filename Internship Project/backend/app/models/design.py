from app.extensions import db
from datetime import datetime

class PersonalizedDesign(db.Model):
    __tablename__ = 'personalized_designs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False) # e.g. DES-101
    
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(150), nullable=False)
    company_name = db.Column(db.String(150), nullable=True)
    
    product_id = db.Column(db.String(50), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    
    custom_text = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(50), nullable=True)
    logo_url = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    status = db.Column(db.String(50), nullable=False, default='Pending') # Pending, Approved, Rejected
    admin_feedback = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.public_id,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'companyName': self.company_name,
            'productId': self.product_id,
            'productName': self.product_name,
            'customText': self.custom_text,
            'color': self.color,
            'logoUrl': self.logo_url,
            'notes': self.notes,
            'status': self.status,
            'adminFeedback': self.admin_feedback,
            'createdAt': self.created_at.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
