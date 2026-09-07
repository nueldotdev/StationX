// Controller functions for the app module can be defined here.
// Add new endpoint handlers as needed.

/**
 * 
 * @param {import("station-x").Context} ctx 
 */
export const initialEndpoint = {
    GET: (ctx) => ctx.status(200).json({ message: 'Hello, World!' }),

    POST: (ctx) => {
        const data = ctx.body;
        ctx.status(200).json({ message: 'Data received', data });
    }
}