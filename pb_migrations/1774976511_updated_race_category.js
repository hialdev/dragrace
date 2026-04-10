/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3210929497")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1254485939",
    "hidden": false,
    "id": "relation492678069",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "race_classes",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3210929497")

  // remove field
  collection.fields.removeById("relation492678069")

  return app.save(collection)
})
