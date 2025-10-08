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
