from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import HttpUrl
from sqlalchemy.orm import Session
from schemas import BrandInsight
from models import Base, Brand, Product as DBProduct, FAQ as DBFAQ
from database import engine, get_db
import scraper
import asyncio

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Shopify Insights Fetcher – visit /docs for API usage"}

@app.post("/fetch-shopify-insights", response_model=BrandInsight)
async def fetch_shopify_insights(website_url: HttpUrl, db: Session = Depends(get_db)):
    url = str(website_url)
    try:
        # Fetch all data concurrently
        products, hero, privacy, ret, faqs, socials, contacts, about, links = await asyncio.gather(
            scraper.fetch_products(url),
            scraper.fetch_hero_products(url),
            scraper._find_policy(url, ["privacy"]),
            scraper._find_policy(url, ["return", "refund"]),
            scraper.fetch_faqs(url),
            scraper.find_socials(url),
            scraper.find_contacts(url),
            scraper.find_about(url),
            scraper.find_important_links(url),
            return_exceptions=True
        )
        
        # Handle exceptions
        if isinstance(products, Exception): products = []
        if isinstance(hero, Exception): hero = []
        if isinstance(faqs, Exception): faqs = []
        if isinstance(socials, Exception): socials = {}
        if isinstance(contacts, Exception): contacts = {"emails": [], "phones": []}
        if isinstance(links, Exception): links = {}
        
        # Save to database
        existing_brand = db.query(Brand).filter(Brand.url == url).first()
        if existing_brand:
            # Update existing
            existing_brand.about = about
            existing_brand.privacy_policy = privacy
            existing_brand.return_policy = ret
            brandobj = existing_brand
        else:
            # Create new
            brandobj = Brand(url=url, about=about, privacy_policy=privacy, return_policy=ret)
            db.add(brandobj)
        
        db.flush()  # Get the ID
        
        # Clear old products and FAQs
        db.query(DBProduct).filter(DBProduct.brand_id == brandobj.id).delete()
        db.query(DBFAQ).filter(DBFAQ.brand_id == brandobj.id).delete()
        
        # Add new products
        for p in products:
            db.add(DBProduct(title=p.title, url=p.url, price=p.price, image=p.image, brand_id=brandobj.id))
        
        # Add new FAQs
        for f in faqs:
            db.add(DBFAQ(question=f.question, answer=f.answer, brand_id=brandobj.id))
        
        db.commit()
        
        return BrandInsight(
            store_url=url, products=products, hero_products=hero,
            privacy_policy=privacy, return_policy=ret, faqs=faqs,
            social_handles=socials, contacts=contacts,
            about=about, important_links=links
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# BONUS: Get all stored brands
@app.get("/brands")
def get_all_brands(db: Session = Depends(get_db)):
    brands = db.query(Brand).all()
    return [{"id": b.id, "url": b.url, "about": b.about} for b in brands]

# BONUS: Get competitor analysis
@app.post("/competitors")
async def get_competitors(website_url: HttpUrl, db: Session = Depends(get_db)):
    url = str(website_url)
    try:
        # Import competitor module
        from competitor import fetch_competitors
        
        competitor_urls = await fetch_competitors(url, max_results=3)
        competitors_data = []
        
        for comp_url in competitor_urls:
            try:
                # Fetch insights for each competitor
                comp_insights = await fetch_shopify_insights(comp_url, db)
                competitors_data.append(comp_insights)
            except:
                continue
        
        return {
            "original_store": url,
            "competitors": competitors_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
