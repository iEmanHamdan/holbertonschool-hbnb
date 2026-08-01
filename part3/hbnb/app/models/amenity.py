from app.models.basemodel import BaseModel

class Amenity(BaseModel):
    def __init__(self, name, description=""):
        super().__init__()
        self.validate_amenity_data(name)

        self.name = name
        self.description = description

    @staticmethod
    def validate_amenity_data(name):
        if not name or len(name.strip()) == 0:
            raise ValueError("Amenity name cannot be empty")
    def update(self, data):
        name = data.get('name', self.name)

        self.validate_amenity_data(name)
        super().update(data)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }
    