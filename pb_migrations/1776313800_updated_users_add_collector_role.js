/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  const roleField = collection.fields.getById("select_role_dragrace")
  if (roleField) {
    roleField.values.push("collector")
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  const roleField = collection.fields.getById("select_role_dragrace")
  if (roleField) {
    roleField.values = roleField.values.filter(v => v !== "collector")
  }

  return app.save(collection)
})
