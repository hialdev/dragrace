package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"dragrace-backend/hooks"
	"dragrace-backend/middleware"
	_ "dragrace-backend/migrations"
	"dragrace-backend/routes"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// Load JS migrations from pb_migrations/ folder
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: "pb_migrations",
	})

	// Enable "migrate" CLI command (runs pending migrations on serve)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	// Register hooks
	hooks.RegisterTeamHooks(app)
	hooks.RegisterChangeRequestHooks(app)
	hooks.RegisterOrderHooks(app)

	// Register custom routes
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// CORS middleware for Next.js frontend
		se.Router.BindFunc(func(e *core.RequestEvent) error {
			origin := e.Request.Header.Get("Origin")
			if origin == "" {
				origin = getAllowedOrigin()
			}
			e.Response.Header().Set("Access-Control-Allow-Origin", origin)
			e.Response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			e.Response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if e.Request.Method == http.MethodOptions {
				e.Response.WriteHeader(http.StatusNoContent)
				return nil
			}
			return e.Next()
		})

		// Payment routes
		paymentGroup := se.Router.Group("/api/payment")
		paymentGroup.POST("/create-link", routes.CreatePaymentLink(app))
		paymentGroup.POST("/callback", routes.FlipCallback(app))

		// Export routes (protected)
		exportGroup := se.Router.Group("/api/export")
		exportGroup.BindFunc(middleware.RequireAnyRole(app, "race_manager", "superadmin"))
		exportGroup.GET("/team/{teamId}", routes.ExportTeamReport(app))

		// Admin-only routes
		adminGroup := se.Router.Group("/api/admin")
		adminGroup.BindFunc(middleware.RequireRole(app, "superadmin"))
		adminGroup.GET("/stats", routes.GetStats(app))

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func getAllowedOrigin() string {
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		return "http://localhost:3000"
	}
	// Return first origin for simplicity; extend for multi-origin support
	parts := strings.Split(origins, ",")
	return strings.TrimSpace(parts[0])
}
