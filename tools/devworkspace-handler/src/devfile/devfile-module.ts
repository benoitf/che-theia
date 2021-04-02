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
import { DevfileCheTheiaPluginsResolver } from './devfile-che-theia-plugins-resolver';
import { DevfileUpdater } from './devfile-updater';
import { SidecarComponentsCreator } from './sidecar-components-creator';

const devfileModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(CheTheiaComponentFinder).toSelf().inSingletonScope();
  bind(CheTheiaComponentUpdater).toSelf().inSingletonScope();
  bind(DevfileCheTheiaPluginsResolver).toSelf().inSingletonScope();
  bind(DevfileUpdater).toSelf().inSingletonScope();
  bind(SidecarComponentsCreator).toSelf().inSingletonScope();
});

export { devfileModule };
