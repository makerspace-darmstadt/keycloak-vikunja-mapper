// This script contains a custom attribute mapper to map
// client roles to vikunja teams in the format that is required
// by vikunja. 

// Other roles or other logic could also be used, depending on your
// use case.

// Get client we're operating on
var client = keycloakSession.getContext().getClient();

// Iterate through all client role assignments and add value to vikunja_groups
var groups = [];
user.getClientRoleMappingsStream(client).forEach(function (roleModel) {

    groups.push({
        oidcID: roleModel.getId(),
        name: roleModel.getName()
    });
});

// Set claim. Using export doesn't work due to JSON type parsing in Keycloak
token.setOtherClaims("vikunja_groups", Java.to(groups, "java.util.Map[]"));
