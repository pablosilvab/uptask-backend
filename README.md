# UpTask 🔖

UpTask is a simple application designed to help you manage your tasks, similar to how a JIRA board operates, focusing on tasks that are in the "TO-DO" stage.

## Environment variables

For local development, use a `.env` file and add the following variables:

* DATABASE_URL= mongodb+srv://user:pass@host/dbname?retryWrites=true&w=majority&appName=Cluster0/
* ALLOWED_ORIGINS for the whitelist
* FRONTEND_URL for mails
* SMTP_HOST
* SMTP_PORT
* SMTP_USER
* SMTP_PASS
* JWT_SECRET