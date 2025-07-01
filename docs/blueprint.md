# **App Name**: Risk Navigator

## Core Features:

- Role-Based Authentication: User authentication and role management using Firebase Authentication. Roles include general user, admin, and super admin. The role must be selected during registration from a dropdown menu, and a single user can have one and only one role.
- Risk Assessment Forms: Input forms for risk assessment with dropdowns and text areas based on the selected menu. Separate forms exist for 'Survey 1' (predefined risk events) and 'Survey 2' (user-defined risk events).
- Data Management: Data storage and retrieval using Firestore, including displaying the logged in user's survey results and admin/super admin views of all data.
- User Management (Super Admin): A CRUD (Create, Read, Update, Delete) interface for user management, accessible only to Super Admins, for adding, editing (including roles), and deleting user accounts.
- Survey Results Table (User): Display survey results for logged in user, in a table format. Only shows the surveys created by the logged in user.
- Aggregated Survey Results Table (Admin/Super Admin): Display all survey results from every user. Visible only to admins and super admins.
- AI-Powered Risk Trend Analysis: Use a generative AI tool that detects emerging risk trends, summarizing prevalent issues and potential impacts, triggered when the superadmin visits the main admin panel.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust, security, and professionalism, mirroring the serious nature of risk assessment.
- Background color: Light gray (#F5F5F5), offering a clean, neutral backdrop that enhances readability and focuses user attention on the content.
- Accent color: Subtle teal (#4CAF50), used sparingly for interactive elements and highlights to guide user interaction without overwhelming the interface.
- Body and headline font: 'Inter', a sans-serif font, for clear and accessible readability across various screen sizes, lending a modern, neutral, objective look to the content.
- Modern, NocoBase-inspired layout with a left-side navigation panel for main sections (Login, User, Admin, Super Admin) and responsive design for usability across devices.
- Professional icon set representing different risk factors and categories, ensuring visual clarity and quick recognition of options and actions.
- Subtle transition animations for page navigations and form submissions to enhance user experience and provide visual feedback without being intrusive.