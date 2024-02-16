const supertest = require("supertest");
const app = require('../api/api');

describe("Event API Testing", () => {
    // For Getting Ticket Availability Status
    test("Successfully getting event status", async () => {
        const event_id = "65c5b933293364d36965884b"; // Example event_id
        const response = await supertest(app)
            .get(`/public/api/event/ticket_availibility?event_id=${event_id}`); // Use GET and pass event_id as a query parameter

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', "Booking Details get successfully.");
        expect(response.body.data).toHaveProperty('sale');
        expect(response.body.data).toHaveProperty('total_tickets');
        expect(response.body.data).toHaveProperty('available_tickets');
    }, 20000); // Adjust timeout as needed

    // For Getting Ticket Availability Status without passing event_id
    test("Fails when event_id is not passed", async () => {
        const response = await supertest(app)
            .get(`/public/api/event/ticket_availibility`); // No event_id in query string

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('code', 400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', "Please Provide Event Id.");
    }, 20000); // Adjust timeout as needed

    // For Getting Ticket Availability Status with a non-existing event_id
    test("Fails when event is not found", async () => {
        const nonExistingEventId = "65c5b933293364d36965884c"; // An event_id unlikely to exist
        const response = await supertest(app)
            .get(`/public/api/event/ticket_availibility?event_id=${nonExistingEventId}`); // Use a non-existing event_id in query string

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('code', 404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', "Event not found.");
    }, 20000); // Adjust timeout as needed


    // Simulating Internal Server Error
    test("Handles internal server error gracefully", async () => {
        const errorInducingEventId = "errorTrigger12345"; // Hypothetical ID or condition to trigger error
        const response = await supertest(app)
            .get(`/public/api/event/ticket_availibility?event_id=${errorInducingEventId}`);

        // Expectations updated to match the provided response structure
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('code', 500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', "Internal Server Error");
    }, 20000); // Adjust timeout as needed
});