# Getting started

Server runs on port 6767,
it connects to mapbox api with given MAPBOX_TOKEN and via this api provides following routes
before running - create own .env file with MAPBOX_TOKEN (from https://account.mapbox.com/)

```
// .env
MAPBOX_TOKEN={your token here}
```

requires nodemon to be installed globally

```
npm i -g nodemon
```

# Routes

## /mapbox

Retrieves and saves locally all tiles defined by bounding box set in the url query expressed in lon/lat value

**query params:**
n = north edge
e = east edge
w = west edge
s = south edge
z = zoom level as in mapbox (0-21)
t = type of map ( for example satellite, terrain-rgb)

example of query:
http://localhost:6767/mapbox?n=28.61&e=-16.11&s=27.99&w=-16.93&z=2&t=terrain-rgb

## /texture

by requesting through browser url query, it stitches together given tiles (/mapbox route neeeds to be called first to save the tiles)
ands saves stiched file as a one texture

**query params:**
type = satellite or terrain-rgb (and other accepted mapbox types)
zoom = number, typically 0-21 describing zoom level

example of query:
http://localhost:6767/texture?type=terrain-rgb&zoom=2
