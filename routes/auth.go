package routes

import (
	"net/http"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// CheckEmailExists checks if an email is registered in the users collection.
// This endpoint is intentionally public (no auth required) and is used before
// the OTP request flow to give users a clear error if their email isn't found.
func CheckEmailExists(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		var body struct {
			Email string `json:"email"`
		}
		if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.Email) == "" {
			return apis.NewBadRequestError("Email wajib diisi", nil)
		}

		_, err := app.FindFirstRecordByFilter(
			"users",
			"email = {:email}",
			map[string]any{"email": strings.ToLower(strings.TrimSpace(body.Email))},
		)
		if err != nil {
			// User not found — return 404 so frontend can show error
			return e.JSON(http.StatusNotFound, map[string]any{
				"exists":  false,
				"message": "Email tidak terdaftar",
			})
		}

		return e.JSON(http.StatusOK, map[string]any{
			"exists": true,
		})
	}
}
