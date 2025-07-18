import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from scraper import fetch_products, find_socials, find_contacts

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Shopify Insights Fetcher" in response.json()["message"]

def test_docs_endpoint():
    response = client.get("/docs")
    assert response.status_code == 200

def test_openapi_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()

@pytest.mark.asyncio
async def test_fetch_products():
    products = await fetch_products("https://memy.co.in")
    assert isinstance(products, list)
    assert len(products) >= 0

@pytest.mark.asyncio
async def test_find_socials():
    socials = await find_socials("https://memy.co.in")
    assert isinstance(socials, dict)

@pytest.mark.asyncio
async def test_find_contacts():
    contacts = await find_contacts("https://memy.co.in")
    assert hasattr(contacts, 'emails')
    assert hasattr(contacts, 'phones')
    assert isinstance(contacts.emails, list)
    assert isinstance(contacts.phones, list)

def test_fetch_insights_endpoint():
    response = client.post("/fetch-shopify-insights?website_url=https://memy.co.in")
    assert response.status_code == 200
    data = response.json()
    assert "store_url" in data
    assert "products" in data
    assert "social_handles" in data
