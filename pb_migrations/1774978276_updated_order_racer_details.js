/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3357286578")

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3040539189",
    "max": 0,
    "min": 0,
    "name": "vehicle_model",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2130540980",
    "max": 0,
    "min": 0,
    "name": "vehicle_brand",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text819489528",
    "max": 0,
    "min": 0,
    "name": "vehicle_cc",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3374268523",
    "max": 0,
    "min": 0,
    "name": "vehicle_year",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "file2811397299",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "vehicle_image",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3357286578")

  // remove field
  collection.fields.removeById("text3040539189")

  // remove field
  collection.fields.removeById("text2130540980")

  // remove field
  collection.fields.removeById("text819489528")

  // remove field
  collection.fields.removeById("text3374268523")

  // remove field
  collection.fields.removeById("file2811397299")

  return app.save(collection)
})
