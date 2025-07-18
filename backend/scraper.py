import re
from typing import List, Dict, Optional
import httpx
from bs4 import BeautifulSoup
from schemas import Product, FAQ, Contacts

# --- Helper to get and parse html --- #
async def fetch_html(session: httpx.AsyncClient, url: str) -> Optional[BeautifulSoup]:
    try:
        resp = await session.get(url, timeout=10)
        if resp.status_code == 200:
            return BeautifulSoup(resp.text, "html.parser")
    except Exception:
        pass
    return None

async def fetch_products(store_url: str) -> List[Product]:
    products: List[Product] = []
    async with httpx.AsyncClient() as session:
        page = 1
        while True:
            url = f"{store_url.rstrip('/')}/products.json?limit=250&page={page}"
            resp = await session.get(url)
            if resp.status_code != 200:
                break
            data = resp.json().get("products", [])
            if not data:
                break
            for item in data:
                products.append(
                    Product(
                        title=item.get("title", ""),
                        url=f"{store_url.rstrip('/')}/products/{item.get('handle', '')}",
                        price=float(item.get("variants", [{}])[0].get("price", 0)),
                        image=item.get("image", {}).get("src", ""),
                    )
                )
            page += 1
    return products

async def fetch_hero_products(store_url: str) -> List[Product]:
    hero: List[Product] = []
    async with httpx.AsyncClient() as session:
        soup = await fetch_html(session, store_url)
        if not soup:
            return hero
        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            if "/products/" in href and tag.text.strip():
                abs_url = href if href.startswith("http") else store_url.rstrip("/") + href
                hero.append(Product(title=tag.text.strip(), url=abs_url))
            if len(hero) >= 8:
                break
    return hero

async def _find_policy(store_url: str, keywords: List[str]) -> Optional[str]:
    async with httpx.AsyncClient() as session:
        soup = await fetch_html(session, store_url)
        if not soup:
            return None
        for link in soup.find_all("a", href=True):
            if any(k in link.text.lower() for k in keywords):
                href = link["href"]
                page = await fetch_html(session, href if href.startswith("http") else store_url.rstrip("/") + href)
                if page:
                    return page.get_text(separator="\n").strip()
    return None

async def fetch_faqs(store_url: str) -> List[FAQ]:
    async with httpx.AsyncClient() as session:
        soup = await fetch_html(session, store_url)
        if not soup:
            return []
        faq_link = next(
            (
                a["href"]
                for a in soup.find_all("a", href=True)
                if any(k in (a.text + a["href"]).lower() for k in ["faq", "question"])
            ),
            None,
        )
        if not faq_link:
            return []
        page = await fetch_html(session, faq_link if faq_link.startswith("http") else store_url.rstrip("/") + faq_link)
        if not page:
            return []
        faqs: List[FAQ] = []
        blocks = page.find_all(["p", "li"])
        for idx, blk in enumerate(blocks):
            text = blk.get_text(strip=True)
            q_match = re.match(r"Q[:\-]?\s*(.+)", text, flags=re.I)
            if q_match:
                question = q_match.group(1)
                answer = ""
                if idx + 1 < len(blocks):
                    answer = blocks[idx + 1].get_text(strip=True)
                faqs.append(FAQ(question=question, answer=answer))
        return faqs

async def find_socials(store_url: str) -> Dict[str, str]:
    async with httpx.AsyncClient() as session:
        socials: Dict[str, str] = {}
        soup = await fetch_html(session, store_url)
        if not soup:
            return socials
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "instagram" in href and "instagram" not in socials:
                socials["instagram"] = href
            elif "facebook" in href and "facebook" not in socials:
                socials["facebook"] = href
            elif "twitter" in href and "twitter" not in socials:
                socials["twitter"] = href
            elif "tiktok" in href and "tiktok" not in socials:
                socials["tiktok"] = href
        return socials

async def find_contacts(store_url: str) -> Contacts:
    async with httpx.AsyncClient() as session:
        soup = await fetch_html(session, store_url)
        if not soup:
            return Contacts()
        text = soup.get_text()
        emails = list(set(re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)))
        phones = list(set(re.findall(r"\+?\d[\d\s\-]{7,}\d", text)))
        return Contacts(emails=emails, phones=phones)

async def find_about(store_url: str) -> Optional[str]:
    async with httpx.AsyncClient() as session:
        soup = await fetch_html(session, store_url)
        if not soup:
            return None
        about_link = next(
            (a["href"] for a in soup.find_all("a", href=True) if "about" in (a.text + a["href"]).lower()), None
        )
        if not about_link:
            return None
        page = await fetch_html(session, about_link if about_link.startswith("http") else store_url.rstrip("/") + about_link)
        return page.get_text(separator="\n").strip() if page else None

async def find_important_links(store_url: str) -> Dict[str, str]:
    async with httpx.AsyncClient() as session:
        links: Dict[str, str] = {}
        soup = await fetch_html(session, store_url)
        if not soup:
            return links
        mapping = {"order_tracking": ["track", "tracking"], "contact_us": ["contact"], "blog": ["blog"]}
        for a in soup.find_all("a", href=True):
            txt = a.text.lower()
            for key, kws in mapping.items():
                if any(kw in txt for kw in kws) and key not in links:
                    links[key] = a["href"]
        return links
