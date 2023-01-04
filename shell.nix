with (import <nixpkgs> {});

mkShell {
  buildInputs = [
    nodePackages.npm
    caddy
    pocketbase
  ];
}
