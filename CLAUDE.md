# Claude Memory for Mobile Password Manager

## Project Overview
React Native mobile password manager app using Expo and NativeWind for styling.

## Tech Stack
- React Native with Expo
- Expo Router for navigation
- NativeWind (Tailwind CSS for React Native)
- Context API for state management

## Project Structure
```
app/
├── _layout.tsx          # Root layout with PasswordProvider and Stack navigation
├── index.tsx            # Home page (renders PasswordList component)
├── add.tsx              # Add password page with complete form implementation
├── password/[id]/
│   ├── index.tsx        # Password detail page
│   └── edit.tsx         # Edit password page
└── globals.css          # Global styles

components/
└── passwordList.tsx     # Main password list component with FlatList

contexts/
└── PasswordContexts.jsx # Password context with dummy data and state management
```

## Current Implementation Status

### ✅ Completed Features
- **Home Page** (`app/index.tsx`): Renders PasswordList component
- **Password List Component** (`components/passwordList.tsx`): 
  - Displays passwords in FlatList
  - Navigation to detail page on item press
  - Uses NativeWind classes for styling
- **Password Detail Page** (`app/password/[id]/index.tsx`):
  - Shows selected password details (website, username, password)
  - Has functional "Edit" button in header that navigates to edit screen
- **Navigation Setup** (`app/_layout.tsx`):
  - Stack navigation with Expo Router
  - PasswordProvider wrapping entire app
  - Configured screens for home, password detail, add password, and edit password
- **State Management** (`contexts/PasswordContexts.jsx`):
  - Context API for password state
  - Dummy data with 4 sample passwords
  - selectedPassword state for detail view
  - addPassword function for adding new passwords with auto-generated IDs
  - updatePassword function for editing existing passwords
- **Add Password Screen** (`app/add.tsx`):
  - Complete form UI with website, username, password fields
  - Form validation and submission handling
  - Navigation back to home after saving
  - Uses NativeWind styling consistent with app design
- **Edit Password Screen** (`app/password/[id]/edit.tsx`):
  - Pre-populated form with existing password data
  - Form validation and update handling
  - Updates both passwords array and selectedPassword state
  - Navigation back to detail page after saving
- **Navigation to Add/Edit Screens**:
  - Floating action button (+) on home screen navigates to add screen
  - Edit button in password detail header navigates to edit screen

### 🚧 In Progress / Issues
- **File Extension Inconsistency**: Context is `.jsx` but imported as `.tsx`

### ❌ Missing Features
- Delete password functionality
- Data persistence (currently using dummy data)
- Search/filter functionality
- Password security features (visibility toggle, copy-to-clipboard)

## Commands to Run
- `npm start` - Start Expo development server
- `npm run lint` - Run linting (if configured)
- `npm run typecheck` - Run TypeScript checking (if configured)

## Current Dummy Data Structure
```javascript
{ id: number, website: string, username: string, password: string }
```

## Next Priority Tasks
1. Add delete functionality
2. Implement data persistence
3. Add search/filter functionality
4. Implement password security features (visibility toggle, copy-to-clipboard)

## Development Notes
- Using NativeWind for styling (Tailwind CSS classes)
- Context provides: `passwords`, `setPasswords`, `selectedPassword`, `setSelectedPassword`, `addPassword`, `updatePassword`
- Navigation handled by Expo Router with file-based routing
- Add screen configured as modal presentation in navigation stack

## Update Log
- Updated current project structure and implementation status
- Reviewed existing features and pending tasks