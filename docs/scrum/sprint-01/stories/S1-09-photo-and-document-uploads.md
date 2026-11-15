# S1-09: Cloudflare R2 uploads, WebP optimisation, generic documents

**Details:** Pri M, track B, D4 to D6
**Acceptance Criteria:** [See S1-09 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* React uploads through pre-signed Cloudflare R2 URLs issued by Spring Boot; approved property photos are delivered from the public `findstay-property-images` bucket as optimised WebP, while verification and tenancy documents remain private.
- *Database:* media_asset; document(owner_type, owner_id, ...).
- *API:* Spring creates and authorises media records, validates metadata and promotes approved images from a private submission path to the public bucket. It never proxies file bytes. Storage policies restrict each user to their own upload path, and private documents are retrieved by signed URL.
- *Tests:* Storage-policy isolation, oversize and wrong-type rejection, signed-URL expiry and image payload size on a throttled connection.
