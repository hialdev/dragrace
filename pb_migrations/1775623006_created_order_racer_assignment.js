/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": '@request.auth.id = order.user && order.is_locked = false && order.status = "paid"',
    "deleteRule": '(@request.auth.id = order.user && order.is_locked = false) || @request.auth.role = "superadmin"',
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_1047473523",
        "hidden": false,
        "id": "relation_order_assign",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "order",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_racer_dragrace",
        "hidden": false,
        "id": "relation_racer_assign",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "racer",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_vehicle_dragrace",
        "hidden": false,
        "id": "relation_vehicle_assign",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "vehicle",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_1254485939",
        "hidden": false,
        "id": "relation_raceclass_assign",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "race_class",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_notes_assign",
        "max": 0,
        "min": 0,
        "name": "notes",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_assignment_dragrace",
    "indexes": [],
    "listRule": '@request.auth.id = order.user || @request.auth.role != "team_manager"',
    "name": "order_racer_assignment",
    "system": false,
    "type": "base",
    "updateRule": '@request.auth.id = order.user && order.is_locked = false',
    "viewRule": '@request.auth.id = order.user || @request.auth.role != "team_manager"'
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_assignment_dragrace")
  return app.delete(collection)
})
