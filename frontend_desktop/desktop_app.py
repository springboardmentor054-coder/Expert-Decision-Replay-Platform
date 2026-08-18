import tkinter as tk
from tkinter import ttk, messagebox
import requests
import json

class DesktopApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Expert Decision Replay Platform - Desktop Client")
        self.root.geometry("900x600")
        
        # API Configuration
        self.api_url = "http://localhost:8000/api/v1"
        self.token = None
        self.user = None
        
        # Styling configurations
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Color Palettes (Dark Mode Matching Web Design)
        self.bg_dark = "#0b0f19"
        self.bg_card = "#161f30"
        self.accent = "#3b82f6"
        self.text_light = "#f8fafc"
        
        self.root.configure(bg=self.bg_dark)
        
        # Set Ttk Styles
        self.style.configure('.', background=self.bg_dark, foreground=self.text_light)
        self.style.configure('TFrame', background=self.bg_dark)
        self.style.configure('Card.TFrame', background=self.bg_card, borderwidth=1, relief="solid")
        self.style.configure('TLabel', background=self.bg_dark, foreground=self.text_light, font=("Inter", 10))
        self.style.configure('Header.TLabel', font=("Outfit", 16, "bold"), foreground="white")
        self.style.configure('Title.TLabel', font=("Outfit", 12, "bold"), foreground="white")
        self.style.configure('Card.TLabel', background=self.bg_card, foreground=self.text_light)
        self.style.configure('TButton', background=self.accent, foreground="white", font=("Inter", 10, "bold"), borderwidth=0)
        self.style.map('TButton', background=[('active', '#2563eb')])
        self.style.configure('Secondary.TButton', background="#26354a", foreground=self.text_light)
        
        # Show Login Screen Initially
        self.show_login_screen()

    def show_login_screen(self):
        self.clear_screen()
        
        frame = ttk.Frame(self.root, style='Card.TFrame', padding=30)
        frame.place(relx=0.5, rely=0.5, anchor="center", width=400, height=350)
        
        lbl_logo = ttk.Label(frame, text="ED", font=("Outfit", 24, "bold"), foreground="#3b82f6", style='Card.TLabel')
        lbl_logo.pack(pady=10)
        
        lbl_title = ttk.Label(frame, text="Decision Replay Platform", style='Header.TLabel')
        lbl_title.configure(background=self.bg_card)
        lbl_title.pack(pady=5)
        
        lbl_email = ttk.Label(frame, text="Email Address", style='Card.TLabel')
        lbl_email.pack(anchor="w", pady=(10, 2))
        self.ent_email = ttk.Entry(frame, font=("Inter", 10))
        self.ent_email.pack(fill="x", pady=2)
        self.ent_email.insert(0, "admin@company.com") # Pre-populate default account
        
        lbl_pass = ttk.Label(frame, text="Password", style='Card.TLabel')
        lbl_pass.pack(anchor="w", pady=(10, 2))
        self.ent_pass = ttk.Entry(frame, show="•", font=("Inter", 10))
        self.ent_pass.pack(fill="x", pady=2)
        self.ent_pass.insert(0, "AdminPassword123") # Pre-populate default pass
        
        btn_login = ttk.Button(frame, text="Sign In", command=self.action_login)
        btn_login.pack(fill="x", pady=20)

    def action_login(self):
        email = self.ent_email.get()
        password = self.ent_pass.get()
        
        if not email or not password:
            messagebox.showerror("Error", "All fields are required.")
            return
            
        try:
            # Call OAuth2 Login Endpoint
            payload = {'username': email, 'password': password}
            res = requests.post(f"{self.api_url}/users/login", data=payload)
            
            if res.status_code == 200:
                self.token = res.json()["access_token"]
                
                # Fetch User Detail
                headers = {"Authorization": f"Bearer {self.token}"}
                user_res = requests.get(f"{self.api_url}/users/me", headers=headers)
                if user_res.status_code == 200:
                    self.user = user_res.json()
                    messagebox.showinfo("Success", f"Logged in as {self.user['full_name']} ({self.user['role']})")
                    self.show_main_workspace()
                else:
                    messagebox.showerror("Error", "Could not fetch user profile details.")
            else:
                messagebox.showerror("Error", "Invalid email or password.")
        except Exception as e:
            messagebox.showerror("Network Error", f"Could not connect to backend server: {str(e)}")

    def show_main_workspace(self):
        self.clear_screen()
        
        # Sidebar Panel
        sidebar = ttk.Frame(self.root, width=200, style='Card.TFrame', padding=10)
        sidebar.pack(side="left", fill="y")
        
        lbl_brand = ttk.Label(sidebar, text="DecisionReplay", font=("Outfit", 12, "bold"), foreground="#3b82f6", style='Card.TLabel')
        lbl_brand.pack(pady=15)
        
        lbl_user = ttk.Label(sidebar, text=self.user["full_name"], font=("Inter", 9, "bold"), style='Card.TLabel')
        lbl_user.pack(anchor="w", pady=(10, 2))
        lbl_role = ttk.Label(sidebar, text=self.user["role"], font=("Inter", 8), foreground="#94a3b8", style='Card.TLabel')
        lbl_role.pack(anchor="w", pady=(0, 20))
        
        btn_decisions = ttk.Button(sidebar, text="📂 Directory", style='Secondary.TButton', command=self.load_directory_frame)
        btn_decisions.pack(fill="x", pady=5)
        
        btn_reviews = ttk.Button(sidebar, text="📥 Reviews Pending", style='Secondary.TButton', command=self.load_reviews_frame)
        btn_reviews.pack(fill="x", pady=5)
        
        btn_logout = ttk.Button(sidebar, text="🚪 Logout", style='Secondary.TButton', command=self.show_login_screen)
        btn_logout.pack(fill="x", side="bottom", pady=10)

        # Workspace Container
        self.workspace = ttk.Frame(self.root, padding=20)
        self.workspace.pack(side="right", fill="both", expand=True)
        
        # Initialize Directory View
        self.load_directory_frame()

    def load_directory_frame(self):
        self.clear_workspace()
        
        lbl_title = ttk.Label(self.workspace, text="Knowledge Directory", style='Header.TLabel')
        lbl_title.pack(anchor="w", pady=(0, 10))
        
        # Search panel
        search_frame = ttk.Frame(self.workspace)
        search_frame.pack(fill="x", pady=10)
        
        ttk.Label(search_frame, text="Search:").pack(side="left", padx=5)
        self.ent_search = ttk.Entry(search_frame)
        self.ent_search.pack(side="left", fill="x", expand=True, padx=5)
        
        btn_search = ttk.Button(search_frame, text="Search", command=self.fetch_decisions)
        btn_search.pack(side="left", padx=5)
        
        # Treeview (Table)
        self.tree = ttk.Treeview(self.workspace, columns=("id", "title", "category", "status", "version"), show="headings")
        self.tree.heading("id", text="ID")
        self.tree.heading("title", text="Decision Title")
        self.tree.heading("category", text="Category")
        self.tree.heading("status", text="Status")
        self.tree.heading("version", text="Version")
        
        self.tree.column("id", width=50, anchor="center")
        self.tree.column("title", width=350)
        self.tree.column("category", width=120)
        self.tree.column("status", width=100, anchor="center")
        self.tree.column("version", width=80, anchor="center")
        
        self.tree.pack(fill="both", expand=True, pady=10)
        
        self.tree.bind("<Double-1>", self.on_decision_select)
        
        # Fetch data
        self.fetch_decisions()

    def fetch_decisions(self):
        search = self.ent_search.get()
        url = f"{self.api_url}/decisions/"
        if search:
            url += f"?search={search}"
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            res = requests.get(url, headers=headers)
            if res.status_code == 200:
                # Clear tree
                for item in self.tree.get_children():
                    self.tree.delete(item)
                    
                for d in res.json():
                    self.tree.insert("", "end", values=(d["id"], d["title"], d["category"], d["status"], f"v{d['current_version']}"))
        except Exception as e:
            messagebox.showerror("Error", f"Failed to retrieve decisions: {str(e)}")

    def on_decision_select(self, event):
        selected_item = self.tree.selection()
        if not selected_item:
            return
            
        decision_id = self.tree.item(selected_item)["values"][0]
        self.show_decision_detail_dialog(decision_id)

    def show_decision_detail_dialog(self, decision_id):
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Decision Details - #{decision_id}")
        dialog.geometry("600x500")
        dialog.configure(bg=self.bg_dark)
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            res = requests.get(f"{self.api_url}/decisions/{decision_id}", headers=headers)
            if res.status_code == 200:
                d = res.json()
                
                # Title
                lbl_t = ttk.Label(dialog, text=d["title"], font=("Outfit", 14, "bold"), foreground="white", wraplength=550)
                lbl_t.pack(anchor="w", padx=20, pady=(20, 5))
                
                # Metadata
                lbl_meta = ttk.Label(dialog, text=f"Category: {d['category']} | Status: {d['status']} | Version: v{d['current_version']}", foreground="#94a3b8")
                lbl_meta.pack(anchor="w", padx=20, pady=2)
                
                # Problem Statement
                lbl_prob_hdr = ttk.Label(dialog, text="Problem Statement:", font=("Inter", 10, "bold"), foreground="white")
                lbl_prob_hdr.pack(anchor="w", padx=20, pady=(15, 2))
                
                txt_prob = tk.Text(dialog, bg=self.bg_card, fg=self.text_light, insertbackground="white", wrap="word", height=8, font=("Inter", 10), bd=1, relief="solid")
                txt_prob.pack(fill="x", padx=20, pady=5)
                txt_prob.insert("1.0", d["problem_statement"])
                txt_prob.configure(state="disabled")
                
                # Alternatives
                lbl_alt_hdr = ttk.Label(dialog, text="Alternatives Considered:", font=("Inter", 10, "bold"), foreground="white")
                lbl_alt_hdr.pack(anchor="w", padx=20, pady=(15, 2))
                
                txt_alt = tk.Text(dialog, bg=self.bg_card, fg=self.text_light, insertbackground="white", wrap="word", height=8, font=("Inter", 10), bd=1, relief="solid")
                txt_alt.pack(fill="x", padx=20, pady=5)
                
                alt_content = ""
                for index, alt in enumerate(d["alternatives"]):
                    alt_content += f"{index + 1}. {alt['title']}\n"
                    alt_content += f"   Description: {alt['description']}\n"
                    alt_content += f"   Cost: ${alt['cost']}/yr | Feasibility: {alt['feasibility_rating']}/5 | Risk: {alt['risk_rating']}/5\n\n"
                
                txt_alt.insert("1.0", alt_content if alt_content else "No alternative options recorded.")
                txt_alt.configure(state="disabled")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to retrieve decision detail: {str(e)}")

    def load_reviews_frame(self):
        self.clear_workspace()
        
        lbl_title = ttk.Label(self.workspace, text="Reviews & Governance Actions Pending", style='Header.TLabel')
        lbl_title.pack(anchor="w", pady=(0, 10))
        
        self.list_frame = ttk.Frame(self.workspace)
        self.list_frame.pack(fill="both", expand=True, pady=10)
        
        self.fetch_pending_reviews()

    def fetch_pending_reviews(self):
        try:
            # Clear previous widgets
            for widget in self.list_frame.winfo_children():
                widget.destroy()
                
            headers = {"Authorization": f"Bearer {self.token}"}
            res = requests.get(f"{self.api_url}/approvals/pending", headers=headers)
            
            if res.status_code == 200:
                approvals = res.json()
                
                if not approvals:
                    ttk.Label(self.list_frame, text="All caught up! No reviews pending approval.", font=("Inter", 11)).pack(pady=40)
                    return
                    
                for app in approvals:
                    # Outer Card Frame
                    card = ttk.Frame(self.list_frame, style='Card.TFrame', padding=15)
                    card.pack(fill="x", pady=8)
                    
                    lbl_dec = ttk.Label(card, text=f"Review Pending: Decision #{app['decision_id']}", font=("Outfit", 11, "bold"), style='Card.TLabel')
                    lbl_dec.pack(anchor="w")
                    
                    lbl_lvl = ttk.Label(card, text=f"Review Level Assigned: Level {app['level']}", style='Card.TLabel', foreground="#94a3b8")
                    lbl_lvl.pack(anchor="w", pady=2)
                    
                    btn_actions = ttk.Frame(card, style='Card.TFrame')
                    btn_actions.pack(anchor="e", pady=(10, 0))
                    
                    btn_app = ttk.Button(btn_actions, text="Approve", command=lambda a_id=app['id']: self.action_approval(a_id, "Approved"))
                    btn_app.pack(side="left", padx=5)
                    
                    btn_rej = ttk.Button(btn_actions, text="Reject", style='Secondary.TButton', command=lambda a_id=app['id']: self.action_approval(a_id, "Rejected"))
                    btn_rej.pack(side="left", padx=5)
                    
        except Exception as e:
            messagebox.showerror("Error", f"Failed to retrieve reviews: {str(e)}")

    def action_approval(self, approval_id, status):
        comments = messagebox.askquestion("Add Comments", f"Do you want to add comments for this {status}?")
        comments_text = ""
        if comments == 'yes':
            # Create a simple dialog for comment entry
            comment_dialog = tk.Toplevel(self.root)
            comment_dialog.title("Enter Review Comments")
            comment_dialog.geometry("350x200")
            comment_dialog.configure(bg=self.bg_dark)
            
            ttk.Label(comment_dialog, text="Review Comments:", font=("Inter", 10)).pack(pady=10, padx=10, anchor="w")
            txt_comment = tk.Text(comment_dialog, height=5, bg=self.bg_card, fg=self.text_light, insertbackground="white")
            txt_comment.pack(fill="x", padx=10, pady=5)
            
            def submit_comment():
                nonlocal comments_text
                comments_text = txt_comment.get("1.0", tk.END).strip()
                comment_dialog.destroy()
                self.send_approval_request(approval_id, status, comments_text)
                
            ttk.Button(comment_dialog, text="Submit", command=submit_comment).pack(pady=10)
        else:
            self.send_approval_request(approval_id, status, f"Decision review actioned: {status}")

    def send_approval_request(self, approval_id, status, comments):
        try:
            headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
            payload = {"status": status, "comments": comments}
            
            res = requests.post(f"{self.api_url}/approvals/{approval_id}/action", headers=headers, data=json.dumps(payload))
            if res.status_code == 200:
                messagebox.showinfo("Success", f"Decision successfully {status}.")
                self.fetch_pending_reviews()
            else:
                err = res.json()
                messagebox.showerror("Error", f"Failed to action approval: {err.get('detail', 'Unknown error')}")
        except Exception as e:
            messagebox.showerror("Error", f"Could not perform action: {str(e)}")

    def clear_screen(self):
        for widget in self.root.winfo_children():
            widget.destroy()

    def clear_workspace(self):
        for widget in self.workspace.winfo_children():
            widget.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = DesktopApp(root)
    root.mainloop()
