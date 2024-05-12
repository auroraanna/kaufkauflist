# kaufkauflist /kaʊ̯fkaʊ̯flɪst/

The following instructions are catered to people using [the Nix package manager](https://nixos.org/). You will need to have Nix installed or install the dependencies with a different package manager.

First of all, in this project's directory open it's Nix shell (with the development dependencies of this project) with

```bash
nix-shell
```

The following sections will have commands to be run in this shell.

## Building

This will install the dependencies required for building:

```bash
npm install
```

This will build the HTML files, etc. into the `build` directory:

```bash
npm run build
```

## Running

### Development

#### Web server

To run the web server ([Caddy](https://caddyserver.com/)) while developing (The web server will only be able to serve files if you [build](#building) before.):

```bash
caddy run
```

#### Database

It won't quite work without also starting the database ([PocketBase](https://pocketbase.io)):

```bash
pocketbase serve
```

though.

On first start, PocketBase will need to be set up:

1. Go to <http://localhost:8090/_/> (PocketBase's web interface) and create an admin account.
2. Under <http://localhost:8090/_/#/settings/import-collections>, import `pb_schema.json`.

### Production

Install `kaufkauflist` from [nixpkgs](https://github.com/NixOS/nixpkgs) to get a release version of kaufkauflist built with the PocketBase schema.

Then you point a web server's root to `/share/kaufkauflist` of the `kaufkauflist` package's derivation (e.g. `/nix/store/apcl8vnmal3kph75miff85d840fxxw4n-kaufkauflist-1.0.0/share/kaufkauflist`) (That's where all the HTML files, etc. are.) and proxy the `/api` of pocketbase to the `/api` of the web server's root.

Take the `Caddyfile` as a guide on what is required from your web server to make this app run. Just choosing Caddy, of course, makes this easier since you can just flesh out the provided `Caddyfile`.

In any case, make sure to include…
- `frame-ancestors 'none';` in the CSP to mitigate click-jacking attacks! Including this in the HTML CSP is not supported.
- a Permissions-Policy header with all empty permissions.

For the database, follow the same steps as in [Database](#database). Make sure to import the `pb_schema.json` from `/share/pocketbase/pb_schema.json` of the `kaufkauflist` package's derivation (e.g. `/nix/store/apcl8vnmal3kph75miff85d840fxxw4n-kaufkauflist-1.0.0/share/pocketbase/pb_schema.json`).

## License

This project is licensed under the MIT license. You can find a copy of it with the copyright holders in the [LICENSE file](LICENSE).
