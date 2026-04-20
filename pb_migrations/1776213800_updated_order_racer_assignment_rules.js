/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_assignment_dragrace")
  collection.createRule = '@request.auth.id = order.user && order.is_locked = false && (order.status = "paid" || order.status = "waiting")'
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_assignment_dragrace")
  collection.createRule = '@request.auth.id = order.user && order.is_locked = false && order.status = "paid"'
  return app.save(collection)
})
