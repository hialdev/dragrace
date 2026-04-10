/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add role field
  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "select_role_dragrace",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "team_manager",
      "race_manager",
      "content",
      "superadmin"
    ]
  }))

  // add full_name
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_fullname_dragrace",
    "max": 0,
    "min": 0,
    "name": "full_name",
    "pattern": "",
    "presentable": true,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add phone
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_phone_dragrace",
    "max": 0,
    "min": 0,
    "name": "phone",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add is_active
  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "bool_isactive_dragrace",
    "name": "is_active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // Update collection rules
  collection.createRule = ""
  collection.listRule = '@request.auth.role = "superadmin"'
  collection.viewRule = '@request.auth.id = id || @request.auth.role = "superadmin"'
  collection.updateRule = '@request.auth.id = id || @request.auth.role = "superadmin"'
  collection.deleteRule = '@request.auth.role = "superadmin"'

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.fields.removeById("select_role_dragrace")
  collection.fields.removeById("text_fullname_dragrace")
  collection.fields.removeById("text_phone_dragrace")
  collection.fields.removeById("bool_isactive_dragrace")

  collection.createRule = null
  collection.listRule = null
  collection.viewRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
