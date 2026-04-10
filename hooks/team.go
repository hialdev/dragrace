package hooks

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// RegisterTeamHooks prevents a user from creating more than 1 team.
func RegisterTeamHooks(app *pocketbase.PocketBase) {
	app.OnRecordCreate("team").BindFunc(func(e *core.RecordEvent) error {
		userId := e.Record.GetString("user")
		if userId == "" {
			return e.Next()
		}

		// Check if this user already has a team
		existing, err := app.FindFirstRecordByFilter(
			"team",
			"user = {:userId}",
			map[string]any{"userId": userId},
		)
		if err == nil && existing != nil {
			return apis.NewBadRequestError("You already have a team registered.", nil)
		}

		return e.Next()
	})
}
