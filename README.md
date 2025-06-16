# Email System Backend

## Run Locally

**Clone the project**

```bash
git clone https://github.com/yudin101/email-system.git
```

**Go to the project directory**

```bash
cd email-system
```

**Install dependencies**

```bash
npm install
```

**Setup variables**

```bash
echo "PORT = port" > .env
echo "SESSION_SECRET = 'your_session_secret'" >> .env
echo "ENCRYPTION_KEY = 'your_encryption_key'" >> .env
```

**Start the development server**

```bash
npm run dev
```

## API Routes

### `/api/register`

- Request Method: `POST`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/register.ts)
- Example URL:

```
localhost:3000/api/register
```

- Example Body:

```json
{
  "username": "yudin101",
  "email": "yudin@example.com",
  "password": "hello123"
}
```

### `/api/login`

- Request Method: `POST`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/login.ts)
- Example URL:

```
localhost:3000/api/login
```

- Example Body:

```json
{
  "username": "yudin101",
  "password": "hello123"
}
```

### `/api/logout`

- Request Method: `GET`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/logout.ts)
- Example URL:

```
localhost:3000/api/logout
```

### `/api/received`

- Request Method: `GET`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/mails.ts#L56)
- Example URL:

```
localhost:3000/api/received
```

- Sample Response:

```json
[
  {
    "id": 1,
    "isReplyTo": null,
    "senderEmail": "yudin@e.com",
    "receiverEmail": "example@e.com",
    "subject": "Example Email",
    "body": "This is a sample email.",
    "time": "2025-06-16 12:39:48"
    "read": 1,
  },
  // More
]
```

### `/api/sent`

- Request Method: `GET`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/mails.ts#L60)
- Example URL:

```
localhost:3000/api/sent
```

- Sample Response:

```json
[
  {
    "id": 1,
    "isReplyTo": null,
    "senderEmail": "yudin@e.com",
    "receiverEmail": "example@e.com",
    "subject": "Example Email",
    "body": "This is a sample email.",
    "time": "2025-06-16 12:39:48"
  }
  // More
]
```

### `/api/mail/:id`

- Request Method: `GET`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/mails.ts#L64)
- Example URL:

```
localhost:3000/api/mail/1
```

- Sample Response:

```json
{
  "id": 1,
  "isReplyTo": null,
  "senderEmail": "yudin@e.com",
  "receiverEmail": "example@e.com",
  "subject": "Example Email",
  "body": "This is a sample email.",
  "time": "2025-06-16 12:39:48",
  "read": 1 // Will be shown only if you are the receiver
}
```

### `/api/send`

- Request Method: `POST`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/send.ts)
- Example URL:

```
localhost:3000/api/send
```

- Example Body:

```json
{
  "receiverEmails": ["john@example.com"], // Multiple email addresses can be added
  "isReplyTo": 2, // optional
  "subject": "Example Email",
  "body": "This is a sample email."
}
```

### `/api/delete/:id`

- Request Method: `GET`
- [Definition](https://github.com/yudin101/email-system/blob/main/src/routes/delete.ts)
- Example URL:

```
localhost:3000/api/delete/1
```

## Contributing

Contributions are always welcome!

If you’d like to contribute to this project, you can:

- **Create an Issue**: Report bugs or suggest features by [creating an issue](https://github.com/yudin101/email-system/issues/new).
- **Open a Pull Request**: Submit code changes or improvements by [opening a pull request](https://github.com/yudin101/email-system/pulls).

## License

This project is licensed under the [MIT License](https://github.com/yudin101/email-system/blob/main/LICENSE).
