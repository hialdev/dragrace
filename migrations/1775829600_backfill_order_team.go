package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// Cari semua order yang field 'team'-nya masih kosong
		orders, err := app.FindRecordsByFilter(
			"order",
			"team = ''",
			"",
			0,
			0,
			nil,
		)
		if err != nil {
			return nil // Lewati jika tidak ada order yang perlu di-backfill
		}

		for _, record := range orders {
			userId := record.GetString("user")
			if userId == "" {
				continue
			}

			// Cari tim yang dimiliki oleh user tersebut
			team, err := app.FindFirstRecordByFilter(
				"team",
				"user = {:userId}",
				map[string]any{"userId": userId},
			)

			if err == nil && team != nil {
				// Pasangkan ID Tim ke order
				record.Set("team", team.Id)
				if err := app.Save(record); err != nil {
					continue
				}
			}
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
