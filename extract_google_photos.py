import time
import os
import json
import re
import shutil
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
COUNT_FILE = os.path.join(BASE_DIR, "assets", "_downloaded.json")
SIGNAL_FILE = os.path.join(BASE_DIR, "assets", "_ready.txt")

def get_next_number():
    existing = [f for f in os.listdir(ASSETS_DIR) if f.startswith("arpa_memory_") and f.endswith(".jpg")]
    if not existing:
        return 161
    nums = []
    for f in existing:
        m = re.search(r"arpa_memory_(\d+)\.jpg", f)
        if m:
            nums.append(int(m.group(1)))
    return max(nums) + 1 if nums else 161

def save_record(records):
    with open(COUNT_FILE, "w") as f:
        json.dump(records, f, indent=2)

def load_record():
    if os.path.exists(COUNT_FILE):
        with open(COUNT_FILE) as f:
            return json.load(f)
    return []

if os.path.exists(SIGNAL_FILE):
    os.remove(SIGNAL_FILE)

options = Options()
options.add_argument("--no-first-run")
options.add_argument("--no-default-browser-check")
options.add_argument("--disable-blink-features=AutomationControlled")

driver = webdriver.Chrome(options=options)
driver.get("https://photos.google.com")

print("\n" + "="*60)
print("  Google Photos Extractor for Arpa's Luna")
print("="*60)
print("\n1. Log into your Google account in the opened Chrome")
print("2. Navigate to the photos you want to extract")
print("3. Run this command in terminal (while Chrome stays open):")
print(f'    echo ready > "{SIGNAL_FILE}"')
print("\nWaiting for signal file...")

while not os.path.exists(SIGNAL_FILE):
    time.sleep(2)

os.remove(SIGNAL_FILE)
print("Signal received! Starting extraction...")

for i in range(12):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    print(f"  Scrolled {i+1}/12...")

time.sleep(2)

image_urls = set()
selectors = [
    "img[src*='googleusercontent']",
    "img[src*='lh3.googleusercontent']",
    "img[src*='ggpht']",
]

for sel in selectors:
    try:
        els = driver.find_elements(By.CSS_SELECTOR, sel)
        for el in els:
            src = el.get_attribute("src")
            if src and ("googleusercontent" in src or "ggpht" in src or "lh3" in src):
                base = src.split("=")[0]
                image_urls.add(base + "=w800-h800")
    except:
        pass

existing_record = load_record()
existing_bases = {r.get("url", "").split("=")[0] for r in existing_record}

new_urls = []
seen_bases = set()
for u in image_urls:
    b = u.split("=")[0]
    if b not in existing_bases and b not in seen_bases:
        new_urls.append(u)
        seen_bases.add(b)

print(f"\nFound {len(image_urls)} total, {len(new_urls)} new")

if new_urls:
    next_num = get_next_number()
    downloaded = []
    for i, url in enumerate(new_urls):
        filename = f"arpa_memory_{next_num + i}.jpg"
        filepath = os.path.join(ASSETS_DIR, filename)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as response:
                with open(filepath, "wb") as f:
                    shutil.copyfileobj(response, f)
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  [{i+1}/{len(new_urls)}] {filename} ({size_kb:.0f} KB)")
            downloaded.append({"num": next_num + i, "filename": filename, "url": url})
        except Exception as e:
            print(f"  [{i+1}/{len(new_urls)}] Failed: {e}")

    save_record(existing_record + downloaded)
    print(f"\nDownloaded {len(downloaded)} new images.")
    if downloaded:
        print(f"Number range: {downloaded[0]['num']} to {downloaded[-1]['num']}")
else:
    print("No new images found.")

driver.quit()
