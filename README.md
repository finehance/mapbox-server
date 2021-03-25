# Getting started

Server runs on port 6767,
it connects to mapbox api with given MAPBOX_TOKEN and via this api provides following routes

## Before running

1. create own .env file with MAPBOX_TOKEN (from https://account.mapbox.com/)

```
// .env
MAPBOX_TOKEN={your token here}
```

2. install nodemon globally

```
npm i -g nodemon
```

3. install dependencies

```
npm install

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

Files are saved in ./assets directory.

## /texture

Stitches together given tiles ands saves stiched file as a one texture

> NOTE: /mapbox route neeeds to be called first to save the tiles)

**query params:**
type = satellite or terrain-rgb (and other accepted mapbox types)
zoom = number, typically 0-21 describing zoom level

example of query:
http://localhost:6767/texture?type=terrain-rgb&zoom=2

File is saved in ./assets directory.
