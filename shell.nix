{ pkgs ? import <nixpkgs> { } }:
pkgs.stdenv.mkDerivation {
  name = "dev shell";
  packages = [ ];
  shellHook = "";
  buildInputs = [ pkgs.corepack_22 pkgs.deno ];
}
