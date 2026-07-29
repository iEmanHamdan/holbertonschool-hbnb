from app.models.basemodel import BaseModel

class Review(BaseModel):
    def __init__(self, text, rating, place_id, user_id):
        super().__init__()
        self.validate_review_data(text, rating)

        self.text = text
        self.rating = int(rating)
        self.place_id = place_id
        self.user_id = user_id

@staticmethod
def validate_review_data(text, rating):
    if not text:
        raise ValueError("Review text cannot be empty")
    if not (1<= int(rating) <=5):
        raise ValueError("Rating must be an integer between 1 and 5")

    def update(self, data):
        text = data.get('text', self.text)
        rating = data.get('rating', self.rating)

        self.validate_review_data(text, rating)
        super().update(data)


        def to_dict(self):
            return {
                "id": self.id,
                "text": self.text,
                "rating": self.rating,
                "user_id": self.user_id,
                "place_id": self.place_id
            }