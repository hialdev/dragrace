/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3824009647") // team

  // Add race_class relation
  collection.fields.addAt(99, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1254485939",
    "hidden": false,
    "id": "relation_raceclass_team",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "race_class",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // Update collection rules
  collection.listRule = '@request.auth.id = user || @request.auth.role != "team_manager"'
  collection.viewRule = '@request.auth.id = user || @request.auth.role != "team_manager"'
  collection.createRule = '@request.auth.id != "" && @request.auth.role = "team_manager"'
  collection.updateRule = '@request.auth.id = user || @request.auth.role = "superadmin"'
  collection.deleteRule = '@request.auth.role = "superadmin"'

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3824009647")

  collection.fields.removeById("relation_raceclass_team")

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
