import requests
import sys

base = 'http://127.0.0.1:8000'

def run_tests():
    # 1. Login as Admin
    admin_session = requests.Session()
    resp = admin_session.post(f"{base}/auth/login", data={'username': 'admin@edrp.local', 'password': 'Admin@12345'})
    if resp.status_code != 200:
        print("Admin login failed:", resp.json())
        sys.exit(1)
    admin_token = resp.json()['access_token']
    admin_session.headers.update({'Authorization': f'Bearer {admin_token}'})
    print("[✔] Logged in as Admin")

    # 2. Register a new user to act as stakeholder
    import random
    rand_id = random.randint(1000, 9999)
    email = f"testuser_{rand_id}@edrp.local"
    user_payload = {
        'full_name': f'Test Stakeholder {rand_id}',
        'email': email,
        'password': 'Password@12345',
        'job_title': 'Software Engineer'
    }
    resp = requests.post(f"{base}/auth/register", json=user_payload)
    if resp.status_code != 201:
        print("User registration failed:", resp.json())
        sys.exit(1)
    user_id = resp.json()['id']
    print(f"[✔] Registered new user: {email} (ID: {user_id})")

    # 3. Login as the new user
    user_session = requests.Session()
    resp = user_session.post(f"{base}/auth/login", data={'username': email, 'password': 'Password@12345'})
    if resp.status_code != 200:
        print("User login failed:", resp.json())
        sys.exit(1)
    user_token = resp.json()['access_token']
    user_session.headers.update({'Authorization': f'Bearer {user_token}'})
    print("[✔] Logged in as Stakeholder")

    # 4. Create a decision as Admin
    decision_payload = {
        'title': f'Decision for Notification Test {rand_id}',
        'problem_statement': 'Notification integration testing',
        'category': 'test'
    }
    resp = admin_session.post(f"{base}/decisions", json=decision_payload)
    if resp.status_code != 201:
        print("Decision creation failed:", resp.json())
        sys.exit(1)
    decision = resp.json()
    decision_id = decision['id']
    print(f"[✔] Admin created decision: ID {decision_id}")

    # 5. Admin adds new user as stakeholder
    stakeholder_payload = {
        'user_id': user_id,
        'role': 'stakeholder'
    }
    resp = admin_session.post(f"{base}/decisions/{decision_id}/stakeholders", json=stakeholder_payload)
    if resp.status_code != 201:
        print("Adding stakeholder failed:", resp.json())
        sys.exit(1)
    print(f"[✔] Added user {user_id} as stakeholder")

    # 6. Stakeholder checks notifications (should have 1 about being assigned)
    resp = user_session.get(f"{base}/notifications")
    if resp.status_code != 200:
        print("Listing notifications failed:", resp.json())
        sys.exit(1)
    notifications = resp.json()
    print(f"[✔] Stakeholder has {len(notifications)} notifications:")
    for n in notifications:
        print(f"    - Title: {n['title']} | Message: {n['message']}")
    
    assert len(notifications) == 1, "Should have exactly 1 notification"
    assert "Assigned to Decision" in notifications[0]['title'], "Should be assigned notification"

    # 7. Admin adds an alternative
    alt_payload = {
        'title': 'Alternative Test Option',
        'description': 'Test option details',
        'feasibility_score': 4,
        'estimated_cost': 100
    }
    resp = admin_session.post(f"{base}/decisions/{decision_id}/alternatives", json=alt_payload)
    if resp.status_code != 201:
        print("Adding alternative failed:", resp.json())
        sys.exit(1)
    print("[✔] Admin added alternative")

    # 8. Admin posts a comment
    comment_payload = {
        'decision_id': decision_id,
        'content': 'Hello stakeholders! Let us review this option.'
    }
    resp = admin_session.post(f"{base}/comments", json=comment_payload)
    if resp.status_code != 201:
        print("Posting comment failed:", resp.json())
        sys.exit(1)
    print("[✔] Admin posted comment")

    # 9. Admin updates status
    status_payload = {
        'status': 'under_review',
        'change_summary': 'Moving to review phase'
    }
    resp = admin_session.put(f"{base}/decisions/{decision_id}/status", json=status_payload)
    if resp.status_code != 200:
        print("Status update failed:", resp.json())
        sys.exit(1)
    print("[✔] Admin updated status to under_review")

    # 10. Stakeholder checks notifications (should have 4 total now)
    resp = user_session.get(f"{base}/notifications")
    notifications = resp.json()
    print(f"[✔] Stakeholder now has {len(notifications)} notifications:")
    for n in notifications:
        print(f"    - Title: {n['title']} | Message: {n['message']} | Read: {n['is_read']}")

    assert len(notifications) == 4, f"Should have 4 notifications, got {len(notifications)}"

    # 11. Mark all as read
    resp = user_session.put(f"{base}/notifications/read-all")
    if resp.status_code != 200:
        print("Read all failed:", resp.json())
        sys.exit(1)
    print("[✔] Stakeholder marked all read")

    # 12. Stakeholder checks notifications list (should all be read)
    resp = user_session.get(f"{base}/notifications")
    notifications = resp.json()
    assert all(n['is_read'] for n in notifications), "All notifications should be marked read"
    print("[✔] Verified all notifications are marked read")

    # 13. Delete one notification
    notif_id = notifications[0]['id']
    resp = user_session.delete(f"{base}/notifications/{notif_id}")
    if resp.status_code != 204:
        print("Delete notification failed:", resp.status_code)
        sys.exit(1)
    print(f"[✔] Deleted notification {notif_id}")

    # 14. Verify delete
    resp = user_session.get(f"{base}/notifications")
    notifications = resp.json()
    assert len(notifications) == 3, f"Should have 3 notifications remaining, got {len(notifications)}"
    print("[✔] Verified deletion success")
    print("\n--- ALL BACKEND NOTIFICATION TESTS PASSED SUCCESSFULLY! ---")

if __name__ == '__main__':
    run_tests()
