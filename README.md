# sprotty-theia

Glue code for [Sprotty diagrams](https://github.com/eclipse/sprotty) in [Theia](https://theia-ide.org) as [Theia extensions](https://theia-ide.org/docs/authoring_extensions). 
If you want to connect your diagram with a language server, you should rather build a [VS Code extension](https://github.com/eclipse/sprotty-vscode). 


[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/eclipse/sprotty-theia)

The project is built on [ci.eclipse.org/sprotty](https://ci.eclipse.org/sprotty/). Pre-built npm packages available from [npmjs](https://www.npmjs.com/package/sprotty-theia).

The version history is documented in the [CHANGELOG](https://github.com/eclipse/sprotty-theia/blob/master/CHANGELOG.md).

### Version Compatibility

| sprotty-theia | Theia  |
| ------------- | ------ |
| 0.12.0        | >=1.18.0|
| 0.11.0        | 1.18.0 |
| 0.10.0        | 1.18.0 |
| 0.9.0         | 1.4.0  |
| 0.8.0         | 0.15.0 |
| 0.7.0         | 0.11.0 |
| 0.6.0         | 0.4.0  |

## See also

- [sprotty](https://github.com/eclipse/sprotty) &ndash; the client part of the Sprotty framework.
- [sprotty-vscode](https://github.com/eclipse/sprotty-vscode) &ndash; glue code for embedding Sprotty diagrams in VS Code
- [sprotty-server](https://github.com/eclipse/sprotty-server) &ndash; libraries to implement Sprotty diagram servers in Java. Also covers add-in Sprotty diagram support to Xtext-based language servers.
- [sprotty-layout](https://github.com/eclipse/sprotty-layout) &ndash; client-side diagram layout based on the Eclipse Layout Kernel.

## References

- [DSL in the Cloud example](http://github.com/TypeFox/theia-xtext-sprotty-example) an example using Xtext, Theia and Sprotty to create a DSL workbench in the cloud.
