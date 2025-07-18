import httpx
from bs4 import BeautifulSoup

async def fetch_competitors(store_url: str, max_results=3):
   
    search_url = f"https://duckduckgo.com/html?q=related:{store_url}"
    async with httpx.AsyncClient() as session:
        resp = await session.get(search_url)
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")
        # DuckDuckGo's result links are in <a class="result__a"...>
        links = [a['href'] for a in soup.select('a.result__a') if a['href'].startswith('http')]
        # Filter to just Shopify stores (very basic)
        return [url for url in links if "shopify" in url or "/products/" in url][:max_results]
