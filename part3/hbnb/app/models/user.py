import re

from app.models.basemodel import BaseModel

class User(BaseModel):        
    def __init__(self, first_name, last_name, email, is_admin=False):
        super().__init__()
        self.validate_user_data(first_name, last_name, email)
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin

@staticmethod
def validate_user_data(first_name, last_name, email):
        if not first_name or len(first_name) > 50: raise ValueError("First name is required and max 50 chars")
        if not last_name or len(last_name) > 50: raise ValueError("Last name is required and max 50 chars")
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not email or not re.match(email_regex, email): raise ValueError("A valid email is required")
        
def update(self, data):
            first_name = data.get('first_name', self.first_name)
            last_name = data.get('last_name', self.last_name)
            email = data.get('email', self.email)
            
            self.validate_user_data(first_name, last_name, email)
            super().update(data)
            

def to_dict(self):
              return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }
