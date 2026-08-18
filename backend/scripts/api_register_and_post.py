import os, json, time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

def post(url, data, headers=None):
    data_bytes = json.dumps(data).encode('utf-8')
    req = Request(url, data=data_bytes, headers=headers or {}, method='POST')
    req.add_header('Content-Type', 'application/json')
    try:
        with urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except HTTPError as e:
        print('HTTPError', e.code, e.read().decode())
        raise

base='http://127.0.0.1:8000'
email=f'testuser_{int(time.time())}@example.com'
print('registering', email)
reg_payload={'full_name':'Test User','email':email,'password':'Password123!','role_id':1}
print('reg result:', post(base+'/api/auth/register', reg_payload))
print('logging in')
login_payload={'email':email,'password':'Password123!'}
login_res=json.loads(post(base+'/api/auth/login', login_payload))
print('token received')
token=login_res['access_token']
print('posting decision')
dec_payload={'title':'API Test','problem_statement':'PS','description':'d','category':'Strategy','status':'open'}
headers={'Authorization':f'Bearer {token}'}
print('post result:', post(base+'/api/decisions', dec_payload, headers=headers))
