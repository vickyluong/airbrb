describe('User Happy Path 2', () => {
  // navigates to the home page
  it('should navigate to the home page successfully', () => {
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  // host registers successfully
  it('should navigate to the register page successfully', () => {
    cy.get('button[name="register"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/register');
  });

  it('should submit the register form successfully', () => {
    cy.get('input[id="register-name"]').focus().type('Josh John');
    cy.get('input[id="register-email"]').focus().type('josh.john@email.com');
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
    cy.get('#listing-title').clear().type('Beach Cabin');
    cy.get('#address-line1').clear().type('10 Hello Street');
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

  // deletes the hosted listing successfully
  it('should delete a listing successfully', () => {
    cy.get('button[name="delete-listing"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/hosted-listings');
  });

  // creates a new listing successfully and publishes it
  it('should navigate to the create listing page successfully', () => {
    cy.wait(6000); // popup that lasts 5000ms
    cy.get('button[name="create-listing"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/listings/create');
  });

  it('should create a listing successfully', () => {
    cy.get('#listing-title').clear().type('Beach Cabin');
    cy.get('#address-line1').clear().type('10 Hello Street');
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

  // host logs out
  it('host should log out so we can register a new user to make the booking', () => {
    cy.get('button[name="logout"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  // guest registers successfully
  it('should navigate to the register page successfully', () => {
    cy.get('button[name="register"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000/register');
  });

  it('should submit the register form successfully', () => {
    cy.get('input[id="register-name"]').focus().type('Neil John');
    cy.get('input[id="register-email"]').focus().type('neil.john@email.com');
    cy.get('input[id="register-password"]').focus().type('password');
    cy.get('input[id="register-confirm-password"]').focus().type('password');

    cy.get('button[type="submit"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('include', 'localhost:3000');
  });

  // guest filters using certain dates
  it('should filter by date successfully', () => {
    cy.contains('button', 'Filter').should('exist').click();
    cy.contains('Filter by:').should('be.visible');
    
    const today = new Date();
    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() + 1);
    const startDate = startDateObj.toLocaleDateString('en-CA');
    
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 5);
    const endDate = endDateObj.toLocaleDateString('en-CA');
    
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Date range:').should('be.visible');
      cy.get('input[type="date"]').first().clear().type(startDate);
      cy.get('input[type="date"]').eq(1).clear().type(endDate);
    });
    
    cy.contains('button', 'Apply filters').should('exist').click();
    
    cy.wait(1000);
    
    cy.url().should('include', 'localhost:3000');
    cy.contains('Filter by:').should('not.exist');
  });

  // guest makes a booking request for the listing
  it('should go to the view listing page of the selected listing', () => {
    cy.get('button[name="details-button"]').should('exist').click();
    cy.wait(1000);
    cy.url().should('match', /localhost:3000\/view-listing\/.+/);
  });
})