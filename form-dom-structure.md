# DOM structure of the UPS Air Cargo tracking form

Page: `https://www.aircargo.ups.com/en-us/tracking`
After submitting AWB `44869075`: `https://www.aircargo.ups.com/en-US/Tracking?awbPrefix=406&awbNumber=44869075`

The page has exactly one `<form>`, inside the left search widget.

## Tree

```
div.tracking-form-search.widget-align-left.widget-size-66.widget.widget-liquid-widget
└─ div.widget-body
   ├─ p > strong "Enter your Air Waybill number below and select Track."
   ├─ div.pb-3
   │   ├─ div.dazSubscribeMsg                  (empty message placeholder)
   │   └─ form[method=post][action=/en-US/Tracking]
   │       ├─ div.input-group
   │       │   ├─ input#txtAwbPrefix.form-control
   │       │   ├─ input#txtAwbNumber.form-control
   │       │   └─ span.input-group-btn
   │       │       └─ button.site-button.btn.primary-btn.tracking-list
   │       └─ input[type=hidden][name=__RequestVerificationToken]
   └─ p "To track multiple shipments, you can enter up to 10 Air Waybill numbers, each separated by a comma."
```

## Form

| Attribute | Value |
|---|---|
| method | `post` |
| action | `/en-US/Tracking` |
| id / class | none |

## Controls

| Element | Selector | type | name | Other attributes |
|---|---|---|---|---|
| AWB prefix | `#txtAwbPrefix` | text | `awbPrefix` | `value="406"`, `required`, `title`/`placeholder` = "Awb-Prefix", class `form-control` |
| AWB number | `#txtAwbNumber` | text | `awbNumber` | empty by default, `required`, `title` = "Enter up to 10 Air Waybill numbers separated by comma.", `placeholder` = "Enter up to 10 AWB Numbers separated by comma.", class `form-control` |
| Track button | `button[name=submit]` | submit | `submit` | `value="Submit"`, text "Track", class `site-button btn primary-btn tracking-list` |
| Anti-forgery token | `input[name=__RequestVerificationToken]` | hidden | `__RequestVerificationToken` | ASP.NET token, changes per page load |

## Behavior

- Posted fields: `awbPrefix`, `awbNumber`, `submit=Submit`, `__RequestVerificationToken`.
- The server redirects to the GET URL `?awbPrefix=406&awbNumber=<n>`, so the URL alone works for scraping without submitting the form.
- After the redirect `#txtAwbNumber` is empty again; the page does not copy the number back into it.
- Up to 10 AWB numbers can be entered, comma-separated, with one shared prefix.
- The form has no `id`; use `#txtAwbPrefix`, `#txtAwbNumber` and `button[name=submit]` as selectors.
