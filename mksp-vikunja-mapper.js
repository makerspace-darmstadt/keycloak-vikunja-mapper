// prints can be used to log information for debug purpose.
print("Starting Makerspace Vikunja Group Mapper");

// Get client we're operating on
var client = keycloakSession.getContext().getClient();

// Iterate through all client role assignments and add value to vikunja_groups
var groups = [];
user.getClientRoleMappingsStream(client).forEach(function (roleModel) {

    var attributes = roleModel.getAttributes();

    // Check if vikunja_oidc_id is present
    if (attributes["vikunja_oidc_id"] != undefined) {

        var vikunja_group = {
            oidcID: attributes["vikunja_oidc_id"][0]
        }

        // Also set vikunja_name if present
        if (attributes["vikunja_name"] != undefined) {
            vikunja_group["name"] = attributes["vikunja_name"][0];
        } else {
            // Set it to the role name
            vikunja_group["name"] = roleModel.getName();
        }

        // Add group
        groups.push(vikunja_group);
    }
});

token.setOtherClaims("vikunja_groups", Java.to(groups, "java.util.Map[]"));
