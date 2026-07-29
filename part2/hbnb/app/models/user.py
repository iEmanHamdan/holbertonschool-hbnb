import re

from app.models.basemodel import BaseModel
import re

class User(BaseModel):

    EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
        
    def __init__(self, first_name, last_name, email, is_admin=False):
        super().__init__()

        if not first_name or len(first_name) > 50:
            raise ValueError("First name is required and max 50 chars")
        if not last_name or len(last_name) > 50:
            raise ValueError("Last name is required and max 50 chars")
        if not email:
            raise ValueError("Email is required")
            
        self.first_name = first_name
        self.last_name = last_name
        self.email = self.validate_email(email)   
        self.is_admin = is_admin

@staticmethod
def validate_user_data(first_name, last_name, email):
        if not first_name or len(first_name) > 50:
            raise ValueError("First name is required and max 50 chars")
        if not last_name or len(last_name) > 50:
            raise ValueError("Last name is required and max 50 chars")
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not email or not re.match(email_regex, email):
            raise ValueError("A valid email is required")
        def update(self, data):
            first_name = data.get('first_name', self.first_name)
            last_name = data.get('last_name', self.last_name)
            email = data.get('email', self.email)
            self.validate_user_data(first_name, last_name, email)
            super().update(data)
            
        @classmethod
    def validate_email(cls, email):
        """Validate and return a normalized email address."""
        if not isinstance(email, str) or not email.strip():
            raise ValueError("Email is required")

        email = email.strip().lower()

        if not cls.EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Invalid email format")

        return email

    def to_dict(self):
              return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }
