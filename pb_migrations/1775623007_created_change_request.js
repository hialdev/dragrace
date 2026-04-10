/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": '@request.auth.id != "" && @request.auth.role = "team_manager"',
    "deleteRule": '@request.auth.role = "superadmin"',
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15, "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_1047473523",
        "hidden": false,
        "id": "relation_order_cr",
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
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_reqby_cr",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "requested_by",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_revby_cr",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "reviewed_by",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_reason_cr",
        "max": 0, "min": 0,
        "name": "reason",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_reviewnote_cr",
        "max": 0, "min": 0,
        "name": "review_note",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select_status_cr",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["pending", "approved", "rejected"]
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
    "id": "pbc_changereq_dragrace",
    "indexes": [],
    "listRule": '@request.auth.id = requested_by || @request.auth.role != "team_manager"',
    "name": "change_request",
    "system": false,
    "type": "base",
    "updateRule": '@request.auth.role = "race_manager" || @request.auth.role = "superadmin"',
    "viewRule": '@request.auth.id = requested_by || @request.auth.role != "team_manager"'
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_changereq_dragrace")
  return app.delete(collection)
})
