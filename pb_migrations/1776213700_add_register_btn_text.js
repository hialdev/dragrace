/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    // Check if it already exists
    app.findFirstRecordByFilter("single_content", 'key = "register_btn_text"');
  } catch (e) {
    const collection = app.findCollectionByNameOrId("single_content");
    const record = new Record(collection);
    record.set("key", "register_btn_text");
    record.set("content", "Daftar Sekarang");
    record.set("is_image", false);
    app.save(record);
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByFilter("single_content", 'key = "register_btn_text"');
    app.delete(record);
  } catch (e) {}
})
