/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")
  const team = app.findCollectionByNameOrId("pbc_3824009647")

  // Allow race_manager to list and view users
  // Previous: @request.auth.role = "superadmin"
  users.listRule = '@request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
  users.viewRule = '@request.auth.id = id || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
  app.save(users)

  // Allow race_manager to list and view teams
  // Currently rules might be null or restricted
  team.listRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
  team.viewRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
  app.save(team)

  return
}, (app) => {
  // Rollback to more restricted rules
  try {
    const users = app.findCollectionByNameOrId("_pb_users_auth_")
    users.listRule = '@request.auth.role = "superadmin"'
    users.viewRule = '@request.auth.id = id || @request.auth.role = "superadmin"'
    app.save(users)
    
    const team = app.findCollectionByNameOrId("pbc_3824009647")
    team.listRule = '@request.auth.id = user || @request.auth.role = "superadmin"'
    team.viewRule = '@request.auth.id = user || @request.auth.role = "superadmin"'
    app.save(team)
  } catch(e) {}
  return
})
