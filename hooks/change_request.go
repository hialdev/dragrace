package hooks

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// RegisterChangeRequestHooks listens for change_request updates.
// When status becomes "approved", it unlocks the associated order.
func RegisterChangeRequestHooks(app *pocketbase.PocketBase) {
	app.OnRecordUpdate("change_request").BindFunc(func(e *core.RecordEvent) error {
		// Only react when status transitions to "approved"
		oldStatus := e.Record.Original().GetString("status")
		newStatus := e.Record.GetString("status")

		if oldStatus == newStatus || newStatus != "approved" {
			return e.Next()
		}

		orderId := e.Record.GetString("order")
		if orderId == "" {
			return e.Next()
		}

		order, err := app.FindRecordById("order", orderId)
		if err != nil {
			app.Logger().Error("change_request hook: order not found", "orderId", orderId, "error", err)
			return e.Next()
		}

		// Unlock the order
		order.Set("is_locked", false)
		order.Set("unlock_requested", false)

		if err := app.Save(order); err != nil {
			app.Logger().Error("change_request hook: failed to unlock order", "orderId", orderId, "error", err)
			return err
		}

		app.Logger().Info("Order unlocked via change_request approval", "orderId", orderId)
		return e.Next()
	})
}
