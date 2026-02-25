# Implementation Plan: International Booking Enhancements

## Overview

This implementation adds international phone number support with country-specific validation for 5 countries (Portugal, Brazil, England, Germany, France) and smart calendar filtering that displays only dates where the selected barber has available time slots. The implementation modifies existing booking components and creates new utilities for phone validation and availability checking.

## Tasks

- [x] 1. Update database schema and run migration
  - Add `customerCountry` field to Booking model in `prisma/schema.prisma`
  - Update `customerPhone` field to support international format
  - Generate and run Prisma migration
  - _Requirements: Store country code with booking, support international phone format_

- [x] 2. Create phone validation utilities
  - [x] 2.1 Create `src/lib/utils/phone-validation.ts` with country configurations
    - Define `CountryConfig` interface
    - Define `InternationalPhone` interface
    - Create `COUNTRY_CONFIGS` constant with patterns for PT, BR, GB, DE, FR
    - _Requirements: Country-specific validation patterns, support 5 countries_
  
  - [x] 2.2 Implement `validateInternationalPhone()` function
    - Clean input (remove non-digits)
    - Validate against country-specific pattern
    - Return validation result with formatted full number
    - _Requirements: Validate phone numbers, format with country code_
  
  - [x] 2.3 Implement `formatPhoneWithCountryCode()` helper function
    - Concatenate dial code with local number
    - Ensure proper formatting
    - _Requirements: Format international phone numbers_
  
  - [ ]* 2.4 Write property tests for phone validation
    - **Property 1: Phone validation is deterministic**
    - **Property 2: Valid phone numbers always start with "+"**
    - **Property 3: Full number length is sum of dial code and local number**
    - **Property 10: Phone number cleaning preserves digits**
    - **Validates: Phone validation correctness**

- [x] 3. Create barber availability server action
  - [x] 3.1 Create `src/app/_actions/get-barber-availability.ts`
    - Define `AvailabilityQuery` interface
    - Define `AvailabilityResponse` interface
    - Define `DateAvailability` interface
    - _Requirements: Query barber availability by date range_
  
  - [x] 3.2 Implement `getBarberAvailableDates()` server action
    - Query database for bookings in date range
    - Calculate available dates using business hours (9-19)
    - Return array of available dates with slot counts
    - Add "use server" directive
    - _Requirements: Fetch availability data, calculate available slots_
  
  - [x] 3.3 Implement `calculateAvailableSlots()` helper function
    - Generate all possible 30-minute time slots
    - Check each slot against existing bookings
    - Filter out slots that overlap with bookings
    - Ensure slots fit within business hours
    - _Requirements: Calculate time slot availability_
  
  - [ ]* 3.4 Write property tests for availability calculation
    - **Property 4: Available dates are subset of queried date range**
    - **Property 5: Available dates have at least one available slot**
    - **Property 6: No available slot overlaps with existing booking**
    - **Property 7: All available slots are within business hours**
    - **Validates: Availability calculation correctness**

- [x] 4. Checkpoint - Ensure utilities and server actions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update booking creation server action
  - [x] 5.1 Modify `src/app/_actions/create-booking.ts`
    - Add `customerCountry` parameter to function signature
    - Update Prisma create call to include `customerCountry` field
    - Ensure `customerPhone` stores full international format
    - _Requirements: Store country code with booking_
  
  - [ ]* 5.2 Write unit tests for booking creation with country code
    - Test booking creation with different countries
    - Verify country code is stored correctly
    - _Requirements: Validate booking storage_

- [x] 6. Implement country selector UI component
  - [x] 6.1 Add country selector to `src/app/[slug]/_components/BookingSheet.tsx`
    - Import country configurations from phone-validation utils
    - Add state for selected country (default: "PT")
    - Create Select component with country options
    - Display country name and dial code in options
    - Position selector above phone input field
    - _Requirements: Country selector UI, display 5 countries_
  
  - [x] 6.2 Update phone input field with country integration
    - Add dial code prefix display
    - Update placeholder based on selected country
    - Add maxLength based on country config
    - _Requirements: Show country code prefix, country-specific placeholders_
  
  - [x] 6.3 Integrate phone validation on form submission
    - Call `validateInternationalPhone()` before submission
    - Display validation errors using Sonner toast
    - Pass validated full number to create-booking action
    - Pass selected country code to create-booking action
    - _Requirements: Validate before submission, show error messages_

- [x] 7. Implement smart calendar with availability filtering
  - [x] 7.1 Add availability state and fetching to BookingSheet
    - Add state for available dates array
    - Add useEffect to fetch availability when barber is selected
    - Call `getBarberAvailableDates()` with 30-day range
    - Handle loading state during fetch
    - _Requirements: Fetch availability when barber selected_
  
  - [x] 7.2 Implement calendar disabled date logic
    - Update Calendar component's `disabled` prop
    - Disable dates not in availableDates array
    - Disable past dates
    - _Requirements: Disable unavailable dates, prevent booking fully booked dates_
  
  - [x] 7.3 Add caching for availability data
    - Create in-memory cache Map with 5-minute TTL
    - Generate cache key from barberId and date range
    - Check cache before fetching fresh data
    - Store timestamp with cached data
    - _Requirements: Cache availability data with 5-minute TTL_
  
  - [ ]* 7.4 Write property tests for calendar filtering
    - **Property 8: Calendar disabled dates are exactly the unavailable dates**
    - **Validates: Calendar filtering correctness**

- [x] 8. Final integration and testing
  - [x] 8.1 Wire all components together
    - Verify country selector updates phone validation
    - Verify barber selection triggers availability fetch
    - Verify calendar only shows available dates
    - Verify booking submission includes country code
    - _Requirements: End-to-end booking flow_
  
  - [ ]* 8.2 Write integration tests for complete booking flow
    - Test full flow: select country → enter phone → select barber → select date → submit
    - Test validation error handling
    - Test calendar filtering with different barbers
    - _Requirements: Validate complete user journey_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All TypeScript interfaces and types are defined in the design document
- Business hours are hardcoded as 9:00-19:00 (9 AM - 7 PM)
- Time slots are 30-minute intervals
- Cache TTL is 5 minutes for availability data
- Default country is Portugal (PT)
- Phone validation patterns are country-specific and defined in COUNTRY_CONFIGS
