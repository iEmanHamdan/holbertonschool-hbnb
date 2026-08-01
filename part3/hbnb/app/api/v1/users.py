from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('users', description='User operations')

user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})

user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(required=False, description='First name of the user'),
    'last_name': fields.String(required=False, description='Last name of the user'),
    'email': fields.String(required=False, description='Email of the user')
})

@api.route('/')
class UserList(Resource):
    """Resource for user list operations (Get, Post)"""

    @api.response(200, 'Users successfully retrieved')
    def get(self):
        """Get all users"""
        users = facade.get_all_users()
        return [user.to_dict() for user in users], 200

    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a new user account with unique email """
        user_data = api.payload

        try:
            existing_user = facade.get_user_by_email(user_data['email'])

            if existing_user:
                return {"error": "Email already registered"}, 400

            new_user = facade.create_user(user_data) # after user submet and fill the form , here we will send the data to facad

            return {"id": new_user.id, "message": "User created successfully"}, 201
        except (ValueError, TypeError) as error:
            return {"error": str(error)}, 400


@api.route('/<string:user_id>')
@api.param("user_id", "The unique identifier of the user")

class UserResource(Resource):
    """Resource for individual user operations"""

    @api.response(200, 'User successfully retrieved')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Retrieve a user by ID"""
        user = facade.get_user(user_id)
        if not user:
             return {"error": "User not found"}, 404
        return user.to_dict(), 200

    @api.expect(user_update_model, validate=True)
    @api.response(200, 'User successfully updated')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Bad Request')
    @api.response(404, 'User not found')
    def put(self, user_id):
        """Update an existing user"""

        user_data = api.payload

        try:
            user = facade.get_user(user_id)

            if not user:
                return {'error': 'User not found'}, 404

            if not user_data:
                return {"error": "No update data provided"}, 400

            if "email" in user_data:
                existing_user = facade.get_user_by_email(user_data["email"])

                if existing_user and existing_user.id != user_id:
                    return {"error": "Email already registered"}, 400

                updated_user = facade.update_user(user_id, user_data)
                if not updated_user:
                    return {"error": "User not found"}, 404

                return updated_user.to_dict(), 200

        except (ValueError, TypeError) as error:
                return {
                    "error": str(error)}, 400
