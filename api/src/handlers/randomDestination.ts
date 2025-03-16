import { Context } from 'hono';
import { getRandomDestination } from '../services/destinationService';

export const randomDestinationHandler = async (c: Context) => {
    try {
        const destination = await getRandomDestination(c.env.DB);

        if (!destination) {
            return c.json({
                error: {
                    message: 'No destinations available',
                }
            }, 404);
        }

        return c.json({ destination });
    } catch (error) {
        console.error(`Error fetching random destination: ${error}`);
        return c.json({
            error: {
                message: 'Failed to fetch random destination',
            }
        }, 500);
    }
}; 