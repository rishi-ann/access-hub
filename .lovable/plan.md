

# Service Booking Platform with Multi-Role Authentication

## Overview
A clean, minimal service booking platform with three distinct user types (Customer, Team, Admin), each with dedicated login flows and dashboards.

---

## 1. Landing Page
A welcoming homepage with:
- Hero section explaining the service booking platform
- Clear call-to-action with three login/signup options:
  - **Customer Portal** - For customers to book and manage appointments
  - **Team Portal** - For staff to manage bookings
  - **Admin Login** - For administrators (separate, simpler login)
- Clean, professional design with plenty of white space

---

## 2. Authentication System

### Customer Authentication
- Dedicated sign up & sign in page
- Email/password registration
- Real user accounts stored in Supabase database
- Redirect to Customer Dashboard after login

### Team Authentication  
- Separate sign up & sign in page (different from customer)
- Email/password registration
- Real user accounts with "team" role in database
- Redirect to Team Dashboard after login

### Admin Authentication
- Simple login form (no sign up)
- Fixed credentials hardcoded for admin access
- **Security Note**: This approach works for demos but should be replaced with database authentication for production
- Redirect to Admin Dashboard after login

---

## 3. Customer Dashboard
A personalized space for customers featuring:
- **Profile & Settings** - View and edit personal information
- **Booking History** - See past and upcoming appointments
- **Notifications** - Alerts about booking confirmations, reminders, updates
- Quick action to book new services
- Clean navigation and logout option

---

## 4. Team Dashboard
A workspace for team members to manage bookings:
- **View All Bookings** - List of customer appointments (upcoming/past)
- **Manage Bookings** - Confirm, reschedule, or cancel appointments
- **Customer Information** - Basic customer details for each booking
- Daily/weekly booking overview
- Simple navigation and logout

---

## 5. Admin Dashboard
Full control panel for administrators:
- **Team Management** - Add/remove team members
- **Service Management** - Add/edit available services
- **Analytics Overview** - Booking stats and trends
- **System Settings** - Basic configuration options
- Full access to view all data

---

## 6. Database Setup
Supabase tables for:
- **Profiles** - User profile information
- **User Roles** - Separate table for customer/team roles (security best practice)
- **Services** - Available services to book
- **Bookings** - Customer appointments with status tracking
- **Notifications** - User notification storage

---

## Technical Approach
- Real authentication with Supabase for Customer & Team
- Role-based access control to protect each dashboard
- Protected routes that redirect unauthorized users
- Clean, consistent UI across all pages using your existing component library

