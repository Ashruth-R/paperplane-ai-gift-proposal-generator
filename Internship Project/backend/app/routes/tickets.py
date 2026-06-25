from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.ticket import Ticket
from app.models.user import User
import uuid
import json

tickets_bp = Blueprint('tickets', __name__)

@tickets_bp.route('/tickets', methods=['GET'])
@jwt_required(optional=True)
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify({"success": True, "data": [t.to_dict() for t in tickets]})

@tickets_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    data = request.get_json()
    user = User.query.filter_by(public_id=get_jwt_identity()).first()
    
    ticket = Ticket(
        public_id=f"TKT-{uuid.uuid4().hex[:6].upper()}",
        customer_name=user.name if user else data.get('customerName', 'Unknown'),
        customer_email=user.email if user else data.get('customerEmail', 'Unknown'),
        company_name=user.company if user else data.get('companyName', ''),
        subject=data.get('subject', 'No Subject'),
        status='Open',
        priority=data.get('priority', 'Medium'),
        chat_history_json=json.dumps([{"sender": "customer", "message": data.get('message', ''), "timestamp": "Now"}]) if data.get('message') else "[]"
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({"success": True, "data": ticket.to_dict()}), 201

@tickets_bp.route('/tickets/<public_id>/status', methods=['PATCH'])
@jwt_required()
def update_ticket_status(public_id):
    data = request.get_json()
    ticket = Ticket.query.filter_by(public_id=public_id).first_or_404()
    
    if 'status' in data:
        ticket.status = data['status']
    if 'assignedTo' in data:
        ticket.assigned_to = data['assignedTo']
        
    db.session.commit()
    return jsonify({"success": True, "data": ticket.to_dict()})

@tickets_bp.route('/tickets/<public_id>/message', methods=['POST'])
@jwt_required()
def add_ticket_message(public_id):
    data = request.get_json()
    ticket = Ticket.query.filter_by(public_id=public_id).first_or_404()
    
    history = json.loads(ticket.chat_history_json or "[]")
    history.append({
        "sender": data.get('role', 'admin'),
        "message": data.get('message', ''),
        "timestamp": "Now"
    })
    ticket.chat_history_json = json.dumps(history)
    db.session.commit()
    
    return jsonify({"success": True, "data": ticket.to_dict()})
