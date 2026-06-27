from app.extensions import db
from datetime import datetime

class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False) # e.g. RET-9876
    order_id = db.Column(db.String(50), nullable=False) # Refers to Order public_id
    
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(150), nullable=False)
    company_name = db.Column(db.String(150), nullable=True)
    
    item_name = db.Column(db.String(255), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    
    admin_note = db.Column(db.Text, nullable=True)
    resolution_note = db.Column(db.Text, nullable=True)
    photo_data = db.Column(db.Text, nullable=True) # Base64 encoded image
    description = db.Column(db.Text, nullable=True)
    preferred_resolution = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.public_id,
            'orderId': self.order_id,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'companyName': self.company_name,
            'itemName': self.item_name,
            'reason': self.reason,
            'status': self.status,
            'adminNote': self.admin_note,
            'resolutionNote': self.resolution_note,
            'photoData': self.photo_data,
            'description': self.description,
            'preferredResolution': self.preferred_resolution,
            'date': self.created_at.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'updated': self.updated_at.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
