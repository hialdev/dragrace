package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// Set payments collection to be readable by authenticated users
		collection, err := app.FindCollectionByNameOrId("payments")
		if err != nil {
			return err
		}

		listRule := "@request.auth.id != \"\""
		viewRule := "@request.auth.id != \"\""
		collection.ListRule = &listRule
		collection.ViewRule = &viewRule

		return app.Save(collection)
	}, func(app core.App) error {
		// Revert: make payments collection superuser-only
		collection, err := app.FindCollectionByNameOrId("payments")
		if err != nil {
			return err
		}

		collection.ListRule = nil
		collection.ViewRule = nil

		return app.Save(collection)
	})
}
