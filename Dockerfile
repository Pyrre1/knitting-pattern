# Static image for the knitting pattern app: serves only frontend/ and core/.
FROM caddy:2.10.2-alpine

# Copying the binary drops its file capability (cap_net_bind_service), so it
# starts with cap_drop: ALL. Port 8080 needs no capability.
RUN cp /usr/bin/caddy /tmp/caddy && mv /tmp/caddy /usr/bin/caddy

COPY Caddyfile /etc/caddy/Caddyfile
COPY frontend /srv/frontend
COPY core /srv/core

USER 1000:1000
EXPOSE 8080
