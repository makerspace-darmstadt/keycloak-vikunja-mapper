// Import Java native types
ArrayList = Java.type("java.util.ArrayList");
HashMap = Java.type("java.util.HashMap");

// Get client we're operating on
var client = keycloakSession.getContext().getClient();

// Create group list
var list = new ArrayList();

// Iterate through all client roles available for this client
client.getRolesStream().forEach(function (roleModel) {

    // If the user has this role, either directly or indirectly, add it to the list
    if (user.hasRole(roleModel)) {

        // Create a hash map for this role
        var role_map = new HashMap();
        role_map.put("oidcID", roleModel.getId());
        role_map.put("name", roleModel.getName());

        // Extract attributes from the role
        var attributes = roleModel.getAttributes();

        // If isPublic or description is set, add it to the map
        if (attributes.containsKey("isPublic")) {
            role_map.put("isPublic", roleModel.getFirstAttribute("isPublic") === "true");
        }
        if (attributes.containsKey("description")) {
            role_map.put("description", roleModel.getFirstAttribute("description"));
        }

        // Add it to the list
        list.add(role_map);
    }

});

// Return the list
exports = list;
