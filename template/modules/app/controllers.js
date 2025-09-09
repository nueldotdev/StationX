// Controller functions for the app module can be defined here.
// Add new endpoint handlers as needed.

/**
 * 
 * @param {import("station-x").Context} ctx 
 */
export const initialEndpoint = (ctx) => {
    ctx.status(200).json({ message: 'Welcome to app!' })
}

