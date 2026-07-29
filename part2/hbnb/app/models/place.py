from app.models.basemodel import BaseModel

class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner_id):
        super().__init__()
        self.validate_place_data(title, price, latitude, longitude)
        
        self.title = title
        self.description = description
        self.price = float(price)
        self.latitude = float(latitude)
        self.longitude = float(longitude)
        self.owner_id = owner_id
        self._owner = None
        self.reviews = []
        self.amenities = []

        @staticmethod
        def validate_place_data(title, price, latitude, longitude):
            if not title or len(title.strip()) == 0: raise ValueError("Title cannot be empty")
        if float(price) < 0: raise ValueError("Price must be a positive value")
        if not (-90.0 <= float(latitude) <= 90.0): raise ValueError("Latitude must be between -90.0 and 90.0")
        if not (-180.0 <= float(longitude) <= 180.0): raise ValueError("Longitude must be between -180.0 and 180.0")

def update(self, data):
    title = data.get("title", self.title)
    price = data.get("price", self.price)
    latitude = data.get("latitude", self.latitude)
    longitude = data.get("longitude", self.longitude)

    self.validate_place_data(title, price, latitude, longitude)
    super().update(data)

def add_review(self, review):
    """Add a review to the place."""
    self.reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        self.amenities.append(amenity)

    @property
    def owner(self):
        """Return the actual owner object if resolved, otherwise a proxy."""
        if self._owner:
            return self._owner
        
        class OwnerProxy:
            def __init__(self, owner_id):
                self.id = owner_id
                self.first_name = "Unknown"
                self.last_name = "User"
                self.email = "unknown@example.com"
        return OwnerProxy(self.owner_id)

    @owner.setter
    def owner(self, user_obj):
        """Allow setting the actual user object as the owner."""
        self._owner = user_obj
        if user_obj:
            self.owner_id = user_obj.id

    def to_dict(self, detailed=True):
        """Return a dictionary representation."""
        if not detailed:
            return {
                "id": self.id,
                "title": self.title,
                "latitude": self.latitude,
                "longitude": self.longitude
            }

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner": {
                "id": self.owner.id,
                "first_name": self.owner.first_name,
                "last_name": self.owner.last_name,
                "email": self.owner.email
            },
            "amenities": [
                {
                    "id": amenity.id,
                    "name": amenity.name
                }
                for amenity in self.amenities
            ],
            "reviews": [
                {
                    "id": review.id,
                    "text": review.text,
                    "rating": review.rating,
                    "user_id": review.user_id
                }
                for review in self.reviews
            ]
        }