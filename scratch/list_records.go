package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase"
)

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "./pb_data",
	})

	// Use a hook or just use the app directly to query
    // Actually, PocketBase app needs to be "boostrapped"
	if err := app.Bootstrap(); err != nil {
		log.Fatal(err)
	}

	records, err := app.FindRecordsByFilter("single_content", "id != ''", "", 100, 0, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("=== SINGLE_CONTENT RECORDS ===")
	for _, r := range records {
		data := map[string]interface{}{
			"key":      r.GetString("key"),
			"is_image": r.GetBool("is_image"),
			"content":  r.GetString("content"),
			"image":    r.GetString("image"),
		}
		jsonStr, _ := json.MarshalIndent(data, "", "  ")
		fmt.Println(string(jsonStr))
	}
    
    values, _ := app.FindRecordsByFilter("values", "id != ''", "", 100, 0, nil)
	fmt.Println("\n=== VALUES RECORDS ===")
    for _, r := range values {
		fmt.Printf("- %s: %s\n", r.GetString("title"), r.GetString("description"))
	}
}
