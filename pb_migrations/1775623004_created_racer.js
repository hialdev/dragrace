/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": '@request.auth.id = team.user && @request.auth.role = "team_manager"',
    "deleteRule": '@request.auth.id = team.user || @request.auth.role = "superadmin"',
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
        "cascadeDelete": false,
        "collectionId": "pbc_3824009647",
        "hidden": false,
        "id": "relation_team_racer",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "team",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_name_racer",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_phone_racer",
        "max": 0,
        "min": 0,
        "name": "phone",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date_birth_racer",
        "max": "",
        "min": "",
        "name": "birth_date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "file_photo_racer",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg","image/png","image/webp"],
        "name": "photo",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_address_racer",
        "max": 0,
        "min": 0,
        "name": "address",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "file_kta_racer",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg","image/png","image/webp","application/pdf"],
        "name": "kta",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "hidden": false,
        "id": "file_sim_racer",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg","image/png","image/webp","application/pdf"],
        "name": "sim",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "hidden": false,
        "id": "file_kis_racer",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg","image/png","image/webp","application/pdf"],
        "name": "kis",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_notes_racer",
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
    "id": "pbc_racer_dragrace",
    "indexes": [],
    "listRule": '@request.auth.id = team.user || @request.auth.role != "team_manager"',
    "name": "racer",
    "system": false,
    "type": "base",
    "updateRule": '(@request.auth.id = team.user && @request.auth.role = "team_manager") || @request.auth.role = "superadmin"',
    "viewRule": '@request.auth.id = team.user || @request.auth.role != "team_manager"'
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_racer_dragrace")
  return app.delete(collection)
})
