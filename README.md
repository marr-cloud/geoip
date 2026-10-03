# GeoIP Cloudflare Worker

A super simple Cloudflare worker that returns the location of the user based on the IP address.

You deploy it on your own Cloudflare account.

## Usage

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/meitrix8208/geoip)

## Response

```json
{
  "city": "Barranquilla",
  "postalCode": "080002",
  "region": "Atlántico",
  "regionCode": "ATL",
  "country": "CO",
  "continent": "SA",
  "timezone": "America/Bogota",
  "latitude": "10.92288",
  "longitude": "-74.78132",
  "asOrganization": "Claro Colombia S.A.",
  "userIP": "your.ip.address.here"
}
```

`GET /` (also `HEAD`, and `OPTIONS` for CORS preflights) is the only endpoint. Any other path returns `404`, any other method `405`. Fields Cloudflare can't resolve are `null`.

## Security

- `Cache-Control: private, no-store`: the response contains the caller's IP and location, so shared caches and proxies must never store it.
- `userIP` comes only from `CF-Connecting-IP`, which Cloudflare sets. `X-Forwarded-For` is ignored because the client controls it.
- `Access-Control-Allow-Origin: *` without credentials: any site can read it, as with any public GeoIP API.
- Security headers on every response (`Content-Security-Policy: default-src 'none'`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Resource-Policy: cross-origin`, `X-Robots-Tag: noindex`).
- The favicon is served by the Worker itself, so viewing the API doesn't contact third parties. Errors never return internal details.

## Pricing (Cloudflare Workers)

Free plan: 100k requests per day on the free plan.

Paid plan: Pay $5/mo for 10M requests per month.

## Based on

[fayazara/whereami](https://github.com/fayazara/whereami)

## Alternatives

There's honestly not much happening here, I needed this for a specific use case and I even found some free services but I didn't want to use them.

- https://apip.cc/json
- https://ipinfo.io/json
- https://ip2c.org/s
