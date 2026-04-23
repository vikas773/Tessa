import urllib.request
import urllib.error

url = 'https://tessa-backend.onrender.com/api/users/'
req = urllib.request.Request(url, headers={'Origin': 'https://tessa-fac9701rj-vikas773s-projects.vercel.app'})

try:
    with urllib.request.urlopen(req) as response:
        print("Success!")
        print("Headers:", response.headers)
        print("Body:", response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print("Body:", e.read().decode())
except Exception as e:
    print(f"Other Error: {e}")
