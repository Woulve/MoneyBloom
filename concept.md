# 🎯 Core Goals

1. Motivate users to save regularly by visualizing long-term growth.
2. Make investing feel rewarding through gamification and smooth interactive visuals.
3. Provide clear insight into how small changes affect long-term outcomes—both in experimentation mode and in locked savings accounts.

# What it is NOT
- An income and expense tracker
- A spendings management system
- A budgeting or financial-planning advisor

# 🧩 Core Features

## 1. Main Experimentation Graph (Playground Mode)

When users open the app, they are greeted with a **single large interactive graph** designed purely for experimentation.  
This “playground” allows users to understand long-term savings growth without creating an account.

### Controls included:
- Starting amount (input field)
- Monthly contribution (slider from 0-5000)
- Expected yearly growth rate (slider from 0%-15%)
- Cashout date in years (slider from 1-50)

### Behavior:
- The graph updates **in real time with smooth animations** as sliders change.
- Users can tweak values freely.
- These values do **not** persist—they are only for exploration.

A **top bar** includes:
- A button **“Add Savings Account”**
- A currency selector

When the user clicks “Add Savings Account,” a modal or form appears where they can **manually enter static values** for:
- Name  
- Starting amount  
- Monthly contribution  
- Expected yearly growth rate  
- Cashout date in years  

Once created, the account behaves differently from the playground graph.

---

## 2. Savings Accounts (Locked Parameters + Timeline Editing)

Users can create multiple savings accounts.  
Each account receives its own page at the route:  
`/accounts/:id`

### Important Change:
The four base parameters (starting amount, monthly contribution, growth rate, cashout range) are **locked forever** after creation.  
They **cannot** be changed—only augmented via timeline adjustments.

### Allowed timeline adjustments:
Users can add points on the timeline by clicking on the graph where:
- Monthly contribution changes starting at a specific date
- Expected growth percentage changes starting at a specific date  
- One-time deposits or withdrawals are added  

These adjustments simulate real-life events like:
- A raise  
- A bonus  
- Pausing savings  
- A major purchase  
- Market growth/decline periods  

When clicking on the graph, a small popup appears allowing users to select the type of adjustment and enter the new value.
Each adjustment is shown as a marker on the graph with a specified label, and users can drag these markers vertically to change the value or horizontally to change the date.
When clicked, a small popup allows users to delete the adjustment.

---

## 3. Graph Visualization

Every graph—both in playground mode and account mode—uses a consistent visual style:

### Visual Requirements:
- Dark, vibrant, futuristic color palette
- Smooth transitions when values change or when new timeline points are added
- Vertical stacking for multiple account graphs in overview mode
- Crisp, intuitive animations to reinforce the “growth over time” concept

### Information shown:
- Current projected value  
- Future projected value  
- Growth trend line  
- Timeline adjustment markers  
- Tooltip on hover for precise values  

Account graphs are **only influenced by timeline adjustments**, not by sliders (since base values are locked).

---

# 🏗 Technical Architecture

## Frontend: Angular 21
- **Standalone components**
- **Signals** for reactive state management
- **Route structure**  
  - `/` → playground graph  
  - `/accounts/:id` → individual account  
  - `/accounts` → list/overview
- **Smart vs. dumb components**  
  - Smart components handle data loading, signals, and business logic  
  - Dumb components handle rendering, animation, and user interactions
- **Structure**  
  - `.ts`, `.html`, `.scss` files clearly separated  
  - Charts implemented using a performant Angular-compatible library (e.g., ngx-echarts, D3-based solution, or chart.js with custom rendering)