# North Yorkshire Drive

A first-person driving game that starts outside Stokesley School. Follow the
connected roads through the North York Moors, the Yorkshire Dales, market towns,
and the coast. Choose left or right at junctions to explore; the small map tracks
your position as you drive.

The starting streets, school grounds, and nearby building outlines are based on
OpenStreetMap data. The wider regional scenery remains stylized.

## Controls

- **W / Up arrow:** accelerate
- **S / Down arrow / Space:** brake
- **A / Left arrow:** steer left; choose left turns at junctions
- **D / Right arrow:** steer right; choose right turns at junctions

Touch controls are available on smaller screens.

## Run locally

```sh
npm install
npm run dev
```

For a production build, run `npm run build`. To publish the game, push to the
`main` branch; the GitHub Actions workflow deploys it to GitHub Pages at
`https://reelaytoemass.github.io/yorkshiredriving/`.

The Three.js scene connects Stokesley, Great Ayton, Guisborough, Helmsley,
Whitby, Pickering, Scarborough, Malton, York, Thirsk, Northallerton, Richmond,
Hawes, Settle, and other local places. Stokesley map data is © OpenStreetMap
contributors and available under the [Open Database License](https://www.openstreetmap.org/copyright).