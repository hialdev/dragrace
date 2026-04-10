package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

const flipBaseURL = "https://bigflip.id/api/v2"

// CreatePaymentLink creates a Flip Bill payment link for an order.
func CreatePaymentLink(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		info, err := e.RequestInfo()
		if err != nil || info.Auth == nil {
			return apis.NewUnauthorizedError("Authentication required", nil)
		}

		var body struct {
			OrderId string `json:"order_id"`
		}
		if err := e.BindBody(&body); err != nil {
			return apis.NewBadRequestError("Invalid request body", err)
		}

		order, err := app.FindRecordById("order", body.OrderId)
		if err != nil {
			return apis.NewNotFoundError("Order not found", err)
		}

		if order.GetString("user") != info.Auth.Id {
			return apis.NewForbiddenError("Not your order", nil)
		}

		if order.GetString("status") == "paid" {
			return apis.NewBadRequestError("Order already paid", nil)
		}

		pit, _ := app.FindRecordById("race_pit", order.GetString("race_pit"))
		pitName := "Race Pit"
		if pit != nil {
			pitName = pit.GetString("name")
		}

		secretKey := os.Getenv("FLIP_SECRET_KEY")
		if secretKey == "" {
			return apis.NewInternalServerError("Payment service not configured", nil)
		}

		billAmount := int(order.GetFloat("bill_price"))
		expiredAt := time.Now().Add(24 * time.Hour)

		formData := url.Values{}
		formData.Set("title", fmt.Sprintf("Registrasi %s", pitName))
		formData.Set("amount", fmt.Sprintf("%d", billAmount))
		formData.Set("type", "SINGLE")
		formData.Set("expired_date", expiredAt.Format("2006-01-02 15:04"))
		formData.Set("redirect_url", os.Getenv("PAYMENT_SUCCESS_URL"))
		formData.Set("is_address_required", "0")
		formData.Set("is_phone_number_required", "0")
		formData.Set("customer_name", info.Auth.GetString("full_name"))
		formData.Set("customer_email", info.Auth.GetString("email"))

		req, err := http.NewRequest("POST", flipBaseURL+"/pwf/bill", strings.NewReader(formData.Encode()))
		if err != nil {
			return apis.NewInternalServerError("Failed to prepare payment request", err)
		}
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.SetBasicAuth(secretKey, "")

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			return apis.NewInternalServerError("Failed to contact payment gateway", err)
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		var flipResp map[string]any
		if err := json.Unmarshal(respBody, &flipResp); err != nil {
			return apis.NewInternalServerError("Invalid payment gateway response", err)
		}

		if resp.StatusCode != 200 {
			app.Logger().Error("Flip API error", "status", resp.StatusCode, "body", string(respBody))
			return apis.NewBadRequestError("Payment gateway error", nil)
		}

		linkId := fmt.Sprintf("%v", flipResp["link_id"])
		linkUrl := fmt.Sprintf("%v", flipResp["link_url"])

		order.Set("payment_ref", linkId)
		order.Set("payment_link_url", linkUrl)
		order.Set("payment_expired_at", expiredAt.Format(time.RFC3339))

		if err := app.Save(order); err != nil {
			return apis.NewInternalServerError("Failed to save payment info", err)
		}

		return e.JSON(http.StatusOK, map[string]any{
			"payment_url": linkUrl,
			"link_id":     linkId,
			"expired_at":  expiredAt,
		})
	}
}

// FlipCallback handles Flip payment webhook callbacks.
func FlipCallback(app *pocketbase.PocketBase) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		validationToken := os.Getenv("FLIP_VALIDATION_TOKEN")
		if validationToken != "" {
			token := e.Request.Header.Get("X-Callback-Token")
			if token != validationToken {
				app.Logger().Warn("Flip callback: invalid token")
				return apis.NewForbiddenError("Invalid callback token", nil)
			}
		}

		if err := e.Request.ParseForm(); err != nil {
			return apis.NewBadRequestError("Invalid callback body", err)
		}

		dataStr := e.Request.FormValue("data")
		var data map[string]any
		if err := json.Unmarshal([]byte(dataStr), &data); err != nil {
			return apis.NewBadRequestError("Invalid callback data", err)
		}

		linkId := fmt.Sprintf("%v", data["link_id"])
		status := fmt.Sprintf("%v", data["status"])

		if linkId == "" {
			return apis.NewBadRequestError("Missing link_id", nil)
		}

		order, err := app.FindFirstRecordByFilter(
			"order",
			"payment_ref = {:linkId}",
			map[string]any{"linkId": linkId},
		)
		if err != nil {
			app.Logger().Warn("Flip callback: order not found", "link_id", linkId)
			return e.JSON(http.StatusOK, map[string]any{"status": "ignored"})
		}

		if status == "SUCCESSFUL" || status == "PAID" {
			order.Set("status", "paid")
			if err := app.Save(order); err != nil {
				app.Logger().Error("Flip callback: failed to update order", "error", err)
				return apis.NewInternalServerError("Failed to update order", err)
			}
			app.Logger().Info("Order paid via Flip", "order_id", order.Id)
		}

		return e.JSON(http.StatusOK, map[string]any{"status": "ok"})
	}
}
