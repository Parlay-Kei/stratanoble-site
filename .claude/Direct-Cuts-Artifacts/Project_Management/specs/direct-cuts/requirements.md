# Requirements Document

## Introduction

DirectCuts is an on-demand personal grooming platform connecting users with barbers for haircuts, beard trims, and other grooming services. The application allows users to discover barbers, view profiles, book appointments, and manage their grooming schedule.

## Requirements

### 1. Onboarding & Navigation
**User Story:** As a user, I want to easily navigate the app so that I can access different features quickly.

#### Acceptance Criteria
1. WHEN the app launches THEN the system SHALL display a Splash Screen with the DirectCuts logo and branding for 2.5 seconds.
2. WHEN the splash screen completes THEN the system SHALL transition to the Home Screen.
3. WHILE on any main screen (Home, Nearby, Appointments, Profile) THEN the system SHALL display a Bottom Navigation Bar.
4. WHEN a tab is selected in the Bottom Navigation Bar THEN the system SHALL switch to the corresponding screen and highlight the active tab.

### 2. Home Screen & Discovery
**User Story:** As a user, I want to search and browse barbers so that I can find a service provider that meets my needs.

#### Acceptance Criteria
1. WHEN the Home Screen loads THEN the system SHALL display a Search Bar, Category Filters, Trending Barbers, and Popular Barbers.
2. WHEN a user enters text in the Search Bar THEN the system SHALL filter barbers by name or specialty.
3. WHEN a Category Filter is selected THEN the system SHALL display barbers matching that category.
4. WHEN a barber card is clicked THEN the system SHALL navigate to the Barber Profile Screen.

### 3. Nearby Barbers (Map View)
**User Story:** As a user, I want to find barbers near me so that I can minimize travel time.

#### Acceptance Criteria
1. WHEN the Nearby Screen is accessed THEN the system SHALL display a Map View with barber locations marked.
2. WHEN a user enters a location in the Location Search THEN the system SHALL update the map area.
3. WHEN a map pin is clicked THEN the system SHALL highlight the corresponding barber and show a preview card.
4. WHEN the preview card is clicked THEN the system SHALL navigate to the Barber Profile Screen.

### 4. Barber Profile & Services
**User Story:** As a user, I want to view detailed information about a barber so that I can make an informed booking decision.

#### Acceptance Criteria
1. WHEN the Barber Profile Screen is displayed THEN the system SHALL show the barber's name, address, rating, bio, and image.
2. WHEN the screen loads THEN the system SHALL list available services with prices and durations.
3. WHEN the "Book" button is clicked THEN the system SHALL open the Booking Modal.
4. WHEN the "Back" button is clicked THEN the system SHALL return to the previous screen.

### 5. Booking Flow
**User Story:** As a user, I want to book an appointment so that I can secure a time slot.

#### Acceptance Criteria
1. WHEN the Booking Modal opens THEN the system SHALL prompt the user to select a Service, Date, and Time.
2. IF a service, date, and time are selected THEN the "Confirm Booking" button SHALL be enabled.
3. WHEN "Confirm Booking" is clicked THEN the system SHALL close the modal and display a Success Modal.
4. WHEN the Success Modal is closed THEN the system SHALL navigate to the Appointments Screen.

### 6. Appointment Management
**User Story:** As a user, I want to view my appointments so that I can manage my schedule.

#### Acceptance Criteria
1. WHEN the Appointments Screen is accessed THEN the system SHALL display a list of Upcoming and Past appointments.
2. WHEN an upcoming appointment is displayed THEN the system SHALL show options to "Reschedule" or "Cancel".

### 7. User Profile
**User Story:** As a user, I want to manage my profile so that I can keep my information up to date.

#### Acceptance Criteria
1. WHEN the Profile Screen is accessed THEN the system SHALL display user details, booking stats, and a menu of options (Edit Profile, Saved Addresses, etc.).
2. WHEN "Sign Out" is clicked THEN the system SHALL log the user out (functionality to be defined).

### 8. Barber Portal
**User Story:** As a barber, I want to manage my business so that I can accept bookings and track my performance.

#### Acceptance Criteria
1. WHEN a barber logs in THEN the system SHALL redirect them to the Barber Dashboard.
2. WHEN the Dashboard is viewed THEN the system SHALL display today's appointments, total revenue, and rating.
3. WHEN the Availability Manager is accessed THEN the system SHALL allow adding and removing weekly recurring time slots.
4. WHEN the Appointments page is accessed THEN the system SHALL list all appointments with their current status.
5. WHEN an appointment is Pending THEN the barber SHALL be able to Confirm or Decline it.
6. WHEN an appointment is Confirmed THEN the barber SHALL be able to Complete or Cancel it.
