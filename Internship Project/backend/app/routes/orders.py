from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.order import Order
from app.models.return_request import ReturnRequest
from app.models.gift_package import GiftPackage
from app.models.user import User
import uuid
import json

orders_bp = Blueprint('orders', __name__)

# Products Route (Gift Packages)
@orders_bp.route('/products', methods=['GET'])
def get_products():
    packages = GiftPackage.query.all()
    return jsonify({"success": True, "data": [p.to_dict() for p in packages]})

# Orders Routes
@orders_bp.route('/orders', methods=['GET'])
@jwt_required(optional=True)
def get_orders():
    orders = Order.query.all()
    return jsonify({"success": True, "data": [o.to_dict() for o in orders]})

@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    user = User.query.filter_by(public_id=get_jwt_identity()).first()
    
    order = Order(
        public_id=f"ORD-{uuid.uuid4().hex[:6].upper()}",
        customer_name=data.get('userName', user.name if user else 'Unknown'),
        customer_email=data.get('customerEmail', user.email if user else 'Unknown'),
        company_name=data.get('companyName', user.company if user else ''),
        total=data.get('total', 0.0),
        status='Pending',
        items_json=json.dumps(data.get('cart', []))
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({"success": True, "data": order.to_dict()}), 201

@orders_bp.route('/orders/<public_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(public_id):
    data = request.get_json()
    order = Order.query.filter_by(public_id=public_id).first_or_404()
    if 'status' in data:
        order.status = data['status']
    db.session.commit()
    return jsonify({"success": True, "data": order.to_dict()})

# Return Requests Routes
@orders_bp.route('/returns', methods=['GET'])
@jwt_required(optional=True)
def get_returns():
    reqs = ReturnRequest.query.all()
    return jsonify({"success": True, "data": [r.to_dict() for r in reqs]})

@orders_bp.route('/returns', methods=['POST'])
@jwt_required()
def create_return():
    data = request.get_json()
    user = User.query.filter_by(public_id=get_jwt_identity()).first()
    
    req = ReturnRequest(
        public_id=f"RET-{uuid.uuid4().hex[:6].upper()}",
        order_id=data.get('orderId', ''),
        customer_name=user.name if user else 'Unknown',
        customer_email=user.email if user else 'Unknown',
        company_name=user.company if user else '',
        item_name=data.get('itemName', ''),
        reason=data.get('reason', ''),
        photo_data=data.get('photoData', None),
        description=data.get('description', None),
        preferred_resolution=data.get('preferredResolution', None),
        status='Pending'
    )
    db.session.add(req)
    db.session.commit()
    return jsonify({"success": True, "data": req.to_dict()}), 201

@orders_bp.route('/returns/<public_id>/status', methods=['PATCH'])
@jwt_required()
def update_return_status(public_id):
    data = request.get_json()
    req = ReturnRequest.query.filter_by(public_id=public_id).first_or_404()
    if 'status' in data:
        req.status = data['status']
    if 'adminNote' in data:
        req.admin_note = data['adminNote']
    if 'resolutionNote' in data:
        req.resolution_note = data['resolutionNote']
        
    db.session.commit()
    return jsonify({"success": True, "data": req.to_dict()})
