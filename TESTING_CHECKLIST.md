# Activity 7 API testing checklist

Use the local base URL `http://localhost:3000` first. Repeat CRUD tests against the hosted HTTPS base URL after deployment.

- [ ] GET `/health` returns 200 and confirms the database is working.
- [ ] GET `/api/records` returns a JSON array with the eight seed records.
- [ ] POST `/api/records` with a valid JSON body returns 201 and a generated ID.
- [ ] GET `/api/records/:id` for that ID returns the created record.
- [ ] PUT `/api/records/:id` with all four valid fields returns 200 and keeps the same ID.
- [ ] DELETE `/api/records/:id` returns 200 and `{"message":"Record deleted."}`.
- [ ] GET the deleted ID returns 404.
- [ ] POST with a missing/short title returns 400.
- [ ] POST with an unknown status returns 400.
- [ ] A non-numeric or zero ID returns 400.
- [ ] A valid but nonexistent ID returns 404 for GET, PUT and DELETE.
- [ ] Malformed JSON returns 400.
- [ ] A newly created record remains after restarting the API.

For POST and PUT, use `Content-Type: application/json` and the four editable fields: `title`, `category`, `description`, `status`.
