## Eclipse Sprotty Change Log (Theia Extension)

This change log covers only the Theia integration of Sprotty. See also the change logs of [sprotty](https://github.com/eclipse/sprotty/blob/master/CHANGELOG.md), [sprotty-server](https://github.com/eclipse/sprotty-server/blob/master/CHANGELOG.md) and [sprotty-layout](https://github.com/eclipse/sprotty-layout/blob/master/CHANGELOG.md).

### v0.9.0 (Aug. 2020)

New features:
 * More extensible view initialization ([#63](https://github.com/eclipse/sprotty-theia/pull/63), [#65](https://github.com/eclipse/sprotty-theia/pull/65))

Fixed issues: https://github.com/eclipse/sprotty-theia/milestone/4?closed=1

-----

### v0.8.0 (Apr. 2020)

New features:
 * Focus fixed on activation ([#46](https://github.com/eclipse/sprotty-theia/pull/46)) 
 * Context menu ([#47](https://github.com/eclipse/sprotty-theia/pull/47))
 * Use colors from VSCode theme ([#49]((https://github.com/eclipse/sprotty-theia/pull/49))
 * Upgraded to Theia 1.0.0 ([#56]((https://github.com/eclipse/sprotty-theia/pull/56))
 
Fixed issues: https://github.com/eclipse/sprotty-theia/milestone/3?closed=1

Breaking API changes:
* CSS colors now use VSCode themes instead of Theia variables ([#49]((https://github.com/eclipse/sprotty-theia/pull/49))

-----
 
### v0.7.0 (Oct. 2019)

New features:

 * New service `IDiagramLocker` for blocking certain actions, e.g. when editing is not allowed ([#32](https://github.com/eclipse/sprotty-theia/pull/32))
 * New type `DiagramWidgetFactory` for subclassing `DiagramWidget` through DI ([#43](https://github.com/eclipse/sprotty-theia/pull/43))
 * Selection synchronization between the navigator and the active diagram widget ([#44](https://github.com/eclipse/sprotty-theia/pull/44))

Fixed issues: https://github.com/eclipse/sprotty-theia/milestone/2?closed=1

Breaking API changes:

 * Two different identifiers are now used: `clientId` and `widgetId` ([#30](https://github.com/eclipse/sprotty-theia/pull/30)).

-----

### v0.6.0 (Mar. 2019)

First release of Sprotty with the Eclipse Foundation. The previous repository location was [theia-ide/theia-sprotty](https://github.com/theia-ide/theia-sprotty) (package name: `theia-sprotty`).
