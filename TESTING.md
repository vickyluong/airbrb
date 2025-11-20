### Happy Path Test 2:
1. Host registers successfully
2. Creates a listing
3. Deletes the listing
4. Creates a new listing, and publishes it 
5. Host logs out
6. Guest registers successfully
7. Guest filters using certain dates
8. Guest makes a booking request for the listing
9. Guest logs out
10. Host logs back in and declines the guest booking request
11. Host logs out
12. Guest logs back in and makes a new booking request
13. Guest logs out
14. Host logs back in and accepts the new booking request made by the guest
15. Host logs out
16. Guest logs back in and leaves a review on the listing
17. Guest logs out 

When deciding what to test for the second happy path, we wanted to test actions that weren’t originally tested in the first happy path, this includes:
- Search by filter
- Accepting a booking request
- Declining a booking request
- Leaving a review on a booking request

But this happy path also tests actions that were in the first happy path as well:
- Logging in and out of the application
- Creating a listing 
- Publishing a listing
- Making a booking request