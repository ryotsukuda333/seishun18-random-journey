import { Context } from 'hono';
import { getDestinations, getDestinationById } from '../services/destinationService';

export const destinationsHandler = async (c: Context) => {
    const id = c.req.param('id');

    try {
        // 特定のIDが指定されている場合は、そのIDの旅行先情報を返す
        if (id) {
            const destination = await getDestinationById(c.env.DB, id);

            if (!destination) {
                return c.json({
                    error: {
                        message: `Destination with ID ${id} not found`,
                    }
                }, 404);
            }

            return c.json({ destination });
        }

        // IDが指定されていない場合は、すべての旅行先情報を返す
        const destinations = await getDestinations(c.env.DB);
        return c.json({ destinations });
    } catch (error) {
        console.error(`Error fetching destinations: ${error}`);
        return c.json({
            error: {
                message: 'Failed to fetch destinations',
            }
        }, 500);
    }
}; 