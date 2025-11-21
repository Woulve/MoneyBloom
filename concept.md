# 🎯 Core Goals

1. Motivate users to save regularly by visualizing long-term growth.
2. Make investing feel rewarding through gamification.
3. Provide clear insight into how small changes affect long-term outcomes.

# What it is NOT
- An income and expense tracker
- A spendings management system

# 🧩 Core Features

## 1. Savings Accounts

The user can create multiple savings accounts, with:
- Name (e.g., “Retirement”, “Travel”, “Emergency Fund”)
- Currency
- Starting amount
- Monthly contribution
- Expected yearly growth rate (compound interest)
- Cashout date / target duration

Savings accounts are just settings for a specific growth chart. The charts shall be displayed vertically stacked in the default view.

## 2. Timeline Editing

Accounts include a visual timeline where users can add adjustment points:
- Change monthly contribution starting at a specific month
- Change expected growth percentage starting at a specific period
- One-time deposits or withdrawals
- “Milestones” (non-financial, for motivation)

This makes the projection more realistic and helps experiment with scenarios.

## 3. Graph Visualization

A beautiful, smooth, animated graph showing:
- Current value
- Future projected value
- Growth trend line
- Markers for timeline changes
- A comparison mode (compare two accounts or two scenarios)

# 🏗 Technical Architecture

## Frontend: Angular 21
- Standalone components
- Signals for state management
- Route-based account navigation (`/accounts/:id`)
- Smart/dumb component separation
- HTML seperated from typescript