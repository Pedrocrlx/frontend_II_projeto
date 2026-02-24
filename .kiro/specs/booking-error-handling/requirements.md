# Requirements Document

## Introduction

This document specifies the error handling enhancement for the BookingSheet component in the BarberBrand SaaS platform. The enhancement replaces inconsistent error feedback (mix of toast.warning and alert()) with a unified Sonner toast-based approach, implements comprehensive validation with clear error messages in English, and adds explicit HTTP status code handling for Server Actions to improve user experience and system reliability.

## Glossary

- **BookingSheet**: The client-side React component that handles the booking form UI and user interactions
- **Server_Action**: Next.js server-side functions (createBooking, checkTimeSlotAvailability, clientHasBookingAtTime) that perform database operations
- **Sonner**: The shadcn/ui toast notification library used for user feedback
- **Validation_Error**: An error caused by invalid user input that prevents booking submission
- **Server_Error**: An error that occurs during Server Action execution (database, network, or system failures)
- **HTTP_Status_Code**: Numeric code indicating the result of a Server Action operation (200 for success, 400 for validation errors, 409 for conflicts, 500 for server errors)
- **Time_Slot**: A specific date and time combination selected by the user for booking
- **Phone_Format**: Portuguese phone number format (+351 followed by 9 digits starting with 1-9)

## Requirements

### Requirement 1: Unified Toast Notification System

**User Story:** As a user, I want to receive consistent visual feedback for all booking actions, so that I can understand the result of my actions without confusion.

#### Acceptance Criteria

1. THE BookingSheet SHALL use Sonner toast notifications for all user feedback messages
2. THE BookingSheet SHALL NOT use browser alert() or console methods for user-facing messages
3. WHEN a validation error occurs, THE BookingSheet SHALL display a toast.error() notification
4. WHEN a booking is successfully created, THE BookingSheet SHALL display a toast.success() notification
5. WHEN a server error occurs, THE BookingSheet SHALL display a toast.error() notification with a user-friendly message

### Requirement 2: Client-Side Input Validation

**User Story:** As a user, I want immediate feedback on invalid form inputs, so that I can correct errors before submitting the booking.

#### Acceptance Criteria

1. WHEN the user attempts to submit with empty required fields, THE BookingSheet SHALL display an error toast stating "Please fill in all required fields"
2. WHEN the customer name field is empty or contains only whitespace, THE BookingSheet SHALL display an error toast stating "Please enter your name"
3. WHEN the customer phone field is empty or contains only whitespace, THE BookingSheet SHALL display an error toast stating "Please enter your phone number"
4. WHEN the phone number does not match the Phone_Format pattern, THE BookingSheet SHALL display an error toast stating "Please enter a valid phone number (format: +351 912345678)"
5. WHEN no barber is selected, THE BookingSheet SHALL display an error toast stating "Please select a barber"
6. WHEN no time slot is selected, THE BookingSheet SHALL display an error toast stating "Please select a time slot"
7. WHEN the selected time is outside business hours (before 9:00 or after 19:30), THE BookingSheet SHALL display an error toast stating "Please select a time between 9:00 AM and 7:30 PM"

### Requirement 3: Server Action Response Structure

**User Story:** As a developer, I want Server Actions to return structured responses with HTTP status codes, so that the client can handle different error scenarios appropriately.

#### Acceptance Criteria

1. THE Server_Action SHALL return an object containing a status code and message for all operations
2. WHEN a Server_Action completes successfully, THE Server_Action SHALL return status code 200 and a success message
3. WHEN a Server_Action encounters a validation error, THE Server_Action SHALL return status code 400 and a descriptive error message
4. WHEN a Server_Action encounters a conflict (duplicate booking), THE Server_Action SHALL return status code 409 and a conflict description
5. WHEN a Server_Action encounters a database or system error, THE Server_Action SHALL return status code 500 and a generic error message
6. THE Server_Action SHALL log detailed error information to the server console while returning user-friendly messages to the client

### Requirement 4: Time Slot Availability Validation

**User Story:** As a user, I want to know immediately if my selected time slot is unavailable, so that I can choose an alternative time without wasting effort.

#### Acceptance Criteria

1. WHEN the user selects a Time_Slot, THE BookingSheet SHALL call checkTimeSlotAvailability before submission
2. WHEN checkTimeSlotAvailability returns status code 409, THE BookingSheet SHALL display an error toast stating "This time slot is already booked. Please select another time"
3. WHEN checkTimeSlotAvailability returns status code 500, THE BookingSheet SHALL display an error toast stating "Unable to check availability. Please try again"
4. WHEN checkTimeSlotAvailability returns status code 200, THE BookingSheet SHALL proceed with booking submission

### Requirement 5: Duplicate Booking Prevention

**User Story:** As a user, I want to be prevented from creating overlapping bookings, so that I don't accidentally double-book myself.

#### Acceptance Criteria

1. WHEN the user submits a booking, THE BookingSheet SHALL call clientHasBookingAtTime to check for existing bookings
2. WHEN clientHasBookingAtTime returns status code 409, THE BookingSheet SHALL display an error toast stating "You already have a booking at this time. Please choose a different time or cancel your existing booking"
3. WHEN clientHasBookingAtTime returns status code 500, THE BookingSheet SHALL display an error toast stating "Unable to verify existing bookings. Please try again"
4. WHEN clientHasBookingAtTime returns status code 200 with no conflicts, THE BookingSheet SHALL proceed with booking creation

### Requirement 6: Booking Creation Error Handling

**User Story:** As a user, I want clear feedback when my booking fails to be created, so that I understand what went wrong and can take appropriate action.

#### Acceptance Criteria

1. WHEN createBooking returns status code 200, THE BookingSheet SHALL display a success toast stating "Booking confirmed successfully!"
2. WHEN createBooking returns status code 400, THE BookingSheet SHALL display an error toast with the validation error message from the server
3. WHEN createBooking returns status code 409, THE BookingSheet SHALL display an error toast stating "This time slot was just booked by someone else. Please select another time"
4. WHEN createBooking returns status code 500, THE BookingSheet SHALL display an error toast stating "Failed to create booking. Please try again or contact support"
5. WHEN createBooking completes successfully, THE BookingSheet SHALL reset the form fields to their initial state

### Requirement 7: Loading State Management

**User Story:** As a user, I want visual feedback during booking submission, so that I know the system is processing my request.

#### Acceptance Criteria

1. WHEN the user clicks the submit button, THE BookingSheet SHALL disable the submit button and display loading text
2. WHILE a Server_Action is executing, THE BookingSheet SHALL prevent form modifications
3. WHEN a Server_Action completes (success or failure), THE BookingSheet SHALL re-enable the submit button and restore normal button text
4. WHEN a Server_Action takes longer than 3 seconds, THE BookingSheet SHALL display an informational toast stating "Processing your booking, please wait..."

### Requirement 8: Error Message Localization

**User Story:** As a developer, I want all error messages in English in the code, so that the codebase follows the project's coding guidelines and maintains consistency.

#### Acceptance Criteria

1. THE BookingSheet SHALL define all user-facing error messages in English
2. THE Server_Action SHALL return all error messages in English
3. THE BookingSheet SHALL NOT contain Portuguese error messages in the source code
4. FOR ALL error scenarios, THE BookingSheet SHALL display messages that are clear, actionable, and user-friendly

### Requirement 9: Validation Order and Early Exit

**User Story:** As a user, I want to see the most relevant error first, so that I can fix issues in a logical order.

#### Acceptance Criteria

1. THE BookingSheet SHALL validate required fields before format validation
2. THE BookingSheet SHALL validate format rules before calling Server Actions
3. THE BookingSheet SHALL validate time slot availability before checking duplicate bookings
4. THE BookingSheet SHALL check duplicate bookings before creating the booking
5. WHEN any validation fails, THE BookingSheet SHALL stop processing and display the error without proceeding to subsequent validations
