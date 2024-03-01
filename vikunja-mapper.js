// Import Java native types
ArrayList = Java.type("java.util.ArrayList");
HashMap = Java.type("java.util.HashMap");

// Get client we're operating on
var client = keycloakSession.getContext().getClient();

// Create group list
var list = new ArrayList();

// Iterate through all client role assignments and add value to vikunja_groups
user.getClientRoleMappingsStream(client).forEach(function (roleModel) {

    // Create a hash map for this role
    var role_map = new HashMap();
    role_map.put("oidcID", roleModel.getId());
    role_map.put("name", roleModel.getName());

    // Add it to the list
    list.add(role_map);

});

// Return the list
exports = list;
