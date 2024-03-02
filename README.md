Vikunja Group Mapper for Keycloak
=================================

[Vikunja](https://vikunja.io) is an open-source, self-hostable ToDo app. Next to local accounts it supports OpenID Connect based authentication. Based on a [recent PR](https://kolaente.dev/vikunja/vikunja/pulls/1393/files#diff-8eb6109e24fdfb13abac65ac57c38c64efea1bd7) it is now also possible to dynamically add users to Vikunja Teams when authenticating through OIDC.

This requires the [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) to contain a `vikunja_groups` claim using the format defined below. It is not possible to achieve this format Using the built-in mappers. Therefore, this repository therefore contains a custom Javascript provider implementing an [OpenID Connect Protocol mapper](https://www.keycloak.org/docs/latest/server_development/index.html#_script_providers) that can map client specific roles to Vikunja Teams in the required format.

# Background

Vikunja requires a certain claim `vikunja_groups` to be present in the ID token to allow dynamic team mapping. This claim name is hardcoded and cannot be changed, and expects the following structure:

```json
{
    "vikunja_groups": [
        {
            "name": "team 1",
            "oidcID": 33349
        },
        {
            "name": "team 2",
            "oidcID": 35933
        }
    ]
}
```

The `name` represents the display name of the Team in Vikunja and the `oidcID` is a unique string (max 250 characters) that should never change during the lifecycle of a team.

There's various options how to handle these requirements in Keycloak, the least intrusive method (and the one we're using and which is supported by the mapper in this repository) is to use **Client Roles** to represent Vikunja teams, which can then either be assigned to individual users or user groups. Keycloak automatically assignes a unique UUID4 to each client role, which this mapper is using as `oidcID`, while the name of the client role is used as name for the team.

For Vikunja it doesn't matter how the claim gets added to the token, although the standard way would be to configure the app to request an additional scope (the documentation recommends to use `vikunja_scope`) and assigning the custom mapper to it. This approach is described below, it is however also possible to simply add the mapper to the client directly and set it to `Default` in Keycloak.

# Provider Installation

The custom mapper is provided as a `.jar` file containing the actual JavaScript code and required meta information. For this to work, the file needs to be placed in the correct folder during Keycloak startup, and the `scripts` preview feature [must be enabled](https://www.keycloak.org/server/features).

The following example Dockerfile shows how to achieve this when running in Docker (more information can be found in the [Keycloak documentation](https://www.keycloak.org/server/containers)):

```
FROM quay.io/keycloak/keycloak:latest as builder

# Install provider

COPY keycloak-vikunja-mapper.jar /opt/keycloak/providers/keycloak-vikunja-mapper.jar

# Install custom provider and enable feature
RUN /opt/keycloak/bin/kc.sh build --features="scripts"

FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/ /opt/keycloak/

WORKDIR /opt/keycloak

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
```

Note that this example is not complete (doesn't contain any database configuration) and using `latest` is not considered best practice in production. Afterwards you should be able to see the provider listed in the provider info of the master realm, listet as `script-vikunja-mapper.js`.

# Keycloak Configuration

The recommended way to use this custom provier is to add a custom scope at realm level and assign it to the Vikunja client.

- Go to **Client Scopes** --> **Create Client Scope**
- Set the name to `vikunja_scope` and the type to `Optional`, the remaining fields can stay on their default values
- Switch to the **Mapper** tab and **Configure a new mapper**
- Select `Vikunja Team Mapping` from the list
- Set the **name** and **token claim name** to `vikunja_groups`
- Set **Multivalued** to `enabled`
- Set the **Claim JSON type** to `JSON`
- Disable all sliders except for **Add to ID token**
- Save the mapper

Next, go to the Vikunja Client and perform the following steps:

- Switch to the **Roles** tab and create client roles for each Team you want to manage. The role name will be used as Team name in Vikunja. You can now assign users or user groups to these roles.
- Switch to **Client Scopes**, click **Add client scope** and add the previously configured client scope.

You can test the configuration by using the **Evaluate** tab, add the `vikunja_scope` parameter and select a user with at least one client role assignment. You should now see the required claim in the id token preview shown below.

# Local development

When working on the script, it is advisable to spin up a local development instance of Keycloak. The following command simply creates the `.jar` file needed for Keycloak, mounts it into a container and exposes Keyloak on port 8080 locally.

```bash
rm keycloak-vikunja-mapper.jar && zip -vr keycloak-vikunja-mapper.jar vikunja-mapper.js META-INF && docker run -v $(pwd)/keycloak-vikunja-mapper.jar:/opt/keycloak/providers/keycloak-vikunja-mapper.jar -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:23.0.7 start-dev --features="scripts"
```
