import json
import random
import os
import requests
import datetime

# --- CONFIGURATION ---
# You need to get a "Page Access Token" from developers.facebook.com
FACEBOOK_PAGE_ID = "YOUR_PAGE_ID_HERE"
PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN_HERE"

MESSAGES_FILE = "messages.json"
ASSETS_DIR = "assets"
LOG_FILE = "post_log.txt"

def log_event(message):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(message)

def get_random_post():
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        messages = json.load(f)
    
    images = [f for f in os.listdir(ASSETS_DIR) if f.endswith(('.png', '.jpg', '.jpeg'))]
    
    message = random.choice(messages)["message"]
    image = os.path.join(ASSETS_DIR, random.choice(images))
    
    return message, image

def post_to_facebook(message, image_path):
    url = f"https://graph.facebook.com/{FACEBOOK_PAGE_ID}/photos"
    
    payload = {
        'message': message,
        'access_token': PAGE_ACCESS_TOKEN
    }
    
    with open(image_path, 'rb') as img:
        files = {
            'source': img
        }
        response = requests.post(url, data=payload, files=files)
        
    if response.status_code == 200:
        log_event(f"Successfully posted to Facebook! ID: {response.json().get('id')}")
    else:
        log_event(f"Failed to post. Error: {response.text}")

if __name__ == "__main__":
    try:
        msg, img = get_random_post()
        log_event(f"Selected Message: {msg}")
        log_event(f"Selected Image: {img}")
        
        # Uncomment the line below once you have added your Page ID and Access Token
        # post_to_facebook(msg, img)
        
        log_event("Dry run complete. (Add your Facebook Token to enable live posting!)")
        
    except Exception as e:
        log_event(f"Error: {e}")
