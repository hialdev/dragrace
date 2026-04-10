/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523")

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3357286578",
    "hidden": false,
    "id": "relation3773839680",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "racers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523")

  // remove field
  collection.fields.removeById("relation3773839680")

  return app.save(collection)
})
