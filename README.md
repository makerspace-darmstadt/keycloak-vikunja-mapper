# Test locally

```
rm keycloak-vikunja-mapper.jar && zip -vr keycloak-vikunja-mapper.jar mksp-vikunja-mapper.js META-INF && docker run -v $(pwd)/keycloak-vikunja-mapper.jar:/opt/keycloak/providers/keycloak-vikunja-mapper.jar -p 8880:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:23.0.7 start-dev --features="scripts"
```

```
zip -vr keycloak-vikunja-mapper.jar mksp-vikunja-mapper.js META-INF
docker build -t mksp_keycloak:test .
docker run -p 8880:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin mksp_keycloak:test start-dev --features="scripts"
``` 