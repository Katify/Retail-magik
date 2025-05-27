import httpx
from selectolax.parser import HTMLParser

url = "https://vidplay.top/"
headers = {"user-agent": "mozilla/5.0 (x11; linux x86_64; rv:137.0) gecko/20100101 firefox/137.0"}

response = httpx.get(url, headers=headers)
html = HTMLParser(response.text)
movies = html.css("div.trendingmovz figure ")
shows = html.css("div.trendingshowz figure")

def extract_text(html, sel):
   return html.css_first(sel).text(strip=True)


print("Trending movies")
for movie in movies:

    item = {'Name' :extract_text(movie, ".title"),
            'Quality' :(movie.css_first("span").text()),
            }
    print(item)

print("Trending shows")
for show in shows:
    stuff = {
        'Name': extract_text(show, ".title"),
        'rating': extract_text(show, '.rating'),
    }
    clean_stuff = {key:value.replace("\n", "") if isinstance(value, str)else value for key, value in stuff.items()}
    print(stuff)

