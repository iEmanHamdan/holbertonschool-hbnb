import re
from app import bcrypt
from app.models.basemodel import BaseModel

class User(BaseModel):        
    def __init__(self, first_name, last_name, email, password, is_admin=False):

        super().__init__()

        self.validate_user_data(first_name, last_name, email)
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.hash_password(password)

        """this will reject to create a user if the password is not provided"""
        if not password:
            raise ValueError("Password is required")

        if not isinstance(password, str) or len(password) < 6:
            raise ValueError("Password must be a string with at least 6 characters")

        
@staticmethod
def validate_user_data(first_name, last_name, email):
        if not first_name or len(first_name) > 50: raise ValueError("First name is required and max 50 chars")
        if not last_name or len(last_name) > 50: raise ValueError("Last name is required and max 50 chars")
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not email or not re.match(email_regex, email): raise ValueError("A valid email is required")

def hash_password(self, password):
        """Hash password befroe storing it"""
        """in this fuction we will take the password and hash it using bcrypt and store the hashed password in the password attribute(self.password)"""
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

def verify_password(self, password):
        """Check whether a password matches with the stored hash"""

        return bcrypt.check_password_hash(self.password,password)

def update(self, data):
            first_name = data.get('first_name', self.first_name)
            last_name = data.get('last_name', self.last_name)
            email = data.get('email', self.email)
            
            self.validate_user_data(first_name, last_name, email)

            allowed_data = {key: value for key, value in data.items()
            if key in {"first_name", "last_name", "email"}}

            if "first_name" in allowed_data:
                allowed_data["first_name"] = (
                allowed_data["first_name"].strip()
            )

            if "last_name" in allowed_data:
                allowed_data["last_name"] = (
                allowed_data["last_name"].strip()
            )

            if "email" in allowed_data:
                allowed_data["email"] = (
                allowed_data["email"].strip().lower()
            )

            super().update(allowed_data)

def to_dict(self):
              """Return public data of user but without password"""
              return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }
