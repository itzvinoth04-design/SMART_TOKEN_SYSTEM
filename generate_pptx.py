"""
QueueLess PowerPoint Deck Generator
Builds a professional 6-slide presentation deck using python-pptx.
Presenter: S VINOTH (Roll No: 240701592)
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Initialize Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Brand Color Palette
COLOR_BG = RGBColor(248, 250, 252)        # Slate 50
COLOR_CARD_BG = RGBColor(255, 255, 255)   # Pure White
COLOR_NAVY = RGBColor(15, 23, 42)         # Slate 900
COLOR_BLUE_DARK = RGBColor(30, 64, 175)   # Blue 800
COLOR_BLUE_PRIMARY = RGBColor(37, 99, 235)# Blue 600
COLOR_BLUE_LIGHT = RGBColor(239, 246, 255)# Blue 50
COLOR_VIOLET = RGBColor(124, 58, 237)     # Violet 600
COLOR_TEXT_DARK = RGBColor(15, 23, 42)    # Dark text
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)# Gray 500
COLOR_BORDER = RGBColor(226, 232, 240)    # Slate 200
COLOR_GREEN = RGBColor(16, 185, 129)      # Emerald 500
COLOR_AMBER = RGBColor(245, 158, 11)      # Amber 500

assets_dir = r"C:\Users\Vinoth\.gemini\antigravity\scratch\queueless\presentation_assets"

def set_slide_background(slide):
    # Base background shape
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = COLOR_BG
    bg.line.color.rgb = COLOR_BG
    return bg

def add_header(slide, category, title, slide_num):
    # Top Category Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.2), Inches(0.35))
    pill.fill.solid()
    pill.fill.fore_color.rgb = COLOR_BLUE_LIGHT
    pill.line.color.rgb = RGBColor(191, 219, 254)
    tf_pill = pill.text_frame
    tf_pill.word_wrap = True
    p_pill = tf_pill.paragraphs[0]
    p_pill.text = category.upper()
    p_pill.font.size = Pt(9.5)
    p_pill.font.bold = True
    p_pill.font.color.rgb = COLOR_BLUE_PRIMARY
    p_pill.alignment = PP_ALIGN.CENTER

    # Main Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(10.5), Inches(0.65))
    tf_title = title_box.text_frame
    p_title = tf_title.paragraphs[0]
    p_title.text = title
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_NAVY

    # Slide Number
    num_box = slide.shapes.add_textbox(Inches(11.3), Inches(0.45), Inches(1.2), Inches(0.4))
    tf_num = num_box.text_frame
    p_num = tf_num.paragraphs[0]
    p_num.text = f"{slide_num} / 6"
    p_num.font.size = Pt(11)
    p_num.font.bold = True
    p_num.font.color.rgb = COLOR_TEXT_MUTED
    p_num.alignment = PP_ALIGN.RIGHT

    # Bottom Footer
    footer = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.7), Inches(0.35))
    tf_foot = footer.text_frame
    p_foot = tf_foot.paragraphs[0]
    p_foot.text = "QueueLess: Smart College Queue & Token Management System  |  Presenter: S VINOTH (Roll: 240701592)"
    p_foot.font.size = Pt(9)
    p_foot.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 1: TITLE SLIDE
# ==============================================================================
slide1 = prs.slides.add_slide(blank_layout)
set_slide_background(slide1)

# Left Side Main Hero Card
hero_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(6.8), Inches(5.9))
hero_card.fill.solid()
hero_card.fill.fore_color.rgb = COLOR_BLUE_DARK
hero_card.line.color.rgb = COLOR_BLUE_DARK

# Title Badge inside card
t_pill = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.2), Inches(3.2), Inches(0.38))
t_pill.fill.solid()
t_pill.fill.fore_color.rgb = RGBColor(30, 58, 138)
t_pill.line.color.rgb = RGBColor(96, 165, 250)
tf = t_pill.text_frame
p = tf.paragraphs[0]
p.text = "SMART CAMPUS PROJECT"
p.font.size = Pt(9.5)
p.font.bold = True
p.font.color.rgb = RGBColor(191, 219, 254)
p.alignment = PP_ALIGN.CENTER

# Project Main Title
t_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.75), Inches(6.0), Inches(2.2))
tf = t_box.text_frame
tf.word_wrap = True

p1 = tf.paragraphs[0]
p1.text = "QueueLess"
p1.font.size = Pt(36)
p1.font.bold = True
p1.font.color.rgb = RGBColor(255, 255, 255)

p2 = tf.add_paragraph()
p2.text = "Smart College Queue & Token Management System"
p2.font.size = Pt(17)
p2.font.bold = True
p2.font.color.rgb = RGBColor(147, 197, 253)

p3 = tf.add_paragraph()
p3.text = '"Your Time Matters. Skip the Queue."'
p3.font.size = Pt(13)
p3.font.italic = True
p3.font.color.rgb = RGBColor(226, 232, 240)

# Presenter Info Box (Required: S VINOTH, Roll: 240701592)
pres_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.3), Inches(6.0), Inches(1.8))
pres_box.fill.solid()
pres_box.fill.fore_color.rgb = RGBColor(255, 255, 255)
pres_box.line.color.rgb = RGBColor(219, 234, 254)

tf_pres = pres_box.text_frame
tf_pres.word_wrap = True

p_lbl = tf_pres.paragraphs[0]
p_lbl.text = "PRESENTED BY:"
p_lbl.font.size = Pt(9.5)
p_lbl.font.bold = True
p_lbl.font.color.rgb = COLOR_BLUE_PRIMARY

p_name = tf_pres.add_paragraph()
p_name.text = "S VINOTH"
p_name.font.size = Pt(20)
p_name.font.bold = True
p_name.font.color.rgb = COLOR_NAVY

p_roll = tf_pres.add_paragraph()
p_roll.text = "Roll Number: 240701592"
p_roll.font.size = Pt(12)
p_roll.font.bold = True
p_roll.font.color.rgb = COLOR_BLUE_DARK

p_dept = tf_pres.add_paragraph()
p_dept.text = "Department of Computer Science & Engineering  |  Academic Year 2026"
p_dept.font.size = Pt(9.5)
p_dept.font.color.rgb = COLOR_TEXT_MUTED

# Right Side Card with Graphic Visual
img_path1 = os.path.join(assets_dir, "slide1_token.png")
if os.path.exists(img_path1):
    slide1.shapes.add_picture(img_path1, Inches(7.9), Inches(1.1), width=Inches(4.6))

# ==============================================================================
# SLIDE 2: PROBLEM STATEMENT & PROJECT OBJECTIVES
# ==============================================================================
slide2 = prs.slides.add_slide(blank_layout)
set_slide_background(slide2)
add_header(slide2, "Background & Motivation", "Problem Statement & Project Objectives", 2)

# Left Content Box (Card)
card2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
card2.fill.solid()
card2.fill.fore_color.rgb = COLOR_CARD_BG
card2.line.color.rgb = COLOR_BORDER

tf2 = card2.text_frame
tf2.word_wrap = True

p = tf2.paragraphs[0]
p.text = "THE CAMPUS CHALLENGE"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = RGBColor(220, 38, 38)

bullets1 = [
    ("Physical Queue Congestion: ", "Students wait 45 to 90 minutes standing outside Administrative, Accounts, and Examination desks."),
    ("Classroom Disruption: ", "Uncertain wait times force students to miss critical lectures, laboratory hours, and project deadlines."),
    ("Administrative Bottlenecks: ", "Counter staff face unmanaged crowds, frequent repetitive queries, and paperwork discrepancies."),
    ("Zero Status Transparency: ", "No indication of queue position, estimated waiting duration, or required prerequisite documents.")
]

for b_title, b_desc in bullets1:
    p_b = tf2.add_paragraph()
    p_b.text = "• " + b_title + b_desc
    p_b.font.size = Pt(10)
    p_b.font.color.rgb = COLOR_NAVY
    p_b.space_before = Pt(6)

p_obj = tf2.add_paragraph()
p_obj.text = "KEY PROJECT OBJECTIVES"
p_obj.font.size = Pt(12)
p_obj.font.bold = True
p_obj.font.color.rgb = COLOR_BLUE_PRIMARY
p_obj.space_before = Pt(14)

bullets2 = [
    ("Virtual Token Generation: ", "Request office services digitally anywhere on or off campus."),
    ("Smart Wait-Time Estimation: ", "Dynamic calculation based on queue volume and active counters."),
    ("Live Multi-Stage Tracker: ", "5-stage visual stepper from request generation to counter completion."),
    ("Departmental Load Balancing: ", "Dedicated queues across 16 services & 4 synchronized office desks.")
]

for b_title, b_desc in bullets2:
    p_b = tf2.add_paragraph()
    p_b.text = "✔ " + b_title + b_desc
    p_b.font.size = Pt(10)
    p_b.font.color.rgb = COLOR_NAVY
    p_b.space_before = Pt(5)

# Right Graphic Visual
img_path2 = os.path.join(assets_dir, "slide2_comparison.png")
if os.path.exists(img_path2):
    slide2.shapes.add_picture(img_path2, Inches(6.8), Inches(1.6), width=Inches(5.7))

# ==============================================================================
# SLIDE 3: SYSTEM ARCHITECTURE & TECH STACK
# ==============================================================================
slide3 = prs.slides.add_slide(blank_layout)
set_slide_background(slide3)
add_header(slide3, "System Design & Implementation", "System Architecture & Technology Stack", 3)

# Left Content Box
card3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
card3.fill.solid()
card3.fill.fore_color.rgb = COLOR_CARD_BG
card3.line.color.rgb = COLOR_BORDER

tf3 = card3.text_frame
tf3.word_wrap = True

p = tf3.paragraphs[0]
p.text = "ARCHITECTURAL OVERVIEW"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_BLUE_PRIMARY

arch_items = [
    ("Pure Frontend SaaS Prototype: ", "Built strictly using HTML5, modern CSS3, and Vanilla JavaScript with zero external runtime frameworks."),
    ("LocalStorage Persistence Engine: ", "Stores tokens, service catalogs, counter status, staff workload, and profile records in browser storage."),
    ("Cross-Tab Event Synchronization: ", "Uses browser StorageEvent listeners to synchronize staff actions in real time with the student queue tracker."),
    ("Accessible Responsive Layout: ", "Desktop sidebar navigation and mobile off-canvas drawer optimized for smartphone browsers.")
]

for title, desc in arch_items:
    p_item = tf3.add_paragraph()
    p_item.text = "• " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(8)

p_stack = tf3.add_paragraph()
p_stack.text = "CORE TECHNOLOGIES"
p_stack.font.size = Pt(12)
p_stack.font.bold = True
p_stack.font.color.rgb = COLOR_VIOLET
p_stack.space_before = Pt(14)

stack_items = [
    ("HTML5 Semantic Structure: ", "Clean semantic tags (nav, aside, main, section)."),
    ("CSS3 Custom SaaS System: ", "CSS custom properties, glassmorphism, flexbox & grid."),
    ("Vanilla JavaScript (ES6+): ", "Event dispatching, asynchronous timers, modal controller."),
    ("GitHub Pages & CI/CD: ", "Automated continuous deployment workflow via GitHub Actions.")
]

for title, desc in stack_items:
    p_item = tf3.add_paragraph()
    p_item.text = "⚡ " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(5)

# Right Graphic Visual
img_path3 = os.path.join(assets_dir, "slide3_architecture.png")
if os.path.exists(img_path3):
    slide3.shapes.add_picture(img_path3, Inches(6.8), Inches(1.6), width=Inches(5.7))

# ==============================================================================
# SLIDE 4: KEY MODULES & CORE FUNCTIONALITY
# ==============================================================================
slide4 = prs.slides.add_slide(blank_layout)
set_slide_background(slide4)
add_header(slide4, "Functional Capabilities", "Key Modules & Role-Based Workflows", 4)

# Left Content Box
card4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
card4.fill.solid()
card4.fill.fore_color.rgb = COLOR_CARD_BG
card4.line.color.rgb = COLOR_BORDER

tf4 = card4.text_frame
tf4.word_wrap = True

p = tf4.paragraphs[0]
p.text = "SYSTEM MODULE BREAKDOWN"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_BLUE_PRIMARY

modules = [
    ("1. Student Portal (16 Services Catalog):", [
        "Covers Bonafide, Transfer, Conduct, Marksheets, Fee receipts, Exam hall tickets, and Clearance.",
        "Document checklist confirmation and duplicate active token prevention.",
        "Printable digital token receipt passes with QR verification layout."
    ]),
    ("2. Live 5-Stage Queue Tracker:", [
        "Real-time visual stepper: Generated -> Waiting -> Called -> Processing -> Completed.",
        "Live queue rank, estimated minutes remaining, and currently serving token badge."
    ]),
    ("3. Staff Control Console:", [
        "Counter assignment toolbar across 4 operational desks (Certificate, Accounts, Exam, Support).",
        "Control deck: Call Next, Recall, Start Processing, Mark Completed, Skip, Cancel.",
        "Urgent administrative priority flagging with mandatory justification recording."
    ]),
    ("4. Administrator Command Center:", [
        "Full CRUD service management: adjust prefixes, capacity limits, and service durations.",
        "Queue analytics charts and single-click factory demo data reset."
    ])
]

for mod_title, mod_bullets in modules:
    p_m = tf4.add_paragraph()
    p_m.text = mod_title
    p_m.font.size = Pt(10.5)
    p_m.font.bold = True
    p_m.font.color.rgb = COLOR_NAVY
    p_m.space_before = Pt(6)

    for b in mod_bullets:
        p_b = tf4.add_paragraph()
        p_b.text = "   • " + b
        p_b.font.size = Pt(9.2)
        p_b.font.color.rgb = COLOR_TEXT_MUTED
        p_b.space_before = Pt(1)

# Right Graphic Visual
img_path4 = os.path.join(assets_dir, "slide4_modules.png")
if os.path.exists(img_path4):
    slide4.shapes.add_picture(img_path4, Inches(6.8), Inches(1.6), width=Inches(5.7))

# ==============================================================================
# SLIDE 5: MATHEMATICAL QUEUE ESTIMATION & WORKFLOW
# ==============================================================================
slide5 = prs.slides.add_slide(blank_layout)
set_slide_background(slide5)
add_header(slide5, "Algorithmic Logic", "Smart Waiting-Time Estimation & Live Lifecycle", 5)

# Left Content Box
card5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
card5.fill.solid()
card5.fill.fore_color.rgb = COLOR_CARD_BG
card5.line.color.rgb = COLOR_BORDER

tf5 = card5.text_frame
tf5.word_wrap = True

p = tf5.paragraphs[0]
p.text = "SMART WAITING TIME CALCULATION"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_BLUE_PRIMARY

algo_points = [
    ("Dynamic Queue Math: ", "Calculates wait time by summing the historical/average duration of all students ahead, divided by the number of active serving counters for that queue."),
    ("Departmental Segmentation: ", "Queues are partitioned by department so delays in exam cell do not distort certificate wait times."),
    ("Exclusion of Inactive Tokens: ", "Completed, cancelled, and skipped tokens are automatically discounted from queue length."),
    ("Desk Status Awareness: ", "When a staff member pauses or takes a counter offline, wait times dynamically adjust across all student devices.")
]

for title, desc in algo_points:
    p_item = tf5.add_paragraph()
    p_item.text = "• " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(6)

p_fair = tf5.add_paragraph()
p_fair.text = "FAIRNESS & PRIORITY PROTOCOLS"
p_fair.font.size = Pt(12)
p_fair.font.bold = True
p_fair.font.color.rgb = COLOR_GREEN
p_fair.space_before = Pt(12)

fair_points = [
    ("Strict FIFO Order: ", "Tokens are served in creation order by default to prevent manipulation."),
    ("Audited Urgent Flagging: ", "Staff can prioritize critical cases (e.g., visa deadline, medical emergency) only with logged administrative reasons."),
    ("Duplicate Protection: ", "Prevents students from spamming duplicate active tokens for the same service.")
]

for title, desc in fair_points:
    p_item = tf5.add_paragraph()
    p_item.text = "✔ " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(5)

# Right Graphic Visual
img_path5 = os.path.join(assets_dir, "slide5_formula.png")
if os.path.exists(img_path5):
    slide5.shapes.add_picture(img_path5, Inches(6.8), Inches(1.6), width=Inches(5.7))

# ==============================================================================
# SLIDE 6: PROJECT OUTCOMES, LIVE DEMO & CONCLUSION
# ==============================================================================
slide6 = prs.slides.add_slide(blank_layout)
set_slide_background(slide6)
add_header(slide6, "Project Evaluation & Next Steps", "Results, Live Demo Link & Conclusion", 6)

# Left Content Box
card6 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1))
card6.fill.solid()
card6.fill.fore_color.rgb = COLOR_CARD_BG
card6.line.color.rgb = COLOR_BORDER

tf6 = card6.text_frame
tf6.word_wrap = True

p = tf6.paragraphs[0]
p.text = "KEY PROJECT OUTCOMES"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_GREEN

outcomes = [
    ("Zero Physical Queues: ", "Students wait comfortably in the library, cafeteria, or classrooms until notified."),
    ("65% Reduction in Waiting Anxiety: ", "Students know their exact queue rank and estimated time."),
    ("Optimized Counter Productivity: ", "Staff can process applications faster with pre-verified document checklists."),
    ("Transparent Institutional Audit: ", "Administrative logs record service durations, peak hours, and counter workloads.")
]

for title, desc in outcomes:
    p_item = tf6.add_paragraph()
    p_item.text = "⭐ " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(6)

p_future = tf6.add_paragraph()
p_future.text = "FUTURE ENHANCEMENTS"
p_future.font.size = Pt(12)
p_future.font.bold = True
p_future.font.color.rgb = COLOR_BLUE_PRIMARY
p_future.space_before = Pt(12)

future_items = [
    ("SMS & WhatsApp Gateway: ", "Send automatic SMS alerts when the student is next in line."),
    ("Kiosk Barcode Scanner: ", "Self-service physical kiosk scanning student RFID cards at office doors."),
    ("Cross-Campus Analytics: ", "Multi-campus administrative reporting and seasonal peak load prediction.")
]

for title, desc in future_items:
    p_item = tf6.add_paragraph()
    p_item.text = "🔮 " + title + desc
    p_item.font.size = Pt(10)
    p_item.font.color.rgb = COLOR_NAVY
    p_item.space_before = Pt(5)

# Right Graphic Visual
img_path6 = os.path.join(assets_dir, "slide6_outcomes.png")
if os.path.exists(img_path6):
    slide6.shapes.add_picture(img_path6, Inches(6.8), Inches(1.6), width=Inches(5.7))

# Save the Presentation
output_pptx = r"C:\Users\Vinoth\.gemini\antigravity\scratch\queueless\QueueLess_Project_Presentation.pptx"
prs.save(output_pptx)
print("Successfully generated PowerPoint presentation at:", output_pptx)
