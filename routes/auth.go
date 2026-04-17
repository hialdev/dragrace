package routes

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/mails"
)

// generateOtpPassword derives a deterministic password from an email address.
// Pattern: #AUTO<localpart_alphanumeric>123
// e.g. example@mail.com        -> #AUTOexample123
// e.g. example.reseh@mail.com  -> #AUTOexamplereseh123
var reNonAlnum = regexp.MustCompile(`[^a-zA-Z0-9]`)

func generateOtpPassword(email string) string {
	parts := strings.SplitN(email, "@", 2)
	local := parts[0]
	clean := reNonAlnum.ReplaceAllString(local, "")
	if clean == "" {
		clean = "user"
	}
	return "#AUTO" + clean + "123"
}

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

// CheckIsOtpOnly attempts to auth with the auto-generated OTP password pattern.
// If it succeeds → the account was registered via OTP (no custom password set).
// Frontend calls this before showing "OTP-only" message on login failure.
func CheckIsOtpOnly(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		var body struct {
			Email string `json:"email"`
		}
		if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.Email) == "" {
			return apis.NewBadRequestError("Email wajib diisi", nil)
		}
		email := strings.ToLower(strings.TrimSpace(body.Email))
		autoPass := generateOtpPassword(email)

		// Try to authenticate with the auto-generated password
		_, err := app.FindAuthRecordByEmail("users", email)
		if err != nil {
			// User not found
			return e.JSON(http.StatusOK, map[string]any{"is_otp_only": false})
		}

		_, authErr := app.FindAuthRecordByEmail("users", email)
		if authErr != nil {
			return e.JSON(http.StatusOK, map[string]any{"is_otp_only": false})
		}

		// Validate password against the auto pattern
		record, _ := app.FindAuthRecordByEmail("users", email)
		isOtpOnly := record != nil && record.ValidatePassword(autoPass)

		return e.JSON(http.StatusOK, map[string]any{
			"is_otp_only": isOtpOnly,
		})
	}
}

// RegisterOtp creates a new user WITHOUT a user-chosen password (OTP-only account).
// A deterministic password derived from the email is set internally so PocketBase
// validation passes, but the user is never told this password — they log in via OTP.
func RegisterOtp(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		var body struct {
			Email    string `json:"email"`
			FullName string `json:"full_name"`
			Phone    string `json:"phone"`
		}
		if err := e.BindBody(&body); err != nil {
			return apis.NewBadRequestError("Request body tidak valid", nil)
		}
		body.Email = strings.ToLower(strings.TrimSpace(body.Email))
		if body.Email == "" {
			return apis.NewBadRequestError("Email wajib diisi", nil)
		}

		// Check for duplicate email
		existing, _ := app.FindFirstRecordByFilter(
			"users",
			"email = {:email}",
			map[string]any{"email": body.Email},
		)
		if existing != nil {
			return e.JSON(http.StatusBadRequest, map[string]any{
				"status":  400,
				"message": "Email sudah terdaftar. Silakan login.",
				"data": map[string]any{
					"email": map[string]any{
						"code":    "validation_unique",
						"message": "Email sudah terdaftar",
					},
				},
			})
		}

		// Derive deterministic password from email (user never uses this — OTP only)
		autoPass := generateOtpPassword(body.Email)

		// Get users collection
		collection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return apis.NewInternalServerError("Collection users tidak ditemukan", err)
		}

		// Build the record
		record := core.NewRecord(collection)
		record.Set("email", body.Email)
		record.Set("full_name", body.FullName)
		record.Set("phone", body.Phone)
		record.Set("role", "team_manager")
		record.Set("emailVisibility", true)

		// SetPassword is void in PocketBase v0.36
		record.SetPassword(autoPass)

		// Save the record
		if err := app.Save(record); err != nil {
			return apis.NewBadRequestError("Gagal membuat akun: "+err.Error(), nil)
		}

		// Send verification email
		_ = mails.SendRecordVerification(app, record)

		return e.JSON(http.StatusOK, map[string]any{
			"id":    record.Id,
			"email": record.GetString("email"),
		})
	}
}
