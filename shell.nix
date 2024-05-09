with (import <nixpkgs> {});

mkShell {
  buildInputs = [
    nodePackages.npm
    nodejs_22
    caddy
    pocketbase
  ];
}
