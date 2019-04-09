# plShare
Private image-sharing, built to sync in with how authentication works with Pluto.

## Setup
Just change config.js.

### Database
This relies on MongoDB for everything.

The expected cookie object structure:
```javascript
{
  userid: "userid",
  cookie: "cookie",
  expires: 0,
}
```
