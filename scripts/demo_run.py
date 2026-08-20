import requests, json, sys
base='http://127.0.0.1:8001'
session = requests.Session()
out=[]
# 1. Login (form)
resp = session.post(base+'/auth/login', data={'username':'admin@edrp.local','password':'Admin@12345'})
out.append(('login', resp.status_code, resp.json() if resp.content else None))
if resp.status_code!=200:
    print(json.dumps(out, indent=2)); sys.exit(1)
token = resp.json().get('access_token')
session.headers.update({'Authorization':f'Bearer {token}'})
# 2. Create decision
payload = {'title':'Demo Decision','problem_statement':'Demo workflow','category':'demo'}
resp = session.post(base+'/decisions', json=payload)
out.append(('create_decision', resp.status_code, resp.json() if resp.content else None))
if resp.status_code!=201:
    print(json.dumps(out, indent=2)); sys.exit(1)
decision = resp.json()
decision_id = decision['id']
# 3. Add 3 alternatives
alts = [
    {'title':'Alt A','description':'First option','feasibility_score':3,'estimated_cost':300},
    {'title':'Alt B','description':'Second option','feasibility_score':4,'estimated_cost':250},
    {'title':'Alt C','description':'Third option','feasibility_score':2,'estimated_cost':150},
]
for a in alts:
    r = session.post(f"{base}/decisions/{decision_id}/alternatives", json=a)
    out.append(('add_alternative', r.status_code, r.json() if r.content else None))
# 4. Upload a supporting document
fake_pdf = b"%PDF-1.4\n%fakepdf\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n"
files = {
    'file': ('supporting.pdf', fake_pdf, 'application/pdf')
}
data = {'decision_id': str(decision_id)}
resp = session.post(base+'/documents/upload', files=files, data=data)
out.append(('upload_document', resp.status_code, resp.json() if resp.content else None))
# 5. Add discussion comments
c1 = {'decision_id':decision_id, 'content':'Initial comment for demo'}
r = session.post(base+'/comments', json=c1)
out.append(('post_comment_1', r.status_code, r.json() if r.content else None))
# 6. Edit the decision
upd = {'problem_statement':'Demo workflow - edited', 'change_summary':'Edit for demo'}
r = session.put(f"{base}/decisions/{decision_id}", json=upd)
out.append(('update_decision', r.status_code, r.json() if r.content else None))
# 7. Versions
r = session.get(f"{base}/decisions/{decision_id}/versions")
out.append(('versions', r.status_code, r.json() if r.content else None))
# 8. Related data
r = session.get(f"{base}/decisions/{decision_id}/documents")
out.append(('documents', r.status_code, r.json() if r.content else None))
r = session.get(f"{base}/decisions/{decision_id}/alternatives")
out.append(('alternatives', r.status_code, r.json() if r.content else None))
r = session.get(f"{base}/decisions/{decision_id}/comments")
out.append(('threaded_comments', r.status_code, r.json() if r.content else None))
print(json.dumps(out, indent=2, ensure_ascii=False))
