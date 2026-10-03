// Favicon servido por el propio Worker: un redirect a un tercero le filtra la IP del visitante.
const FAVICON = Uint8Array.from(
	atob(
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB1UlEQVR4nM2SzWsTQRjGx7aevXjdj9kmwdrSKumlFURrI9ZCe+rFggj9M4Rusp0ks2qrxh6sB/HSS22iBUnRkyD0ECj9H1o8tQo2s+9mM5t9nQ0aLPgR6MWBH/MyzPPMMy8vIf/1wjnS2wHJme6F6vLvBP80QZv0KPri+itPnxN8YAH40KooXLAbfHDgryZI1KvKIK794ojpOdYucgvxAW0hpwgOBeAX77TvrqXPnjBqi9WBWErcFCw1FeQTFSXE40VD1m0jjHfJDJQF60vDvZTspI1Nfkb+5iTvRQWKAaMhOGZYzxoxrR/EtfQdI5IvRllQnZmHN7NaJ8Hxo/T5sNBfxSJF39Fl09FRKkKmY6RexrwZ4YqFftbYbVUzL3FnGuXmxGd4fXucCGZNiZx5JLLtqJFgyX1wR2rCvVzz+PBHrzi4DSxVhnxizb+v0+a7mavB1vR7WckcyreTe0Qupw7wsWoWpxG6VP2zH4ElURlFqieBt2TVvbiBjlmD9fExJfrUKGea4dYk4odbSIBZJS+rL0POXGljG0/A1kqQ00rC1lYhZ8Q89xY1N1i/crdZnngVlK89CzavP5WVGw+7Hq4/D8+GGtNuse0e3Jjr/ZXTJzjt+g6DUSgIxqET0wAAAABJRU5ErkJggg==',
	),
	(c) => c.charCodeAt(0),
);

const SECURITY_HEADERS: Record<string, string> = {
	'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'no-referrer',
	'Cross-Origin-Opener-Policy': 'same-origin',
	// API pública: cualquier origen debe poder leerla, también páginas con COEP.
	'Cross-Origin-Resource-Policy': 'cross-origin',
	'Permissions-Policy': 'browsing-topics=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()',
	'X-Permitted-Cross-Domain-Policies': 'none',
	'X-Robots-Tag': 'noindex, nofollow',
	// IP y ubicación son datos personales: nunca en cachés compartidas.
	'Cache-Control': 'private, no-store, no-transform',
};

const CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
};

function respond(body: BodyInit | null, status: number, headers: Record<string, string> = {}): Response {
	return new Response(body, { status, headers: { ...SECURITY_HEADERS, ...CORS_HEADERS, ...headers } });
}

function json(data: unknown, status = 200): Response {
	return respond(JSON.stringify(data, null, 2), status, { 'Content-Type': 'application/json; charset=utf-8' });
}

function route(request: Request): Response {
	const { pathname } = new URL(request.url);

	if (pathname === '/favicon.ico') {
		return respond(FAVICON, 200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, no-transform' });
	}
	if (pathname === '/robots.txt') {
		return respond('User-agent: *\nDisallow: /\n', 200, {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, no-transform',
		});
	}
	if (pathname !== '/') {
		return json({ error: 'Not found' }, 404);
	}

	if (request.method === 'OPTIONS') {
		return respond(null, 204, {
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400',
		});
	}
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return respond(JSON.stringify({ error: 'Method not allowed' }), 405, {
			'Content-Type': 'application/json; charset=utf-8',
			Allow: 'GET, HEAD, OPTIONS',
		});
	}

	// Solo CF-Connecting-IP: lo fija Cloudflare. X-Forwarded-For lo controla el cliente.
	const userIP = request.headers.get('CF-Connecting-IP');
	return json({
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
	});
}

export default {
	async fetch(request): Promise<Response> {
		let response: Response;
		try {
			response = route(request);
		} catch (error) {
			console.error('Error processing request:', error);
			response = json({ error: 'Internal server error' }, 500);
		}
		return request.method === 'HEAD' ? new Response(null, response) : response;
	},
} satisfies ExportedHandler<Env>;
