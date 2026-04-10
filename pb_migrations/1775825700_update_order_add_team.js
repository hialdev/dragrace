/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523") // order

  // add payment_method text (label of selected bank)
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_paymethod_dragrace",
    "max": 0,
    "min": 0,
    "name": "payment_method",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523")
  collection.fields.removeById("text_paymethod_dragrace")
  return app.save(collection)
})
