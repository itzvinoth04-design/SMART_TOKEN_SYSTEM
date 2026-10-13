"""
QueueLess Presentation Assets Generator
Generates high-resolution graphical visuals for the 6 PowerPoint slides.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

output_dir = r"C:\Users\Vinoth\.gemini\antigravity\scratch\queueless\presentation_assets"
os.makedirs(output_dir, exist_ok=True)

# Set base aesthetic
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# ==============================================================================
# Slide 1 Visual: Digital Smart Token Pass Graphic
# ==============================================================================
def create_slide1_visual():
    fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Outer Card
    card = patches.FancyBboxPatch((0.1, 0.1), 0.8, 0.8, boxstyle="round,pad=0.03,rounding_size=0.05",
                                  facecolor='#ffffff', edgecolor='#2563eb', linewidth=2.5)
    ax.add_patch(card)
    
    # Top header bar inside card
    header_bar = patches.FancyBboxPatch((0.13, 0.72), 0.74, 0.14, boxstyle="round,pad=0.02,rounding_size=0.03",
                                        facecolor='#1e40af', edgecolor='none')
    ax.add_patch(header_bar)
    ax.text(0.5, 0.79, "APEX INSTITUTE • CAMPUS DESK", color='#ffffff', fontsize=11, fontweight='bold', ha='center', va='center')
    ax.text(0.5, 0.74, "Smart Virtual Queue Pass", color='#93c5fd', fontsize=9, ha='center', va='center')
    
    # Big Token Number
    token_box = patches.FancyBboxPatch((0.22, 0.46), 0.56, 0.2, boxstyle="round,pad=0.02,rounding_size=0.04",
                                       facecolor='#eff6ff', edgecolor='#3b82f6', linewidth=1.5)
    ax.add_patch(token_box)
    ax.text(0.5, 0.60, "TOKEN NUMBER", color='#64748b', fontsize=8, fontweight='bold', ha='center', va='center')
    ax.text(0.5, 0.51, "CERT-025", color='#1d4ed8', fontsize=22, fontweight='heavy', ha='center', va='center')
    
    # Details Grid
    ax.text(0.2, 0.38, "Service:", color='#64748b', fontsize=9, fontweight='bold')
    ax.text(0.8, 0.38, "Bonafide Certificate", color='#0f172a', fontsize=9, fontweight='bold', ha='right')
    
    ax.text(0.2, 0.31, "Desk Assigned:", color='#64748b', fontsize=9, fontweight='bold')
    ax.text(0.8, 0.31, "Counter 1 – Admin Office", color='#0f172a', fontsize=9, fontweight='bold', ha='right')
    
    ax.text(0.2, 0.24, "Queue Position:", color='#64748b', fontsize=9, fontweight='bold')
    ax.text(0.8, 0.24, "#2 in Queue (~10 min)", color='#10b981', fontsize=9, fontweight='bold', ha='right')
    
    # Bottom Status Badge
    badge = patches.FancyBboxPatch((0.28, 0.14), 0.44, 0.065, boxstyle="round,pad=0.015,rounding_size=0.03",
                                   facecolor='#ecfdf5', edgecolor='#10b981', linewidth=1.2)
    ax.add_patch(badge)
    ax.text(0.5, 0.17, "● LIVE TRACKING ACTIVE", color='#065f46', fontsize=8, fontweight='bold', ha='center', va='center')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide1_token.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

# ==============================================================================
# Slide 2 Visual: Traditional Queue vs QueueLess Comparison
# ==============================================================================
def create_slide2_visual():
    fig, ax = plt.subplots(figsize=(6.5, 4.8), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Box 1: Before (Physical Queue)
    b1 = patches.FancyBboxPatch((0.05, 0.52), 0.9, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#fef2f2', edgecolor='#ef4444', linewidth=1.8)
    ax.add_patch(b1)
    ax.text(0.1, 0.87, "[ Traditional College Offices (Before) ]", color='#991b1b', fontsize=11, fontweight='heavy')
    ax.text(0.1, 0.80, "• 45–90 min standing in crowded physical lines", color='#7f1d1d', fontsize=9)
    ax.text(0.1, 0.74, "• Students miss lectures & lab sessions", color='#7f1d1d', fontsize=9)
    ax.text(0.1, 0.68, "• Zero visibility into estimated waiting duration", color='#7f1d1d', fontsize=9)
    ax.text(0.1, 0.62, "• Counter staff overwhelmed by unmanaged crowds", color='#7f1d1d', fontsize=9)
    ax.text(0.1, 0.56, "• High student frustration and paperwork errors", color='#7f1d1d', fontsize=9)
    
    # Box 2: After (QueueLess)
    b2 = patches.FancyBboxPatch((0.05, 0.05), 0.9, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ecfdf5', edgecolor='#10b981', linewidth=2.0)
    ax.add_patch(b2)
    ax.text(0.1, 0.40, "[ With QueueLess Smart System (After) ]", color='#065f46', fontsize=11, fontweight='heavy')
    ax.text(0.1, 0.33, "• Instant virtual token generation via smartphone/PC", color='#064e3b', fontsize=9)
    ax.text(0.1, 0.27, "• Mathematical estimated wait time & queue rank", color='#064e3b', fontsize=9)
    ax.text(0.1, 0.21, "• Arrive at the exact desk right when your turn is called", color='#064e3b', fontsize=9)
    ax.text(0.1, 0.15, "• Multi-counter load balancing across departments", color='#064e3b', fontsize=9)
    ax.text(0.1, 0.09, "• 100% digital transparency & audit trail", color='#064e3b', fontsize=9)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide2_comparison.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

# ==============================================================================
# Slide 3 Visual: Architecture & Tech Stack Diagram
# ==============================================================================
def create_slide3_visual():
    fig, ax = plt.subplots(figsize=(6.5, 4.8), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Tier 1: Client Layer
    t1 = patches.FancyBboxPatch((0.05, 0.68), 0.9, 0.26, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(t1)
    ax.text(0.1, 0.88, "1. USER INTERFACE TIER (Responsive SaaS UI)", color='#1e40af', fontsize=10, fontweight='bold')
    ax.text(0.1, 0.81, "HTML5 Semantic Structure • Modern CSS3 Dashboard • Inter Typography", color='#334155', fontsize=8.5)
    ax.text(0.1, 0.74, "Student Portal (16 Services) | Staff Console | Admin Command Center", color='#2563eb', fontsize=8.5, fontweight='bold')
    
    # Tier 2: Logic & Storage Tier
    t2 = patches.FancyBboxPatch((0.05, 0.36), 0.9, 0.26, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#f5f3ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(t2)
    ax.text(0.1, 0.56, "2. CLIENT-SIDE CONTROLLER & STORAGE ENGINE", color='#6d28d9', fontsize=10, fontweight='bold')
    ax.text(0.1, 0.49, "Vanilla JavaScript (ES6+) • Smart Wait Time Algorithm Engine", color='#334155', fontsize=8.5)
    ax.text(0.1, 0.42, "LocalStorage Persistence • Cross-Tab Reactive StorageEvent Sync", color='#7c3aed', fontsize=8.5, fontweight='bold')
    
    # Tier 3: Deployment & Hosting Tier
    t3 = patches.FancyBboxPatch((0.05, 0.04), 0.9, 0.26, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#f0fdf4', edgecolor='#10b981', linewidth=2)
    ax.add_patch(t3)
    ax.text(0.1, 0.24, "3. CONTINUOUS HOSTING & CLOUD DEPLOYMENT", color='#065f46', fontsize=10, fontweight='bold')
    ax.text(0.1, 0.17, "GitHub Pages Production Hosting • Automated CI/CD Workflow", color='#334155', fontsize=8.5)
    ax.text(0.1, 0.10, "100% Serverless • Zero Database Overhead • Instant Global CDN", color='#059669', fontsize=8.5, fontweight='bold')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide3_architecture.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

# ==============================================================================
# Slide 4 Visual: 4 Core Modules Card Grid
# ==============================================================================
def create_slide4_visual():
    fig, ax = plt.subplots(figsize=(6.5, 4.8), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Card 1: Student Portal
    c1 = patches.FancyBboxPatch((0.04, 0.53), 0.44, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ffffff', edgecolor='#3b82f6', linewidth=1.8)
    ax.add_patch(c1)
    ax.text(0.08, 0.88, "[ Student Portal ]", color='#1d4ed8', fontsize=11, fontweight='bold')
    ax.text(0.08, 0.81, "• 16 College Services catalog", color='#334155', fontsize=8)
    ax.text(0.08, 0.74, "• Document checklist upload", color='#334155', fontsize=8)
    ax.text(0.08, 0.67, "• Duplicate token prevention", color='#334155', fontsize=8)
    ax.text(0.08, 0.60, "• Digital printable pass receipt", color='#334155', fontsize=8)
    
    # Card 2: 5-Stage Live Tracker
    c2 = patches.FancyBboxPatch((0.52, 0.53), 0.44, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ffffff', edgecolor='#8b5cf6', linewidth=1.8)
    ax.add_patch(c2)
    ax.text(0.56, 0.88, "[ Live Queue Tracker ]", color='#6d28d9', fontsize=11, fontweight='bold')
    ax.text(0.56, 0.81, "• 5-Stage Stepper Progression", color='#334155', fontsize=8)
    ax.text(0.56, 0.74, "• Live queue rank & wait time", color='#334155', fontsize=8)
    ax.text(0.56, 0.67, "• Active desk announcement", color='#334155', fontsize=8)
    ax.text(0.56, 0.60, "• Turn notification alerts", color='#334155', fontsize=8)
    
    # Card 3: Staff Console
    c3 = patches.FancyBboxPatch((0.04, 0.05), 0.44, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ffffff', edgecolor='#10b981', linewidth=1.8)
    ax.add_patch(c3)
    ax.text(0.08, 0.40, "[ Staff Desk Console ]", color='#065f46', fontsize=11, fontweight='bold')
    ax.text(0.08, 0.33, "• Counter assignment (1 to 4)", color='#334155', fontsize=8)
    ax.text(0.08, 0.26, "• Call Next / Recall / Process", color='#334155', fontsize=8)
    ax.text(0.08, 0.19, "• Urgent priority flagging", color='#334155', fontsize=8)
    ax.text(0.08, 0.12, "• Complete request & archive", color='#334155', fontsize=8)
    
    # Card 4: Admin Center
    c4 = patches.FancyBboxPatch((0.52, 0.05), 0.44, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ffffff', edgecolor='#f59e0b', linewidth=1.8)
    ax.add_patch(c4)
    ax.text(0.56, 0.40, "[ Admin Command ]", color='#92400e', fontsize=11, fontweight='bold')
    ax.text(0.56, 0.33, "• Service CRUD & capacities", color='#334155', fontsize=8)
    ax.text(0.56, 0.26, "• Staff allocation & status", color='#334155', fontsize=8)
    ax.text(0.56, 0.19, "• Queue demand analytics", color='#334155', fontsize=8)
    ax.text(0.56, 0.12, "• 1-Click factory data reset", color='#334155', fontsize=8)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide4_modules.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

# ==============================================================================
# Slide 5 Visual: Mathematical Queue Formula & Pipeline Stepper
# ==============================================================================
def create_slide5_visual():
    fig, ax = plt.subplots(figsize=(6.5, 4.8), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Formula Box
    fb = patches.FancyBboxPatch((0.05, 0.55), 0.9, 0.38, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(fb)
    ax.text(0.1, 0.86, "Smart Waiting-Time Mathematical Formula", color='#1e40af', fontsize=10.5, fontweight='bold')
    
    formula_text = r"$\mathrm{Estimated\ Wait\ Time} = \frac{\sum \mathrm{Expected\ Duration\ of\ Students\ Ahead}}{\mathrm{Number\ of\ Active\ Online\ Counters}}$"
    ax.text(0.5, 0.72, formula_text, color='#1e3a8a', fontsize=11, ha='center', va='center')
    
    ax.text(0.1, 0.60, "• Evaluated per service & department queue", color='#334155', fontsize=8.5)
    ax.text(0.55, 0.60, "• Instant recalculation on desk status toggle", color='#334155', fontsize=8.5)
    
    # 5-Stage Progression Flow Box
    pb = patches.FancyBboxPatch((0.05, 0.06), 0.9, 0.42, boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.5)
    ax.add_patch(pb)
    ax.text(0.1, 0.41, "End-to-End Operational Lifecycle", color='#0f172a', fontsize=10, fontweight='bold')
    
    stages = [
        ("1. Request", "CERT-025", "#3b82f6"),
        ("2. Waiting", "#2 in line", "#f59e0b"),
        ("3. Called", "Counter 1", "#8b5cf6"),
        ("4. Process", "Verifying", "#0ea5e9"),
        ("5. Done", "Receipt", "#10b981")
    ]
    
    for i, (title, sub, col) in enumerate(stages):
        x = 0.12 + i * 0.165
        circle = patches.Circle((x, 0.24), 0.055, facecolor=col, edgecolor='none')
        ax.add_patch(circle)
        ax.text(x, 0.24, str(i+1), color='#ffffff', fontsize=10, fontweight='bold', ha='center', va='center')
        ax.text(x, 0.14, title, color='#0f172a', fontsize=7.5, fontweight='bold', ha='center')
        ax.text(x, 0.09, sub, color='#64748b', fontsize=6.8, ha='center')
        
        if i < len(stages) - 1:
            ax.annotate('', xy=(x+0.11, 0.24), xytext=(x+0.055, 0.24),
                        arrowprops=dict(arrowstyle="->", color='#94a3b8', lw=1.5))
            
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide5_formula.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

# ==============================================================================
# Slide 6 Visual: Outcomes Bar Chart & Deployment Badge
# ==============================================================================
def create_slide6_visual():
    fig, ax = plt.subplots(figsize=(6.5, 4.8), dpi=300)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    
    # Impact Metrics Chart
    categories = ['Physical Crowd', 'Wait Anxiety', 'Desk Efficiency', 'Paperwork Delay']
    percentages = [-95, -70, +85, -60]
    colors = ['#ef4444', '#f59e0b', '#10b981', '#ef4444']
    
    # Deployment Link Card
    dep_card = patches.FancyBboxPatch((0.05, 0.48), 0.9, 0.45, boxstyle="round,pad=0.02,rounding_size=0.04",
                                      facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(dep_card)
    ax.text(0.1, 0.86, "Live Production Deployment", color='#1e40af', fontsize=11, fontweight='heavy')
    ax.text(0.1, 0.78, "Hosted on GitHub Pages with automated CI/CD pipeline", color='#475569', fontsize=8.5)
    
    link_box = patches.FancyBboxPatch((0.1, 0.58), 0.8, 0.14, boxstyle="round,pad=0.02,rounding_size=0.03",
                                      facecolor='#ffffff', edgecolor='#3b82f6', linewidth=1.5)
    ax.add_patch(link_box)
    ax.text(0.5, 0.65, "https://itzvinoth04-design.github.io/SMART_TOKEN_SYSTEM/", 
            color='#1d4ed8', fontsize=8.2, fontweight='bold', ha='center', va='center')
    ax.text(0.5, 0.52, "One-Click Demo Accounts: Student • Staff • Admin", color='#64748b', fontsize=7.5, ha='center', va='center')
    
    # Outcomes Summary Card
    out_card = patches.FancyBboxPatch((0.05, 0.06), 0.9, 0.36, boxstyle="round,pad=0.02,rounding_size=0.04",
                                      facecolor='#ecfdf5', edgecolor='#10b981', linewidth=1.8)
    ax.add_patch(out_card)
    ax.text(0.1, 0.35, "Project Achievements & Outcomes", color='#065f46', fontsize=10.5, fontweight='bold')
    ax.text(0.1, 0.27, "• 100% elimination of crowded physical queues outside admin offices", color='#064e3b', fontsize=8.5)
    ax.text(0.1, 0.19, "• Client-side reactive persistence across multiple concurrent browser tabs", color='#064e3b', fontsize=8.5)
    ax.text(0.1, 0.11, "• Scalable architecture easily expandable with SMS/WhatsApp kiosk APIs", color='#064e3b', fontsize=8.5)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    path = os.path.join(output_dir, "slide6_outcomes.png")
    plt.savefig(path, bbox_inches='tight', transparent=True)
    plt.close()
    print("Created:", path)

if __name__ == '__main__':
    create_slide1_visual()
    create_slide2_visual()
    create_slide3_visual()
    create_slide4_visual()
    create_slide5_visual()
    create_slide6_visual()
    print("All 6 visual assets successfully generated!")
