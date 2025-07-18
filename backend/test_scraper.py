import pytest
import asyncio
from scraper import fetch_products, find_socials, find_contacts

@pytest.mark.asyncio
async def test_fetch_products():
    products = await fetch_products("https://memy.co.in")
    assert isinstance(products, list)
    assert len(products) > 0

@pytest.mark.asyncio
async def test_find_socials():
    socials = await find_socials("https://memy.co.in")
    assert isinstance(socials, dict)

@pytest.mark.asyncio
async def test_find_contacts():
    contacts = await find_contacts("https://memy.co.in")
    assert hasattr(contacts, 'emails')
    assert hasattr(contacts, 'phones')

def test_api_health():
    # Test that the API can be imported
    from main import app
    assert app is not None
