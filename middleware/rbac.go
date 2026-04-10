package middleware

import (
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// RequireRole allows only a single role + superadmin always passes.
func RequireRole(app *pocketbase.PocketBase, role string) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		info, err := e.RequestInfo()
		if err != nil || info.Auth == nil {
			return apis.NewUnauthorizedError("Authentication required", nil)
		}

		userRole := info.Auth.GetString("role")
		if userRole != role && userRole != "superadmin" {
			return apis.NewForbiddenError("Insufficient permissions", nil)
		}

		return e.Next()
	}
}

// RequireAnyRole allows any of the given roles (superadmin always passes).
func RequireAnyRole(app *pocketbase.PocketBase, roles ...string) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		info, err := e.RequestInfo()
		if err != nil || info.Auth == nil {
			return apis.NewUnauthorizedError("Authentication required", nil)
		}

		userRole := info.Auth.GetString("role")
		if userRole == "superadmin" {
			return e.Next()
		}

		for _, r := range roles {
			if userRole == r {
				return e.Next()
			}
		}

		return apis.NewForbiddenError("Insufficient permissions", nil)
	}
}

// RequireAuth ensures any authenticated user (any role).
func RequireAuth() func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		info, err := e.RequestInfo()
		if err != nil || info.Auth == nil {
			return apis.NewUnauthorizedError("Authentication required", nil)
		}
		return e.Next()
	}
}

// Helper to return JSON error
func jsonError(e *core.RequestEvent, status int, message string) error {
	e.Response.Header().Set("Content-Type", "application/json")
	e.Response.WriteHeader(status)
	e.Response.Write([]byte(`{"message":"` + message + `"}`))
	return nil
}

// Unused: keep for reference
var _ = http.StatusForbidden
var _ = apis.NewUnauthorizedError
