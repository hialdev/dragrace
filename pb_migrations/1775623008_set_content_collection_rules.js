/// <reference path="../pb_data/types.d.ts" />
// Set RBAC rules for all content collections and race_pit
migrate((app) => {
  const contentEdit = '@request.auth.role = "content" || @request.auth.role = "superadmin"'
  const publicRead = ""

  const contentCollections = [
    "pbc_497205610",   // race_pit
    "pbc_3210929497",  // race_category
    "pbc_1254485939",  // race_classes
    "pbc_1576026761",  // star_guest
    "pbc_290189809",   // registration_step
  ]

  // Try partner, timeline, prize_category, prize_winner by name
  const contentCollectionNames = ["partner", "timeline", "prize_category", "prize_winner"]

  for (const id of contentCollections) {
    try {
      const col = app.findCollectionByNameOrId(id)
      col.listRule = publicRead
      col.viewRule = publicRead
      col.createRule = contentEdit
      col.updateRule = contentEdit
      col.deleteRule = contentEdit
      app.save(col)
    } catch(e) {}
  }

  for (const name of contentCollectionNames) {
    try {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = publicRead
      col.viewRule = publicRead
      col.createRule = contentEdit
      col.updateRule = contentEdit
      col.deleteRule = contentEdit
      app.save(col)
    } catch(e) {}
  }

  // order_racer_details (old, lock it down to superadmin only now that we use new schema)
  try {
    const old = app.findCollectionByNameOrId("pbc_3357286578")
    old.listRule = '@request.auth.role = "superadmin"'
    old.viewRule = '@request.auth.role = "superadmin"'
    old.createRule = '@request.auth.role = "superadmin"'
    old.updateRule = '@request.auth.role = "superadmin"'
    old.deleteRule = '@request.auth.role = "superadmin"'
    app.save(old)
  } catch(e) {}

  return
}, (app) => {
  // Rollback: set everything back to null
  const allIds = [
    "pbc_497205610", "pbc_3210929497", "pbc_1254485939",
    "pbc_1576026761", "pbc_290189809",
    "partner", "timeline", "prize_category", "prize_winner",
    "pbc_3357286578"
  ]
  for (const id of allIds) {
    try {
      const col = app.findCollectionByNameOrId(id)
      col.listRule = null
      col.viewRule = null
      col.createRule = null
      col.updateRule = null
      col.deleteRule = null
      app.save(col)
    } catch(e) {}
  }
  return
})
