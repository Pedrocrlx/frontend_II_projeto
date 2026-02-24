# Implementation Plan: Booking Error Handling

## Overview

This implementation plan converts the booking error handling design into actionable coding tasks. The implementation follows a layered validation approach with early exit patterns, unified toast notifications, and structured server action responses with HTTP status codes. Tasks are organized to build incrementally, validating core functionality early through code.

## Tasks

- [x] 1. Set up server action response structure and types
  - Create or update TypeScript interfaces for ServerActionResponse in `src/app/_actions/create-booking.ts`
  - Define response type with status codes (200, 400, 409, 500) and message field
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement checkTimeSlotAvailability server action
  - [x] 2.1 Update checkTimeSlotAvailability to return structured response
    - Calculate end time based on start time + duration
    - Query database for overlapping bookings for the barber
    - Return status 200 if no overlaps, 409 if conflicts exist, 500 on errors
    - Add error logging with console.error() for server errors
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 2.2 Write property test for checkTimeSlotAvailability
    - **Property 4: Server action response structure consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ]* 2.3 Write property test for error logging
    - **Property 5: Error logging with user-friendly messages**
    - **Validates: Requirements 3.6**

- [x] 3. Implement clientHasBookingAtTime server action
  - [x] 3.1 Update clientHasBookingAtTime to return structured response
    - Calculate end time based on start time + duration
    - Query database for overlapping bookings by customer phone
    - Return status 200 if no conflicts, 409 if client has overlapping booking, 500 on errors
    - Add error logging with console.error() for server errors
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 5.1, 5.2, 5.3_
  
  - [ ]* 3.2 Write unit tests for clientHasBookingAtTime
    - Test no conflict scenario (returns 200)
    - Test conflict scenario (returns 409)
    - Test database error scenario (returns 500)
    - Verify error logging occurs
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Implement createBooking server action
  - [x] 4.1 Update createBooking to return structured response
    - Calculate end time
    - Create booking record in database
    - Revalidate the barbershop page path on success
    - Return status 200 on success, 500 on errors
    - Add error logging with console.error() for server errors
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 4.2 Write unit tests for createBooking
    - Test successful booking creation (returns 200)
    - Test database error scenario (returns 500)
    - Verify path revalidation on success
    - Verify error logging occurs
    - _Requirements: 6.1, 6.4_

- [x] 5. Checkpoint - Ensure server action tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement client-side validation helpers in BookingSheet
  - [x] 6.1 Create validateRequiredFields function
    - Check that date, selectedBarber, selectedTime, customerName, and customerPhone are non-empty
    - Return boolean indicating validation result
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_
  
  - [x] 6.2 Create validatePhoneFormat function
    - Validate phone matches pattern `/^\+351[1-9][0-9]{8}$/`
    - Return boolean indicating validation result
    - _Requirements: 2.4_
  
  - [x] 6.3 Create validateBusinessHours function
    - Check if selected time is between 9:00 AM and 7:30 PM
    - Return boolean indicating validation result
    - _Requirements: 2.7_
  
  - [ ]* 6.4 Write property test for whitespace-only input rejection
    - **Property 1: Whitespace-only input rejection**
    - **Validates: Requirements 2.2, 2.3**
  
  - [ ]* 6.5 Write property test for invalid phone format rejection
    - **Property 2: Invalid phone format rejection**
    - **Validates: Requirements 2.4**
  
  - [ ]* 6.6 Write property test for business hours validation
    - **Property 3: Business hours validation**
    - **Validates: Requirements 2.7**

- [x] 7. Replace inconsistent error feedback with unified toast notifications
  - [x] 7.1 Remove all alert() and console methods for user-facing messages
    - Search for and remove any alert() calls in BookingSheet
    - Search for and remove any console.log/warn for user-facing messages
    - _Requirements: 1.2_
  
  - [x] 7.2 Implement toast.error() for validation errors
    - Add toast.error() calls for each validation failure scenario
    - Use specific error messages from requirements (2.1-2.7)
    - Ensure all messages are in English
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 7.3 Implement toast.success() for successful booking
    - Add toast.success() call with message "Booking confirmed successfully!"
    - _Requirements: 1.4, 6.1_
  
  - [x] 7.4 Implement toast.error() for server errors
    - Add toast.error() calls for server action failures
    - Use user-friendly messages for each error scenario
    - _Requirements: 1.5, 4.2, 4.3, 5.2, 5.3, 6.2, 6.3, 6.4_

- [x] 8. Implement handleBookingSubmit with validation chain
  - [x] 8.1 Create main submission handler with early exit pattern
    - Implement validation order: required fields → phone format → business hours → server actions
    - Stop processing at first validation failure
    - Call server actions in sequence: checkTimeSlotAvailability → clientHasBookingAtTime → createBooking
    - Handle each server action response based on status code
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 8.2 Add loading state management
    - Set isSubmitting to true when submission starts
    - Disable submit button during submission
    - Display loading text on submit button
    - Prevent form modifications during submission
    - Reset isSubmitting when submission completes
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 8.3 Add form reset after successful booking
    - Reset customerName, customerPhone, selectedBarber, selectedTime to initial state
    - Only reset on successful booking (status 200 from createBooking)
    - _Requirements: 6.5_
  
  - [ ]* 8.4 Write property test for early exit validation pattern
    - **Property 9: Early exit validation pattern**
    - **Validates: Requirements 9.2, 9.5**
  
  - [ ]* 8.5 Write property test for form state during async operations
    - **Property 8: Form state during async operations**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ]* 8.6 Write property test for form reset after successful booking
    - **Property 7: Form reset after successful booking**
    - **Validates: Requirements 6.5**
  
  - [ ]* 8.7 Write property test for server error message passthrough
    - **Property 6: Server error message passthrough**
    - **Validates: Requirements 6.2**

- [x] 9. Add server action response handling in BookingSheet
  - [x] 9.1 Handle checkTimeSlotAvailability responses
    - Display error toast for status 409: "This time slot is already booked. Please select another time"
    - Display error toast for status 500: "Unable to check availability. Please try again"
    - Proceed to next validation for status 200
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 9.2 Handle clientHasBookingAtTime responses
    - Display error toast for status 409: "You already have a booking at this time. Please choose a different time or cancel your existing booking"
    - Display error toast for status 500: "Unable to verify existing bookings. Please try again"
    - Proceed to booking creation for status 200
    - _Requirements: 5.2, 5.3_
  
  - [x] 9.3 Handle createBooking responses
    - Display success toast for status 200: "Booking confirmed successfully!"
    - Display error toast with server message for status 400
    - Display error toast for status 409: "This time slot was just booked by someone else. Please select another time"
    - Display error toast for status 500: "Failed to create booking. Please try again or contact support"
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Add long-running operation feedback
  - [x] 10.1 Implement informational toast for operations over 3 seconds
    - Add setTimeout to display toast.info() after 3 seconds
    - Display message: "Processing your booking, please wait..."
    - Clear timeout if operation completes before 3 seconds
    - _Requirements: 7.4_
  
  - [ ]* 10.2 Write unit tests for long-running operation feedback
    - Test that toast.info() is displayed after 3 seconds
    - Test that toast.info() is not displayed if operation completes quickly
    - _Requirements: 7.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples and edge cases
- All error messages must be in English per project coding guidelines
- Server actions must log detailed errors while returning user-friendly messages
