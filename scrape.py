import httpx
from selectolax.parser import HTMLParser

url = "https://vidplay.top/"
headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0"}

response = httpx.get(url, headers=headers)
html = HTMLParser(response.text)
movies = html.css("div.trendingmovz figure ")
shows = html.css("div.trendingshowz figure")

def extract_text(html, sel):
   return html.css_first(sel).text()


print("Trending Movies")
for movie in movies:

    item = {'name' :extract_text(movie, ".title"),
            'quality' :(movie.css_first("span").text()),
            }
    print(item)

print("Trending shows")
for show in shows:
    stuff = {
        'name': extract_text(show, ".title"),
        'rating': extract_text(show. ".rating"),
    }

