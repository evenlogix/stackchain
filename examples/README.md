# Example workflows

## Generate a clean architecture banking app

```bash
stackchain create flutter banking_app \
  --org com.company \
  --architecture clean \
  --state bloc \
  --di get_it \
  --networking dio \
  --storage hive \
  --auth none \
  -y
```

## Add a payments feature

```bash
cd banking_app
stackchain add feature payments
stackchain add usecase create_payment --feature payments
stackchain add repository payment --feature payments
stackchain add screen payment_list --feature payments
```
