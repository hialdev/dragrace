/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")
  const team = app.findCollectionByNameOrId("pbc_3824009647")

  // Allow collector to list and view users
  users.listRule = '@request.auth.role = "superadmin" || @request.auth.role = "race_manager" || @request.auth.role = "collector"'
  users.viewRule = '@request.auth.id = id || @request.auth.role = "superadmin" || @request.auth.role = "race_manager" || @request.auth.role = "collector"'
  app.save(users)

  // Allow collector to list and view teams
  team.listRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager" || @request.auth.role = "collector"'
  team.viewRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager" || @request.auth.role = "collector"'
  app.save(team)

  return
}, (app) => {
  try {
    const users = app.findCollectionByNameOrId("_pb_users_auth_")
    users.listRule = '@request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
    users.viewRule = '@request.auth.id = id || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
    app.save(users)
    
    const team = app.findCollectionByNameOrId("pbc_3824009647")
    team.listRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
    team.viewRule = '@request.auth.id = user || @request.auth.role = "superadmin" || @request.auth.role = "race_manager"'
    app.save(team)
  } catch(e) {}
  return
})
