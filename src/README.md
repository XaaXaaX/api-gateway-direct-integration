# api-gateway-direct-integration!

## App code Scaffolding

The project is based on hexagonal architecture dividing the whole project in 3 parts

    > Core
    > Handelers
    > Infrastructure

### Core

The core contains all domain related context and infrastructure iInterfaces ( Ports )

Domain brings the following parts togather:

    [x] - Entites
    [x] - Enums
    [x] - Services
    [x] - Usecases

#### UseCase

Each Usecase has the exact core structure containing Entities, Services and Ports, this allows us to design the usescases with vertical scaling purpose and make their portability more easy.

### Handlers

The Hadlers and forwarding adapters toward core.
[To find more about handlers have a look at this FileBuilder](src/handlers/FileBuilder/README.md)

### Infrastructure

The Infrastructure has all outside word dependencies as AWS infrastruture knowledge, UnManaged resources, Files, Services and etc... which are not related to Control Plane context.

Theses are the outgoing Adapters toward external resource.
