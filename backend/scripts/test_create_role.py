import requests
base='http://127.0.0.1:8000'
email='testuser_1785929962@example.com'
print('logging in', email)
r = requests.post(f"{base}/api/auth/login", json={'email':email,'password':'Password123!'})
print('login status', r.status_code, r.text)
if r.status_code==200:
    token=r.json()['access_token']
    headers={'Authorization':f'Bearer {token}'}
    r2 = requests.post(f"{base}/api/roles", json={'name':'TesterRoleFromScript','description':'Created via script'}, headers=headers)
    print('create role status', r2.status_code, r2.text)
else:
    print('login failed')
