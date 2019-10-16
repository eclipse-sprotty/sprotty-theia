## Eclipse Sprotty Change Log (Theia Extension)

This change log covers only the Theia integration of Sprotty. See also the change logs of [sprotty](https://github.com/eclipse/sprotty/blob/master/CHANGELOG.md), [sprotty-server](https://github.com/eclipse/sprotty-server/blob/master/CHANGELOG.md) and [sprotty-layout](https://github.com/eclipse/sprotty-layout/blob/master/CHANGELOG.md).

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
