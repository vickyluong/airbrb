describe('User Happy Path 1', () => {
  // registers successfully
  it('should navigate to the home page successfully', () => {
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  it('should navigate to the register page successfully', () => {
    cy.get('button[name="register"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/register');
  });

  it('should submit the register form successfully', () => {
    cy.get('input[id="register-name"]').focus().type('Teddy John');
    cy.get('input[id="register-email"]').focus().type('teddy.john@email.com');
    cy.get('input[id="register-password"]').focus().type('password');
    cy.get('input[id="register-confirm-password"]').focus().type('password');

    cy.get('button[type="submit"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  // creates a new listing successfully
  it('should navigate to the create listing page successfully', () => {
    cy.get('button[name="create-listing"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/listings/create');
  });

  it('should create a listing successfully', () => {
    cy.get('#listing-title').clear().type('BeachHouse');
    cy.get('#address-line1').clear().type('10 Bye Street');
    cy.get('#address-city').clear().type('Sydney');
    cy.get('#address-state').clear().type('NSW');
    cy.get('#address-postcode').clear().type('2000');
    cy.get('#address-country').clear().type('Australia');
    cy.get('#listing-price').clear().type('750');

    cy.get('#property-type').click();
    cy.get('li[data-value="House"]').click();

    cy.get('#bathrooms').clear().type('1');
    cy.get('#num-bedrooms').clear().type('1');

    cy.get('#bedroom-0-beds').should('exist').clear().type('1');

    cy.get('#bedroom-0-bedtype-0').click();
    cy.get('li[data-value="Queen"]').click();

    cy.contains('label', 'Wi-Fi').click();

    cy.contains('label', 'Use YouTube URL').click();
    cy.get('input[id="thumbnail-youtube"]').clear().type('https://www.youtube.com/embed/dsMAUPT_s3k?si=fILXOEAVC-yuWuz2');

    cy.get('button[type="submit"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  // updates the thumbnail and title of the listing successfully 
  it('should navigate to the edit listing page successfully', () => {
    cy.get('button[name="edit-listing"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('match', /localhost:3000\/edit-listing\/.+/);
  });

  it('should update the thumbnail and title successfully', () => {
    cy.get('#edit-title').should('exist').clear().type('Beach View House');
    cy.get('#edit-thumbnail-file').selectFile('./public/beachhouse.jpeg');
    cy.get('button[type="submit"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  // publish a listing successfully
  it('should publish a listing successfully', () => {
    cy.get('button[name="publish-button"]').should('exist').click();
    cy.contains('Publish Listing - Set Availability').should('be.visible');
    
    // calculate the dates: start date (today) and end date (7 days from today)
    const today = new Date();

    const startDate = today.toLocaleDateString('en-CA');  // "20/11/2025"

    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 7);
    const endDate = endDateObj.toLocaleDateString('en-CA');  // "27/11/2025"
    
    cy.get('input[type="date"]').first().clear().type(startDate);
    cy.get('input[type="date"]').eq(1).clear().type(endDate);
    
    cy.get('button[name="publish-listing-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  // unpublish a listing successfully
  it('should unpublish a listing successfully', () => {
    cy.get('button[name="unpublish-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  // make a booking successfully
  it('should publish the listing again so we can book it', () => {
    cy.get('button[name="publish-button"]').should('exist').click();
    cy.contains('Publish Listing - Set Availability').should('be.visible');
    
    const today = new Date();

    const startDate = today.toLocaleDateString('en-CA');  // "20/11/2025"

    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 7);
    const endDate = endDateObj.toLocaleDateString('en-CA');  // "27/11/2025"
    
    cy.get('input[type="date"]').first().clear().type(startDate);
    cy.get('input[type="date"]').eq(1).clear().type(endDate);
    
    cy.get('button[name="publish-listing-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  it('should log out so we can register a new user to make the booking', () => {
    cy.get('button[name="logout"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  it('should register a new user successfully', () => {
    cy.get('button[name="register"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/register');

    cy.get('input[id="register-name"]').focus().type('Bruce John');
    cy.get('input[id="register-email"]').focus().type('bruce.john@email.com');
    cy.get('input[id="register-password"]').focus().type('password');
    cy.get('input[id="register-confirm-password"]').focus().type('password');

    cy.get('button[type="submit"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  it('should go to the view listing page of the selected listing', () => {
    cy.get('button[name="details-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('match', /localhost:3000\/view-listing\/.+/);
  });

  it('should go to the booking screen for that listing', () => {
    cy.get('button[name="book-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('match', /localhost:3000\/booking\/.+/);
  });

  it('should create a booking for that listing successfully', () => {
    cy.contains('Book Listing').should('be.visible');
    
    // Use local time instead of UTC to avoid timezone issues
    const today = new Date();

    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() + 2);
    const startDate = startDateObj.toLocaleDateString('en-CA');

    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 5);
    const endDate = endDateObj.toLocaleDateString('en-CA');
    
    cy.get('input[type="date"]').first().clear().type(startDate);
    cy.get('input[type="date"]').eq(1).clear().type(endDate);
    
    cy.wait(1000);
    cy.get('button[name="confirm-booking"]').should('not.be.disabled').click();
    
    cy.wait(1000);
    cy.url().should('match', /localhost:3000\/booking\/.+/);
  });

  // logs out of the application successfully
  it('should log out of the application successfully', () => {
    cy.wait(6000); // booking has a popup confirmation that lasts 5000 ms
    cy.get('button[name="logout"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });
})