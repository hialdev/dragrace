package hooks

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// RegisterOrderHooks handles automatic field population for the order collection.
func RegisterOrderHooks(app *pocketbase.PocketBase) {
	app.OnRecordCreate("order").BindFunc(func(e *core.RecordEvent) error {
		userId := e.Record.GetString("user")
		if userId == "" {
			return e.Next()
		}

		// Try to find the team for this user
		team, err := app.FindFirstRecordByFilter(
			"team",
			"user = {:userId}",
			map[string]any{"userId": userId},
		)

		if err == nil && team != nil {
			// Auto-populate the team field
			e.Record.Set("team", team.Id)
		}

		return e.Next()
	})
}
