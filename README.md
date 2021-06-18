# MC LauncherMeta API
A simple microservice that exposes data from the Minecraft LauncherMeta API

[![Endpoint Status](https://img.shields.io/website-up-down-green-red/http/shields.io.svg?label=launchermeta.codemc.org)](https://launchermeta.codemc.org/)

### Environment variables:
- PORT: defaults to 3000
- CACHE_TTL: defaults to 600

### Available endpoints:
- /minecraft/version/latest
- /minecraft/version/latest/[release, snapshot]/
- /minecraft/version/latest/[release, snapshot]/download/[client, client_mappings, server, server_mappings, etc...]
- /minecraft/version/<version id>
- /minecraft/version/<version id>]/download/[client, client_mappings, server, server_mappings, etc...]

### Public endpoint:
The latest version of the microservice is running at https://launchermeta.codemc.io/

### Examples:
- Get the latest release metadata: https://launchermeta.codemc.io/minecraft/version/latest/release
- Download the latest release server mappings: https://launchermeta.codemc.io/minecraft/version/latest/release/download/server_mappings
