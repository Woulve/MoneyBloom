# Core Goals

1. Motivate users to save regularly by visualizing long-term growth.
2. Make investing feel approachable through clear, intuitive interactions.
3. Provide insight into how changes over time affect savings outcomes.

# What It Is Not
- Not an income or expense tracker  
- Not a budgeting tool  
- Not a financial-planning advisor  

# Core Features

## 1. Savings Accounts

The application revolves entirely around **Savings Accounts**.  
Users create accounts to simulate long-term savings with fixed base parameters and optional timeline adjustments.

### Creating an Account
Users add a new account through a simple form containing:
- Name  
- Starting amount  
- Monthly contribution  
- Expected yearly growth rate  
- Cashout date in years  

These parameters are **permanently locked** after creation.  
They serve as the immutable base model for the account.

Each account has its own page at the route:  
`/accounts/:id`

A list of all accounts is available at:  
`/accounts`

---

## 2. Timeline Adjustments (Dynamic Changes Over Time)

Although the base parameters cannot be changed after creation, users can modify the projected savings path through **timeline adjustments**.

Users can interact directly with the graph to add adjustment points.  
Each adjustment becomes part of a chronological sequence affecting the calculation going forward.

### Types of timeline adjustments:
- Change in monthly contribution (starting at a specific date)
- Change in expected growth rate (starting at a specific date)
- One-time deposits
- One-time withdrawals

### Interaction Model:
- Clicking on a point in the graph opens a small input popup for selecting adjustment type and value.
- Adjustment markers appear on the timeline.
- Users can drag markers horizontally to change the date or vertically to adjust the value.
- Clicking a marker opens a small popup allowing users to delete it.

---

## 3. Graph Visualization

Every account page features a single, clear, data-driven graph.

### Visual Requirements:
- Professional, modern, flat UI
- Dark mode only
- Minimal, purposeful transitions
- No excessive styling or decorative animations
- Clean typography and balanced spacing

### Information shown:
- Current projected value  
- Future projected value  
- Growth trajectory  
- Timeline adjustment markers  
- Tooltips for precise values on hover  

All projections are recalculated based on:
- Locked base parameters  
- Timeline adjustments  

---

# Technical Architecture

## Frontend: Angular 21
- Standalone components  
- Signals for state management  
- Strict separation of `.ts`, `.html`, `.scss`  
- Smart components for logic and state  
- Dumb components for rendering and user interaction  
- Route structure:
  - `/accounts` → account overview  
  - `/accounts/:id` → individual account  

## Charting
- Implemented using a performant Angular-compatible library (e.g., ngx-echarts, a D3-based solution, or Chart.js with custom rendering)
- Designed for clarity, performance, and readability in a flat dark-mode environment



# What Is Present (Fully Implemented)
1. Savings Accounts ✅
Account Creation Form ✅
All fields implemented: Name, Starting amount, Monthly contribution, Growth rate, Cashout years
Parameters are permanently locked after creation ✅
Form validation with error messages ✅
Account Routes ✅
/accounts - List view of all accounts ✅
/accounts/:id - Individual account detail page ✅
Default redirect from / to /accounts ✅
Account Management ✅
Create accounts ✅
Delete accounts (with confirmation) ✅
LocalStorage persistence ✅

2. Timeline Adjustments ✅
All Four Adjustment Types Implemented ✅
Change in monthly contribution ✅
Change in expected growth rate ✅
One-time deposits ✅
One-time withdrawals ✅
Core Interaction ✅
Click on graph to add adjustment ✅
Popup form for selecting type and value ✅
Adjustments sorted chronologically ✅
Markers appear on graph ✅
Color-coded by type (amber, purple, green, red) ✅

3. Graph Visualization ✅
Visual Requirements Met ✅
Professional, modern, flat UI ✅
Dark mode only ✅
Clean typography and balanced spacing ✅
No excessive animations ✅
Information Displayed ✅
Current projected value ✅
Future projected value ✅
Growth trajectory (smooth line chart) ✅
Timeline adjustment markers (pins) ✅
Tooltips for precise values on hover ✅
Calculation Engine ✅
Compound interest calculations ✅
Applies locked base parameters ✅
Applies timeline adjustments chronologically ✅
Real-time recalculation ✅

❌ What Is Missing (Not Yet Implemented)

1. Draggable Markers ❌
Concept Requirement:
"Users can drag markers horizontally to change the date or vertically to adjust the value."
Status: Not implemented
Markers are visible but not draggable
Would require ECharts graphic component with drag handlers
Click-to-add works, but drag-to-modify does not

2. Click Marker to Delete ❌
Concept Requirement:
"Clicking a marker opens a small popup allowing users to delete it."
Status: Not implemented
Can only add new adjustments, not edit/delete existing ones
Clicking markers doesn't trigger any action
No UI for managing existing adjustments

3. Edit Existing Adjustments ❌
Concept Requirement (implied):
Users should be able to modify or remove timeline adjustments
Status: Partially implemented
Service methods exist (updateAdjustment, deleteAdjustment)
No UI to access these operations
Cannot edit adjustment values after creation