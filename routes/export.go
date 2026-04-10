package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// ExportTeamReport exports a team's full participation report.
func ExportTeamReport(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		teamId := e.Request.PathValue("teamId")
		format := e.Request.URL.Query().Get("format")
		if format == "" {
			format = "json"
		}

		team, err := app.FindRecordById("team", teamId)
		if err != nil {
			return apis.NewNotFoundError("Team not found", err)
		}

		user, err := app.FindRecordById("users", team.GetString("user"))
		if err != nil {
			return apis.NewNotFoundError("Team owner not found", err)
		}

		racers, _ := app.FindRecordsByFilter(
			"racer", "team = {:tid}", "-created", 500, 0,
			map[string]any{"tid": teamId},
		)
		vehicles, _ := app.FindRecordsByFilter(
			"vehicle", "team = {:tid}", "-created", 500, 0,
			map[string]any{"tid": teamId},
		)
		orders, _ := app.FindRecordsByFilter(
			"order", "user = {:uid}", "-created", 500, 0,
			map[string]any{"uid": team.GetString("user")},
		)

		type AssignmentRow struct {
			RacerName    string `json:"racer_name"`
			VehicleBrand string `json:"vehicle_brand"`
			VehicleModel string `json:"vehicle_model"`
			RaceClass    string `json:"race_class"`
		}
		type OrderRow struct {
			PitName     string          `json:"pit_name"`
			Status      string          `json:"status"`
			BillPrice   float64         `json:"bill_price"`
			Assignments []AssignmentRow `json:"assignments"`
		}

		var orderRows []OrderRow
		for _, o := range orders {
			pitName := ""
			if pit, err := app.FindRecordById("race_pit", o.GetString("race_pit")); err == nil {
				pitName = pit.GetString("name")
			}

			assignments, _ := app.FindRecordsByFilter(
				"order_racer_assignment", "order = {:oid}", "created", 100, 0,
				map[string]any{"oid": o.Id},
			)

			var rows []AssignmentRow
			for _, a := range assignments {
				row := AssignmentRow{}
				if r, err := app.FindRecordById("racer", a.GetString("racer")); err == nil {
					row.RacerName = r.GetString("name")
				}
				if v, err := app.FindRecordById("vehicle", a.GetString("vehicle")); err == nil {
					row.VehicleBrand = v.GetString("brand")
					row.VehicleModel = v.GetString("model")
				}
				if rc, err := app.FindRecordById("race_classes", a.GetString("race_class")); err == nil {
					row.RaceClass = rc.GetString("name")
				}
				rows = append(rows, row)
			}

			orderRows = append(orderRows, OrderRow{
				PitName:     pitName,
				Status:      o.GetString("status"),
				BillPrice:   o.GetFloat("bill_price"),
				Assignments: rows,
			})
		}

		var racerList []map[string]any
		for _, r := range racers {
			racerList = append(racerList, map[string]any{
				"name": r.GetString("name"), "phone": r.GetString("phone"),
				"birth_date": r.GetString("birth_date"), "address": r.GetString("address"),
			})
		}

		var vehicleList []map[string]any
		for _, v := range vehicles {
			vehicleList = append(vehicleList, map[string]any{
				"brand": v.GetString("brand"), "model": v.GetString("model"),
				"cc": v.GetString("cc"), "year": v.GetString("year"),
				"plate": v.GetString("plate_number"),
			})
		}

		report := map[string]any{
			"generated_at": time.Now().Format(time.RFC3339),
			"user": map[string]any{
				"full_name": user.GetString("full_name"),
				"email":     user.Email(),
				"phone":     user.GetString("phone"),
			},
			"team": map[string]any{
				"name": team.GetString("name"), "entrant_number": team.GetString("entrant_number"),
				"manager_name": team.GetString("manager_name"), "manager_phone": team.GetString("manager_phone"),
			},
			"racers": racerList, "vehicles": vehicleList, "orders": orderRows,
		}

		switch format {
		case "excel":
			return exportExcel(e, report, team.GetString("name"))
		case "pdf":
			return exportPDF(e, report, team.GetString("name"))
		default:
			return e.JSON(http.StatusOK, report)
		}
	}
}

// GetStats returns summary stats for superadmin dashboard.
func GetStats(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		countOrders := countCollection(app, "order")
		countPaidOrders := countCollectionFiltered(app, "order", "status = 'paid'")
		countTeams := countCollection(app, "team")
		countRacers := countCollection(app, "racer")

		return e.JSON(http.StatusOK, map[string]any{
			"total_orders": countOrders,
			"paid_orders":  countPaidOrders,
			"total_teams":  countTeams,
			"total_racers": countRacers,
		})
	}
}

func countCollection(app *pocketbase.PocketBase, collection string) int {
	records, err := app.FindRecordsByFilter(collection, "id != ''", "", 1, 0, nil)
	if err != nil {
		return 0
	}
	_ = records
	// Use a separate count query approach
	total, _ := app.FindRecordsByFilter(collection, "id != ''", "", 10000, 0, nil)
	return len(total)
}

func countCollectionFiltered(app *pocketbase.PocketBase, collection, filter string) int {
	total, _ := app.FindRecordsByFilter(collection, filter, "", 10000, 0, nil)
	return len(total)
}

func exportExcel(e *core.RequestEvent, data map[string]any, teamName string) error {
	jsonBytes, _ := json.MarshalIndent(data, "", "  ")
	e.Response.Header().Set("Content-Type", "application/json")
	e.Response.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s-report.json"`, teamName))
	e.Response.Write(jsonBytes)
	return nil
}

func exportPDF(e *core.RequestEvent, data map[string]any, teamName string) error {
	return exportExcel(e, data, teamName)
}

// ensure apis is used
var _ = apis.NewNotFoundError
