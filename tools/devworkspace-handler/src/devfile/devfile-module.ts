/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import { ContainerModule, interfaces } from 'inversify';

import { CheTheiaComponentFinder } from './che-theia-component-finder';
import { CheTheiaComponentUpdater } from './che-theia-component-updater';
import { CheTheiaPluginDevContainerMerger } from './che-theia-plugin-devcontainer-merger';
import { CheTheiaPluginSidecarMerger } from './che-theia-plugin-sidecar-merger';
import { ContainerPluginRemoteUpdater } from './container-plugin-remote-updater';
import { DevContainerComponentFinder } from './dev-container-component-finder';
import { DevContainerComponentUpdater } from './dev-container-component-updater';
import { DevWorkspaceUpdater } from './devworkspace-updater';
import { DevfileCheTheiaPluginsResolver } from './devfile-che-theia-plugins-resolver';
import { SidecarComponentsCreator } from './sidecar-components-creator';

const devfileModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(CheTheiaComponentFinder).toSelf().inSingletonScope();
  bind(CheTheiaComponentUpdater).toSelf().inSingletonScope();
  bind(CheTheiaPluginDevContainerMerger).toSelf().inSingletonScope();
  bind(CheTheiaPluginSidecarMerger).toSelf().inSingletonScope();
  bind(ContainerPluginRemoteUpdater).toSelf().inSingletonScope();
  bind(DevContainerComponentFinder).toSelf().inSingletonScope();
  bind(DevContainerComponentUpdater).toSelf().inSingletonScope();
  bind(DevfileCheTheiaPluginsResolver).toSelf().inSingletonScope();
  bind(DevWorkspaceUpdater).toSelf().inSingletonScope();
  bind(SidecarComponentsCreator).toSelf().inSingletonScope();
});

export { devfileModule };
