export default {
	async fetch(request): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (request.method !== 'GET') {
			return new Response(JSON.stringify({ error: 'Method not allowed' }), {
				status: 405,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		try {
			const userIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 'unknown';
			const locationData = {
				city: request.cf?.city || null,
				postalCode: request.cf?.postalCode || null,
				region: request.cf?.region || null,
				regionCode: request.cf?.regionCode || null,
				country: request.cf?.country || null,
				continent: request.cf?.continent || null,
				timezone: request.cf?.timezone || null,
				latitude: request.cf?.latitude || null,
				longitude: request.cf?.longitude || null,
				asOrganization: request.cf?.asOrganization || null,
				userIP,
			};

			return new Response(JSON.stringify(locationData, null, 2), {
				status: 200,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Cache-Control': 'public, max-age=300',
					'X-Content-Type-Options': 'nosniff',
					'X-Frame-Options': 'DENY',
				},
			});
		} catch (error) {
			console.error('Error processing request:', error);
			return new Response(
				JSON.stringify({
					error: 'Internal server error',
					message: error instanceof Error ? error.message : 'Unknown error',
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;
