from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True)
    url = Column(String(256), unique=True, nullable=False)
    about = Column(Text)
    privacy_policy = Column(Text)
    return_policy = Column(Text)
    # other fields as needed

    products = relationship("Product", back_populates="brand")
    faqs = relationship("FAQ", back_populates="brand")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    title = Column(String(256))
    url = Column(String(512))
    price = Column(Float)
    image = Column(String(512))
    brand_id = Column(Integer, ForeignKey("brands.id"))

    brand = relationship("Brand", back_populates="products")

class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True)
    question = Column(Text)
    answer = Column(Text)
    brand_id = Column(Integer, ForeignKey("brands.id"))

    brand = relationship("Brand", back_populates="faqs")
