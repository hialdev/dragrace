/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const contentEdit = '@request.auth.role = "content" || @request.auth.role = "superadmin"'

  try {
    const values = app.findCollectionByNameOrId("values")
    values.createRule = contentEdit
    values.updateRule = contentEdit
    values.deleteRule = contentEdit
    app.save(values)
  } catch(e) {}

  try {
    const payments = app.findCollectionByNameOrId("payments")
    payments.createRule = contentEdit
    payments.updateRule = contentEdit
    payments.deleteRule = contentEdit
    app.save(payments)
  } catch(e) {}

  try {
    const single_content = app.findCollectionByNameOrId("single_content")
    single_content.updateRule = contentEdit
    // single_content create/delete remains null, no creation allowed
    app.save(single_content)
  } catch(e) {}

  return
}, (app) => {
  try {
    const values = app.findCollectionByNameOrId("values")
    values.createRule = null
    values.updateRule = null
    values.deleteRule = null
    app.save(values)
  } catch(e) {}

  try {
    const payments = app.findCollectionByNameOrId("payments")
    payments.createRule = null
    payments.updateRule = null
    payments.deleteRule = null
    app.save(payments)
  } catch(e) {}

  try {
    const single_content = app.findCollectionByNameOrId("single_content")
    single_content.updateRule = null
    app.save(single_content)
  } catch(e) {}

  return
})
