/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523") // order

  // Remove old racers[] relation field (replaced by order_racer_assignment)
  collection.fields.removeById("relation3773839680")

  // Add is_locked
  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "bool_islocked_order",
    "name": "is_locked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // Add unlock_requested
  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "bool_unlockreq_order",
    "name": "unlock_requested",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // Add unlock_reason
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_unlockreason_order",
    "max": 0,
    "min": 0,
    "name": "unlock_reason",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // Add payment_ref (Flip bill_link_id)
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_paymentref_order",
    "max": 0,
    "min": 0,
    "name": "payment_ref",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // Add payment_link_url
  collection.fields.addAt(99, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "url_paymentlink_order",
    "max": 0,
    "min": 0,
    "name": "payment_link_url",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // Add payment_expired_at
  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "date_paymentexp_order",
    "max": "",
    "min": "",
    "name": "payment_expired_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // Update collection rules
  collection.listRule = '@request.auth.id = user || @request.auth.role != "team_manager"'
  collection.viewRule = '@request.auth.id = user || @request.auth.role != "team_manager"'
  collection.createRule = '@request.auth.id != "" && @request.auth.role = "team_manager"'
  collection.updateRule = '(@request.auth.id = user && is_locked = false) || @request.auth.role = "race_manager" || @request.auth.role = "superadmin"'
  collection.deleteRule = '@request.auth.role = "superadmin"'

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1047473523")

  collection.fields.removeById("bool_islocked_order")
  collection.fields.removeById("bool_unlockreq_order")
  collection.fields.removeById("text_unlockreason_order")
  collection.fields.removeById("text_paymentref_order")
  collection.fields.removeById("url_paymentlink_order")
  collection.fields.removeById("date_paymentexp_order")

  // Restore racers relation
  collection.fields.addAt(99, new Field({
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

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
