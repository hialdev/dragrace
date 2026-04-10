/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254485939")

  // update collection data
  unmarshal({
    "name": "race_class"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254485939")

  // update collection data
  unmarshal({
    "name": "race_classes"
  }, collection)

  return app.save(collection)
})
