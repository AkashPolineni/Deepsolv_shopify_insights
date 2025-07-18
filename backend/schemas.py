from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional

class Product(BaseModel):
    title: str
    url: str = ""
    price: Optional[float] = None
    image: Optional[str] = None

class FAQ(BaseModel):
    question: str
    answer: str

class Contacts(BaseModel):
    emails: List[str] = []
    phones: List[str] = []

class BrandInsight(BaseModel):
    store_url: HttpUrl
    products: List[Product] = []
    hero_products: List[Product] = []
    privacy_policy: Optional[str] = None
    return_policy: Optional[str] = None
    faqs: List[FAQ] = []
    social_handles: Dict[str, str] = {}
    contacts: Contacts = Contacts()
    about: Optional[str] = None
    important_links: Dict[str, str] = {}
