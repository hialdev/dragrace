/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // Enable OTP authentication for the users collection
  collection.otp.enabled = true
  collection.otp.duration = 300  // 5 minutes expiry
  collection.otp.length = 6      // 6-digit code

  return app.save(collection)
}, (app) => {
  // Rollback: disable OTP
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  collection.otp.enabled = false
  return app.save(collection)
})
